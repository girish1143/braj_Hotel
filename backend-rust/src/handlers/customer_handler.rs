use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use serde_json::{json, Value};
use std::sync::{Arc, RwLock};

use crate::models::{CreateCustomerDto, Customer};
use crate::state::AppState;

pub async fn list_customers(State(state): State<Arc<RwLock<AppState>>>) -> Json<Value> {
    let st = state.read().unwrap();
    Json(json!({
        "success": true,
        "count": st.customers.len(),
        "data": st.customers
    }))
}

pub async fn create_customer(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateCustomerDto>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    let id = format!("cust-{}", Utc::now().timestamp_millis());

    let customer = Customer {
        id: id.clone(),
        name: payload.name.clone(),
        phone: payload.phone,
        email: payload.email,
        total_bookings: 0,
        total_spending: 0.0,
        last_booking: "None".into(),
        account_status: "Active".into(),
    };

    st.customers.insert(0, customer.clone());
    st.log_audit(
        "Booking Manager",
        "CUSTOMER_CREATED",
        "Customer Management",
        &id,
        &format!("Created customer profile for '{}'", payload.name),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(json!({ "success": true, "message": "Customer created", "data": customer })),
    )
}

pub async fn get_customer_details(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let st = state.read().unwrap();
    if let Some(c) = st.customers.iter().find(|cust| cust.id == id) {
        let customer_bookings: Vec<_> = st
            .bookings
            .iter()
            .filter(|b| b.customer_phone == c.phone || b.customer_email == c.email)
            .cloned()
            .collect();

        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "data": c,
                "bookings": customer_bookings
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Customer not found" })),
        )
    }
}

pub async fn delete_customer(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut st = state.write().unwrap();
    let initial_len = st.customers.len();
    st.customers.retain(|c| c.id != id);

    if st.customers.len() < initial_len {
        st.log_audit(
            "Booking Manager",
            "CUSTOMER_DELETED",
            "Customer Management",
            &id,
            &format!("Deleted customer id '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Customer deleted" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Customer not found" })),
        )
    }
}
