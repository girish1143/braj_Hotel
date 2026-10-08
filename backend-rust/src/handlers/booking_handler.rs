use crate::models::{Booking, BookingStatusDto, CreateBookingDto};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::json;
use std::sync::{Arc, RwLock};

#[derive(Debug, Deserialize)]
pub struct BookingQuery {
    #[serde(rename = "serviceType")]
    pub service_type: Option<String>,
    pub status: Option<String>,
    pub search: Option<String>,
}

pub async fn get_bookings(
    State(state): State<Arc<RwLock<AppState>>>,
    Query(query): Query<BookingQuery>,
) -> impl IntoResponse {
    let st = state.read().unwrap();
    let mut bookings = st.bookings.clone();

    if let Some(stype) = query.service_type {
        if !stype.is_empty() && stype.to_lowercase() != "all" {
            bookings.retain(|b| b.service_type.eq_ignore_ascii_case(&stype));
        }
    }

    if let Some(status) = query.status {
        if !status.is_empty() && status.to_lowercase() != "all" {
            bookings.retain(|b| b.status.eq_ignore_ascii_case(&status));
        }
    }

    if let Some(search) = query.search {
        let term = search.to_lowercase();
        bookings.retain(|b| {
            b.id.to_lowercase().contains(&term)
                || b.customer_name.to_lowercase().contains(&term)
                || b.property_name.to_lowercase().contains(&term)
                || b.customer_phone.contains(&term)
        });
    }

    Json(json!({
        "success": true,
        "total": bookings.len(),
        "data": bookings
    }))
}

pub async fn create_booking(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateBookingDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let id = format!("BK-{}", Utc::now().timestamp_millis());

    let booking = Booking {
        id: id.clone(),
        booking_id: id.clone(),
        booking_reference: id.clone(),
        customer_name: payload.customer_name.clone(),
        customer_phone: payload.customer_phone.clone(),
        customer_email: payload.customer_email.unwrap_or_else(|| "guest@brijnidhi.org".into()),
        guest_name: payload.customer_name.clone(),
        guest_phone: payload.customer_phone.clone(),
        guest_email: "guest@brijnidhi.org".into(),
        service_type: payload.service_type.clone(),
        property_id: payload.property_id.clone(),
        property_name: payload.property_name.clone(),
        hotel_id: payload.property_id.clone(),
        hotel_name: payload.property_name.clone(),
        room_id: "default-room".into(),
        room_name: "Standard Suite".into(),
        booking_date: Utc::now().format("%d %b %Y").to_string(),
        check_in: payload.check_in,
        check_out: payload.check_out,
        amount: payload.amount,
        grand_total: payload.amount,
        payment_status: payload.payment_status.unwrap_or_else(|| "Paid".into()),
        status: payload.status.unwrap_or_else(|| "Confirmed".into()),
        created_at: Utc::now().format("%d %b %Y, %I:%M %p").to_string(),
    };

    st.bookings.insert(0, booking.clone());
    st.log_audit(
        "Booking Manager",
        "BOOKING_CREATED",
        "Booking Management",
        &id,
        &format!("Created booking for '{}' at '{}'", booking.customer_name, booking.property_name),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(json!({ "success": true, "message": "Booking created successfully", "data": booking })),
    )
}

pub async fn update_booking_status(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<BookingStatusDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let new_status = payload.status.unwrap_or_else(|| "Confirmed".into());
    if let Some(bk) = st.bookings.iter_mut().find(|b| b.id == id || b.booking_id == id) {
        bk.status = new_status.clone();
        let updated = bk.clone();
        st.log_audit(
            "Booking Manager",
            "BOOKING_STATUS_CHANGED",
            "Booking Management",
            &id,
            &format!("Updated booking '{}' status to {}", id, new_status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": format!("Booking status updated to {}", new_status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Booking not found" })),
        )
    }
}

pub async fn delete_booking(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.bookings.iter().position(|b| b.id == id || b.booking_id == id) {
        let removed = st.bookings.remove(idx);
        st.log_audit(
            "Booking Manager",
            "BOOKING_CANCELLED",
            "Booking Management",
            &id,
            &format!("Deleted/cancelled booking '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Booking removed", "data": removed })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Booking not found" })),
        )
    }
}
