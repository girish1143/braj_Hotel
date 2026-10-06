use crate::models::PlatformSettings;
use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use serde::Deserialize;
use std::sync::{Arc, RwLock};

pub async fn get_settings(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "data": st.settings
    }))
}

pub async fn update_settings(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<PlatformSettings>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    st.settings = payload.clone();
    st.log_audit(
        "Project Owner",
        "SETTINGS_UPDATED",
        "Settings",
        "platform-config",
        &format!(
            "Updated platform settings: Commission {}%, Notice Enabled: {}",
            payload.platform_commission_pct, payload.sacred_notice_enabled
        ),
        "127.0.0.1",
    );
    Json(serde_json::json!({
        "success": true,
        "message": "Platform settings updated successfully.",
        "data": payload
    }))
}

pub async fn get_public_notice(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "data": {
            "text": st.settings.sacred_notice_text,
            "enabled": st.settings.sacred_notice_enabled,
            "supportPhone": st.settings.support_phone
        }
    }))
}

#[derive(Debug, Deserialize)]
pub struct BroadcastNoticeDto {
    pub text: String,
    pub enabled: Option<bool>,
}

pub async fn broadcast_notice(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<BroadcastNoticeDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    st.settings.sacred_notice_text = payload.text.clone();
    if let Some(en) = payload.enabled {
        st.settings.sacred_notice_enabled = en;
    }
    let updated = st.settings.clone();
    st.log_audit(
        "Project Owner",
        "SACRED_NOTICE_BROADCAST",
        "Settings",
        "notice-banner",
        &format!("Broadcasted new sacred notice: '{}'", payload.text),
        "127.0.0.1",
    );
    Json(serde_json::json!({
        "success": true,
        "message": "Sacred notice broadcasted across Brijnidhi.",
        "data": updated
    }))
}
