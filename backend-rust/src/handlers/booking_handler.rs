use crate::models::BookingStatusDto;
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::{Arc, RwLock};

pub async fn get_bookings(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bookings.len(),
        "data": st.bookings
    }))
}

pub async fn update_booking_status(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<BookingStatusDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let new_status = payload.status.unwrap_or_else(|| "CONFIRMED".into());
    if let Some(bk) = st.bookings.iter_mut().find(|b| b.id == id) {
        bk.status = new_status.clone();
        let updated = bk.clone();
        st.log_audit(
            "Project Owner",
            "BOOKING_STATUS_CHANGED",
            "Booking",
            &id,
            &format!("Updated booking reference '{}' status to {}", updated.booking_reference, new_status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Booking status updated to {}", new_status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Booking not found" })),
        )
    }
}

pub async fn delete_booking(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.bookings.iter().position(|b| b.id == id) {
        let removed = st.bookings.remove(idx);
        st.log_audit(
            "Project Owner",
            "BOOKING_DELETED",
            "Booking",
            &id,
            &format!("Deleted stay booking reference '{}'", removed.booking_reference),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Booking permanently deleted."
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Booking not found" })),
        )
    }
}
