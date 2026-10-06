use crate::models::{BhojanReservation, BhojanStatusDto, Bhojanalaya};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use std::sync::{Arc, RwLock};

pub async fn get_bhojan(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bhojanalayas.len(),
        "data": st.bhojanalayas
    }))
}

pub async fn create_bhojan(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(mut payload): Json<Bhojanalaya>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if payload.id.is_empty() {
        payload.id = format!("bhojan-{}", Utc::now().timestamp_millis());
    }
    if payload.slug.is_empty() {
        payload.slug = payload.name.to_lowercase().replace(' ', "-");
    }
    if payload.destination_name.is_empty() {
        payload.destination_name = match payload.destination_slug.as_str() {
            "mathura" => "Mathura".into(),
            "barsana" => "Barsana".into(),
            "govardhan" => "Govardhan".into(),
            _ => "Vrindavan".into(),
        };
    }
    let saved = payload.clone();
    st.bhojanalayas.insert(0, payload);
    st.log_audit(
        "Project Owner",
        "BHOJAN_ADDED",
        "Bhojanalaya",
        &saved.id,
        &format!("Added new bhojan spot '{}' in {}", saved.name, saved.destination_name),
        "127.0.0.1",
    );
    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("Bhojanalaya '{}' created successfully.", saved.name),
            "data": saved
        })),
    )
}

pub async fn update_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<Bhojanalaya>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(item) = st.bhojanalayas.iter_mut().find(|b| b.id == id) {
        *item = payload;
        item.id = id.clone();
        let updated = item.clone();
        st.log_audit(
            "Project Owner",
            "BHOJAN_UPDATED",
            "Bhojanalaya",
            &id,
            &format!("Updated bhojan spot '{}' details and pricing", updated.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Bhojanalaya '{}' updated successfully.", updated.name),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

pub async fn delete_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.bhojanalayas.iter().position(|b| b.id == id) {
        let removed = st.bhojanalayas.remove(idx);
        st.log_audit(
            "Project Owner",
            "BHOJAN_DELETED",
            "Bhojanalaya",
            &id,
            &format!("Deleted bhojan spot '{}'", removed.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Bhojanalaya deleted successfully."
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

pub async fn toggle_status_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<BhojanStatusDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(b) = st.bhojanalayas.iter_mut().find(|x| x.id == id) {
        b.status = payload.status.unwrap_or_else(|| {
            if b.status == "APPROVED" {
                "SUSPENDED".into()
            } else {
                "APPROVED".into()
            }
        });
        let updated = b.clone();
        st.log_audit(
            "Project Owner",
            "BHOJAN_STATUS_TOGGLE",
            "Bhojanalaya",
            &id,
            &format!("Toggled status of '{}' to {}", updated.name, updated.status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Status updated to {}", updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

pub async fn get_bhojan_reservations(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bhojan_reservations.len(),
        "data": st.bhojan_reservations
    }))
}

pub async fn reserve_bhojan(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(mut res): Json<BhojanReservation>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if res.id.is_empty() {
        res.id = format!("res-bhojan-{}", Utc::now().timestamp_millis());
    }
    if res.created_at.is_empty() {
        res.created_at = Utc::now().format("%d %b %Y, %I:%M %p").to_string();
    }
    let saved = res.clone();
    st.bhojan_reservations.insert(0, res);
    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": "Thali reservation token generated successfully.",
            "data": saved
        })),
    )
}
