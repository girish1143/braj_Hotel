use crate::state::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use chrono::Utc;
use serde::Deserialize;
use std::sync::{Arc, RwLock};

#[derive(Debug, Deserialize)]
pub struct AuthRequest {
    pub passcode: Option<String>,
    pub email: Option<String>,
}

pub async fn admin_auth_verify(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(body): Json<AuthRequest>,
) -> impl IntoResponse {
    let valid_keys = ["Brijnidhi@Admin2026", "1082026", "RadheAdmin#2026"];
    let provided = body.passcode.unwrap_or_default().trim().to_string();

    if valid_keys.contains(&provided.as_str()) {
        let mut st = state.write().unwrap();
        let token = format!("brijnidhi_admin_sec_token_{}", Utc::now().timestamp_millis());
        st.log_audit(
            "Girish Sharma",
            "ADMIN_LOGIN_SUCCESS",
            "Security",
            "usr-1",
            "Project Owner authenticated successfully to Brijnidhi Command Center via Rust Engine",
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Admin security verification passed. Welcome, Project Owner!",
                "token": token,
                "admin": {
                    "id": "usr-1",
                    "name": "Girish Sharma",
                    "email": body.email.unwrap_or_else(|| "admin@brijnidhi.org".into()),
                    "role": "SYSTEM_ADMIN"
                }
            })),
        )
    } else {
        let mut st = state.write().unwrap();
        st.log_audit(
            "Unknown Entity",
            "ADMIN_LOGIN_FAILED",
            "Security",
            "security-gate",
            "Failed admin authentication attempt in Rust backend",
            "127.0.0.1",
        );

        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({
                "success": false,
                "message": "Invalid Admin Security Passcode. Access denied."
            })),
        )
    }
}
