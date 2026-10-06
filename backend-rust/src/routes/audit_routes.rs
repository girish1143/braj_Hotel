use crate::handlers::audit_handler::get_audit_logs;
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn audit_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new().route("/", get(get_audit_logs))
}
