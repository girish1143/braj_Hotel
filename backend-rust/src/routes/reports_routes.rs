use crate::handlers::reports_handler::get_reports;
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn reports_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new().route("/reports", get(get_reports))
}
