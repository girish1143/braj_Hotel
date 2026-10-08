use crate::handlers::coupon_handler::{create_coupon, delete_coupon, list_coupons};
use crate::state::AppState;
use axum::{routing::get, Router};
use std::sync::{Arc, RwLock};

pub fn coupon_routes() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .route("/coupons", get(list_coupons).post(create_coupon))
        .route("/coupons/:id", axum::routing::delete(delete_coupon))
}
