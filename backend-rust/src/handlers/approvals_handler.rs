use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::{Arc, RwLock};

// Returns all items in the Approvals Queue
pub async fn get_pending_approvals(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    let pending_hotels: Vec<_> = st
        .hotels
        .iter()
        .filter(|h| h.status == "SUBMITTED" || h.status == "UNDER_REVIEW")
        .cloned()
        .collect();

    let pending_bhojan: Vec<_> = st
        .bhojanalayas
        .iter()
        .filter(|b| b.status == "SUBMITTED" || b.status == "UNDER_REVIEW")
        .cloned()
        .collect();

    let total = pending_hotels.len() + pending_bhojan.len();

    Json(serde_json::json!({
        "success": true,
        "total": total,
        "data": {
            "hotels": pending_hotels,
            "bhojanalayas": pending_bhojan
        }
    }))
}

// 1-Click Approval from Approvals Queue
pub async fn approve_queue_item(
    Path((item_type, id)): Path<(String, String)>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    match item_type.as_str() {
        "hotel" => {
            if let Some(h) = st.hotels.iter_mut().find(|h| h.id == id) {
                h.status = "APPROVED".into();
                h.documents_verified = true;
                let name = h.name.clone();
                st.log_audit(
                    "Project Owner",
                    "QUEUE_HOTEL_APPROVED",
                    "Approvals Queue",
                    &id,
                    &format!("Approved property '{}' from queue", name),
                    "127.0.0.1",
                );
                (
                    StatusCode::OK,
                    Json(serde_json::json!({
                        "success": true,
                        "message": format!("Property '{}' approved and published to live catalog.", name)
                    })),
                )
            } else {
                (
                    StatusCode::NOT_FOUND,
                    Json(serde_json::json!({ "success": false, "message": "Hotel not found in queue" })),
                )
            }
        }
        "bhojan" => {
            if let Some(b) = st.bhojanalayas.iter_mut().find(|b| b.id == id) {
                b.status = "APPROVED".into();
                let name = b.name.clone();
                st.log_audit(
                    "Project Owner",
                    "QUEUE_BHOJAN_APPROVED",
                    "Approvals Queue",
                    &id,
                    &format!("Approved bhojan spot '{}' from queue", name),
                    "127.0.0.1",
                );
                (
                    StatusCode::OK,
                    Json(serde_json::json!({
                        "success": true,
                        "message": format!("Bhojanalaya '{}' approved and published.", name)
                    })),
                )
            } else {
                (
                    StatusCode::NOT_FOUND,
                    Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found in queue" })),
                )
            }
        }
        _ => (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "success": false, "message": "Invalid item type" })),
        ),
    }
}
