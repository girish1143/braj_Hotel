use crate::handlers::customer_handler::{
    create_customer, delete_customer, get_customer_details, list_customers,
};
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn customer_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/customers", get(list_customers).post(create_customer))
        .route(
            "/customers/:id",
            get(get_customer_details).delete(delete_customer),
        )
}
