use crate::models::{AdminUser, CreateUserDto, UpdateUserRoleDto};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use std::sync::{Arc, RwLock};

pub async fn get_users(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.users.len(),
        "data": st.users
    }))
}

pub async fn create_user(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateUserDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let new_user = AdminUser {
        id: format!("usr-{}", Utc::now().timestamp_millis()),
        name: payload.name.trim().to_string(),
        email: payload.email.trim().to_lowercase(),
        role: payload.role,
        status: "ACTIVE".into(),
        joined: Utc::now().format("%d %b %Y").to_string(),
    };
    st.users.insert(0, new_user.clone());
    st.log_audit(
        "Project Owner",
        "USER_CREATED",
        "User",
        &new_user.id,
        &format!("Created staff/devotee account {}", new_user.email),
        "127.0.0.1",
    );
    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("User '{}' created successfully.", new_user.name),
            "data": new_user
        })),
    )
}

pub async fn update_user_role(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<UpdateUserRoleDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(user) = st.users.iter_mut().find(|u| u.id == id) {
        user.role = payload.role.clone();
        let updated = user.clone();
        st.log_audit(
            "Project Owner",
            "USER_ROLE_CHANGED",
            "User",
            &id,
            &format!("Changed role of {} to {}", updated.email, payload.role),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User role updated to {}", payload.role),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}

pub async fn toggle_suspend_user(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(user) = st.users.iter_mut().find(|u| u.id == id) {
        user.status = if user.status == "SUSPENDED" {
            "ACTIVE".into()
        } else {
            "SUSPENDED".into()
        };
        let updated = user.clone();
        st.log_audit(
            "Project Owner",
            "USER_STATUS_TOGGLE",
            "User",
            &id,
            &format!("Toggled status of {} to {}", updated.email, updated.status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User status updated to {}", updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}

pub async fn delete_user(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.users.iter().position(|u| u.id == id) {
        let removed = st.users.remove(idx);
        st.log_audit(
            "Project Owner",
            "USER_DELETED",
            "User",
            &id,
            &format!("Deleted user account {}", removed.email),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User '{}' removed.", removed.name)
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}
