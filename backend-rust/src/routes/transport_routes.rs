use crate::handlers::transport_handler::{
    assign_vehicle, create_driver, delete_driver, list_drivers, list_vehicles,
    toggle_driver_status,
};
use crate::state::AppState;
use axum::{
    routing::{get, post},
    Router,
};
use std::sync::{Arc, RwLock};

pub fn transport_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/transport/vehicles", get(list_vehicles))
        .route("/transport/drivers", get(list_drivers).post(create_driver))
        .route("/transport/drivers/:id", axum::routing::delete(delete_driver))
        .route("/transport/drivers/:id/assign", post(assign_vehicle))
        .route(
            "/transport/drivers/:id/toggle-status",
            post(toggle_driver_status),
        )
}
