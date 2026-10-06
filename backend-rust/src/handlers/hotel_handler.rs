use crate::models::{AdminHotel, CreateHotelDto, RejectHotelDto};
use crate::state::AppState;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use std::sync::{Arc, RwLock};

pub async fn get_hotels(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "count": st.hotels.len(),
        "data": st.hotels
    }))
}

pub async fn create_hotel(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateHotelDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let id = format!("prop-{}", Utc::now().timestamp_millis());
    let slug = payload.name.to_lowercase().replace(' ', "-");
    let dest_name = match payload.destination_slug.as_str() {
        "mathura" => "Mathura",
        "barsana" => "Barsana",
        "govardhan" => "Govardhan",
        _ => "Vrindavan",
    };
    let status = payload.status.unwrap_or_else(|| "APPROVED".to_string());

    let hotel = AdminHotel {
        id: id.clone(),
        name: payload.name.clone(),
        slug,
        destination_slug: payload.destination_slug,
        destination_name: dest_name.to_string(),
        stay_type: payload.stay_type,
        price_per_night: payload.price_per_night,
        status: status.clone(),
        owner_name: payload.owner_name,
        owner_email: payload.owner_email,
        owner_phone: None,
        submitted_at: Utc::now().format("%d %b %Y").to_string(),
        documents_verified: status == "APPROVED",
        trade_license_no: None,
        fssai_license_no: None,
        nearest_landmark: payload.nearest_landmark,
        address: payload.address,
        pure_satvik_kitchen: payload.pure_satvik_kitchen,
        temple_darshan_assistance: payload.temple_darshan_assistance,
    };

    st.hotels.insert(0, hotel.clone());
    st.log_audit(
        "Project Owner",
        "HOTEL_ADDED",
        "Hotel",
        &id,
        &format!("Added new hotel '{}' in {}", payload.name, dest_name),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("Hotel '{}' created successfully.", payload.name),
            "data": hotel
        })),
    )
}

pub async fn update_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        if let Some(name) = payload.get("name").and_then(|v| v.as_str()) {
            hotel.name = name.to_string();
        }
        if let Some(price) = payload.get("pricePerNight").and_then(|v| v.as_f64()) {
            hotel.price_per_night = price;
        }
        if let Some(stay_type) = payload.get("stayType").and_then(|v| v.as_str()) {
            hotel.stay_type = stay_type.to_string();
        }
        if let Some(dest) = payload.get("destinationSlug").and_then(|v| v.as_str()) {
            hotel.destination_slug = dest.to_string();
            hotel.destination_name = match dest {
                "mathura" => "Mathura".into(),
                "barsana" => "Barsana".into(),
                "govardhan" => "Govardhan".into(),
                _ => "Vrindavan".into(),
            };
        }
        if let Some(landmark) = payload.get("nearestLandmark").and_then(|v| v.as_str()) {
            hotel.nearest_landmark = Some(landmark.to_string());
        }
        if let Some(addr) = payload.get("address").and_then(|v| v.as_str()) {
            hotel.address = Some(addr.to_string());
        }

        let updated = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_UPDATED",
            "Hotel",
            &id,
            &format!("Updated hotel '{}' details and pricing", updated.name),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Hotel '{}' updated successfully.", updated.name),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

pub async fn delete_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.hotels.iter().position(|h| h.id == id) {
        let removed = st.hotels.remove(idx);
        st.log_audit(
            "Project Owner",
            "HOTEL_DELETED",
            "Hotel",
            &id,
            &format!("Deleted hotel '{}' from platform", removed.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' was permanently deleted.", removed.name),
                "data": removed
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

pub async fn approve_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = "APPROVED".into();
        hotel.documents_verified = true;
        let approved = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_APPROVED",
            "Hotel",
            &id,
            &format!("Approved property '{}' into live Brijnidhi catalog", approved.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' has been APPROVED and is now LIVE.", approved.name),
                "data": approved
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

pub async fn reject_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<RejectHotelDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = "REJECTED".into();
        let rejected = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_REJECTED",
            "Hotel",
            &id,
            &format!("Rejected property '{}'. Reason: {:?}", rejected.name, payload.reason),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' has been REJECTED.", rejected.name),
                "data": rejected
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

pub async fn toggle_suspend_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = if hotel.status == "SUSPENDED" {
            "APPROVED".into()
        } else {
            "SUSPENDED".into()
        };
        let updated = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_SUSPENDED_TOGGLE",
            "Hotel",
            &id,
            &format!("Toggled status of '{}' to {}", updated.name, updated.status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' status is now {}.", updated.name, updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}
