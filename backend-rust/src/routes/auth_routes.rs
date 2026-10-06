use crate::handlers::auth_handler::admin_auth_verify;
use crate::state::AppState;
use axum::{routing::post, Router};
use std::sync::{Arc, RwLock};

pub fn auth_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new().route("/verify", post(admin_auth_verify))
}
