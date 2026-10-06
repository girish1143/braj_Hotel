use crate::handlers::hotel_handler::{
    approve_hotel, create_hotel, delete_hotel, get_hotels, reject_hotel, toggle_suspend_hotel,
    update_hotel,
};
use crate::state::AppState;
use axum::{
    routing::{get, patch, put},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn hotel_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_hotels).post(create_hotel))
        .route("/:id", put(update_hotel).delete(delete_hotel))
        .route("/:id/approve", patch(approve_hotel))
        .route("/:id/reject", patch(reject_hotel))
        .route("/:id/suspend", patch(toggle_suspend_hotel))
}
