use crate::handlers::booking_handler::{delete_booking, get_bookings, update_booking_status};
use crate::state::AppState;
use axum::{
    routing::{get, patch},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn booking_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_bookings))
        .route("/:id/status", patch(update_booking_status))
        .route("/:id", axum::routing::delete(delete_booking))
}
