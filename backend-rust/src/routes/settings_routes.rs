use crate::handlers::settings_handler::{broadcast_notice, get_public_notice, get_settings, update_settings};
use crate::state::AppState;
use axum::{
    routing::{get, post, put},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn settings_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/settings", get(get_settings).put(update_settings))
        .route("/public-notice", get(get_public_notice))
        .route("/broadcast-notice", post(broadcast_notice))
}
