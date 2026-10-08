use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde_json::{json, Value};
use std::sync::{Arc, RwLock};

use crate::models::UpdateReviewStatusDto;
use crate::state::AppState;

pub async fn list_reviews(State(state): State<Arc<RwLock<AppState>>>) -> Json<Value> {
    let st = state.read().unwrap();
    Json(json!({
        "success": true,
        "count": st.reviews.len(),
        "data": st.reviews
    }))
}

pub async fn update_review_status(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateReviewStatusDto>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    if let Some(rev) = st.reviews.iter_mut().find(|r| r.id == id) {
        rev.status = payload.status.clone();
        st.log_audit(
            "Property Manager",
            "REVIEW_STATUS_UPDATED",
            "Review Management",
            &id,
            &format!("Updated review '{}' status to {}", id, payload.status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": format!("Review marked as {}", payload.status) })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Review not found" })),
        )
    }
}

pub async fn delete_review(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    let initial_len = st.reviews.len();
    st.reviews.retain(|r| r.id != id);

    if st.reviews.len() < initial_len {
        st.log_audit(
            "Property Manager",
            "REVIEW_DELETED",
            "Review Management",
            &id,
            &format!("Deleted review id '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Review deleted" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Review not found" })),
        )
    }
}
