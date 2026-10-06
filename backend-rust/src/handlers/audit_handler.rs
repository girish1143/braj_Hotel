use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use std::sync::{Arc, RwLock};

pub async fn get_audit_logs(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "count": st.audit_logs.len(),
        "data": st.audit_logs
    }))
}
