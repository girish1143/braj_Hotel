use crate::handlers::bhojan_handler::{
    create_bhojan, delete_bhojan, get_bhojan, get_bhojan_reservations, reserve_bhojan,
    toggle_status_bhojan, update_bhojan,
};
use crate::state::AppState;
use axum::{
    routing::{get, patch, post, put},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn bhojan_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_bhojan).post(create_bhojan))
        .route("/:id", put(update_bhojan).delete(delete_bhojan))
        .route("/:id/status", patch(toggle_status_bhojan))
        .route("/reservations", get(get_bhojan_reservations))
        .route("/reserve", post(reserve_bhojan))
}
