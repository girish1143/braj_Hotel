use crate::handlers::payment_handler::{get_payments, refund_payment};
use crate::state::AppState;
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn payment_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_payments))
        .route("/:id/refund", post(refund_payment))
}
