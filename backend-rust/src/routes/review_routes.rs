use crate::handlers::review_handler::{delete_review, list_reviews, update_review_status};
use crate::state::AppState;
use axum::{
    routing::{get, put},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn review_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/reviews", get(list_reviews))
        .route(
            "/reviews/:id",
            put(update_review_status).delete(delete_review),
        )
}
