use crate::handlers::approvals_handler::{approve_queue_item, get_pending_approvals};
use crate::state::AppState;
use axum::{
    routing::{get, patch},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn approvals_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_pending_approvals))
        .route("/:item_type/:id/approve", patch(approve_queue_item))
}
