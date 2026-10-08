use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use serde_json::{json, Value};
use std::sync::{Arc, RwLock};

use crate::models::{Coupon, CreateCouponDto};
use crate::state::AppState;

pub async fn list_coupons(State(state): State<Arc<RwLock<AppState>>>) -> Json<Value> {
    let st = state.read().unwrap();
    Json(json!({
        "success": true,
        "count": st.coupons.len(),
        "data": st.coupons
    }))
}

pub async fn create_coupon(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateCouponDto>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    let id = format!("cpn-{}", Utc::now().timestamp_millis());

    let coupon = Coupon {
        id: id.clone(),
        coupon_code: payload.coupon_code.to_uppercase(),
        discount_type: payload.discount_type,
        discount_value: payload.discount_value,
        min_booking_amount: payload.min_booking_amount.unwrap_or(0.0),
        max_discount: payload.max_discount.unwrap_or(1000.0),
        start_date: payload.start_date,
        end_date: payload.end_date,
        usage_limit: payload.usage_limit.unwrap_or(100),
        usage_count: 0,
        property_id: payload.property_id,
        property_name: payload.property_name,
        status: "Active".into(),
    };

    st.coupons.insert(0, coupon.clone());
    st.log_audit(
        "Super Admin",
        "COUPON_CREATED",
        "Offers & Discounts",
        &id,
        &format!("Created coupon '{}'", coupon.coupon_code),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(json!({ "success": true, "message": "Coupon created successfully", "data": coupon })),
    )
}

pub async fn delete_coupon(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    let initial_len = st.coupons.len();
    st.coupons.retain(|c| c.id != id);

    if st.coupons.len() < initial_len {
        st.log_audit(
            "Super Admin",
            "COUPON_DELETED",
            "Offers & Discounts",
            &id,
            &format!("Deleted coupon id '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Coupon deleted" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Coupon not found" })),
        )
    }
}
