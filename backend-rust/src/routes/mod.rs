pub mod approvals_routes;
pub mod audit_routes;
pub mod auth_routes;
pub mod bhojan_routes;
pub mod booking_routes;
pub mod coupon_routes;
pub mod customer_routes;
pub mod hotel_routes;
pub mod overview_routes;
pub mod payment_routes;
pub mod property_routes;
pub mod reports_routes;
pub mod review_routes;
pub mod settings_routes;
pub mod transport_routes;
pub mod user_routes;

use crate::state::AppState;
use axum::Router;
use std::sync::{Arc, RwLock};

pub fn admin_router() -> Router<Arc<RwLock<AppState>>> {
    Router::new()
        .nest("/auth", auth_routes::auth_routes())
        .nest("/overview", overview_routes::overview_routes())
        .merge(property_routes::property_routes())
        .merge(transport_routes::transport_routes())
        .merge(customer_routes::customer_routes())
        .merge(review_routes::review_routes())
        .merge(coupon_routes::coupon_routes())
        .merge(reports_routes::reports_routes())
        .nest("/hotels", hotel_routes::hotel_routes())
        .nest("/bhojan", bhojan_routes::bhojan_routes())
        .nest("/bookings", booking_routes::booking_routes())
        .nest("/approvals", approvals_routes::approvals_routes())
        .nest("/users", user_routes::user_routes())
        .merge(settings_routes::settings_routes())
        .nest("/payments", payment_routes::payment_routes())
        .nest("/audit-logs", audit_routes::audit_routes())
}
