use crate::handlers::overview_handler::get_overview;
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn overview_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new().route("/", get(get_overview))
}
