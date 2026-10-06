use crate::handlers::user_handler::{
    create_user, delete_user, get_users, toggle_suspend_user, update_user_role,
};
use crate::state::AppState;
use axum::{
    routing::{get, patch},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn user_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/", get(get_users).post(create_user))
        .route("/:id/role", patch(update_user_role))
        .route("/:id/suspend", patch(toggle_suspend_user))
        .route("/:id", axum::routing::delete(delete_user))
}
