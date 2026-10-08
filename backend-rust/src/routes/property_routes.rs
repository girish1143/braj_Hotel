use crate::handlers::property_handler::{
    approve_property, create_property, delete_property, get_property, list_properties,
    reject_property, toggle_property_status, update_property,
};
use crate::state::AppState;
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn property_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/properties", get(list_properties).post(create_property))
        .route(
            "/properties/:id",
            get(get_property)
                .put(update_property)
                .delete(delete_property),
        )
        .route("/properties/:id/approve", post(approve_property))
        .route("/properties/:id/reject", post(reject_property))
        .route("/properties/:id/toggle-status", post(toggle_property_status))
}
