use crate::handlers::payment_handler::get_payments;
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn payment_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new().route("/", get(get_payments))
}
