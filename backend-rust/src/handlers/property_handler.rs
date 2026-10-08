use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::{json, Value};
use std::sync::{Arc, RwLock};

use crate::models::{CreatePropertyDto, Property, RejectPropertyDto};
use crate::state::AppState;

#[derive(Debug, Deserialize)]
pub struct PropertyQuery {
    #[serde(rename = "propertyType")]
    pub property_type: Option<String>,
    pub status: Option<String>,
    pub search: Option<String>,
    pub sort: Option<String>,
}

pub async fn list_properties(
    State(state): State<Arc<RwLock<AppState>>>,
    Query(query): Query<PropertyQuery>,
) -> Json<Value> {
    let state_read = state.read().unwrap();
    let mut properties = state_read.properties.clone();

    // Filter by property type
    if let Some(ptype) = query.property_type {
        if !ptype.is_empty() && ptype.to_lowercase() != "all" {
            properties.retain(|p| p.property_type.eq_ignore_ascii_case(&ptype));
        }
    }

    // Filter by status
    if let Some(status) = query.status {
        if !status.is_empty() && status.to_lowercase() != "all" {
            properties.retain(|p| p.status.eq_ignore_ascii_case(&status));
        }
    }

    // Filter by search query
    if let Some(search) = query.search {
        let term = search.to_lowercase();
        properties.retain(|p| {
            p.name.to_lowercase().contains(&term)
                || p.city.to_lowercase().contains(&term)
                || p.owner_name.to_lowercase().contains(&term)
                || p.property_type.to_lowercase().contains(&term)
        });
    }

    // Sort
    if let Some(sort) = query.sort {
        match sort.as_str() {
            "name_asc" => properties.sort_by(|a, b| a.name.cmp(&b.name)),
            "name_desc" => properties.sort_by(|a, b| b.name.cmp(&a.name)),
            "revenue_desc" => properties.sort_by(|a, b| {
                b.total_revenue
                    .partial_cmp(&a.total_revenue)
                    .unwrap_or(std::cmp::Ordering::Equal)
            }),
            "rating_desc" => properties.sort_by(|a, b| {
                b.rating
                    .partial_cmp(&a.rating)
                    .unwrap_or(std::cmp::Ordering::Equal)
            }),
            _ => {}
        }
    }

    Json(json!({
        "success": true,
        "count": properties.len(),
        "data": properties
    }))
}

pub async fn get_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let state_read = state.read().unwrap();
    if let Some(prop) = state_read.properties.iter().find(|p| p.id == id) {
        (StatusCode::OK, Json(json!({ "success": true, "data": prop })))
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}

pub async fn create_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreatePropertyDto>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();

    let id = format!("prop-{}", Utc::now().timestamp_millis());
    let slug = payload
        .name
        .to_lowercase()
        .replace(' ', "-")
        .replace(|c: char| !c.is_alphanumeric() && c != '-', "");

    let new_property = Property {
        id: id.clone(),
        name: payload.name.clone(),
        slug,
        property_type: payload.property_type.clone(),
        description: payload.description.unwrap_or_default(),
        owner_name: payload.owner_name.unwrap_or_else(|| "Braj Seva Partner".into()),
        contact_number: payload.contact_number.unwrap_or_else(|| "+91 98765 00000".into()),
        email: payload.email.unwrap_or_else(|| "owner@brijnidhi.org".into()),
        website: payload.website,
        status: payload.status.unwrap_or_else(|| "PENDING".into()).to_uppercase(),
        rejection_reason: None,
        rating: 5.0,
        total_bookings: 0,
        total_revenue: 0.0,
        created_date: Utc::now().format("%d %b %Y").to_string(),
        address: payload.address.unwrap_or_else(|| "Vrindavan, Mathura".into()),
        city: payload.city.unwrap_or_else(|| "Vrindavan".into()),
        state: payload.state.unwrap_or_else(|| "Uttar Pradesh".into()),
        country: payload.country.unwrap_or_else(|| "India".into()),
        pincode: payload.pincode.unwrap_or_else(|| "281121".into()),
        latitude: payload.latitude,
        longitude: payload.longitude,
        nearby_landmark: payload.nearby_landmark,
        main_image: payload.main_image,
        gallery_images: payload.gallery_images,
        cover_image: payload.cover_image,
        videos: payload.videos,
        hotel_details: payload.hotel_details,
        restaurant_details: payload.restaurant_details,
        ashram_details: payload.ashram_details,
        dharamshala_details: payload.dharamshala_details,
        transport_details: payload.transport_details,
    };

    state_write.properties.insert(0, new_property.clone());
    state_write.log_audit(
        "Super Admin",
        "PROPERTY_CREATED",
        "Property Management",
        &id,
        &format!("Created property '{}' ({})", payload.name, payload.property_type),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(json!({
            "success": true,
            "message": "Property added successfully",
            "data": new_property
        })),
    )
}

pub async fn update_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
    Json(payload): Json<CreatePropertyDto>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(prop) = state_write.properties.iter_mut().find(|p| p.id == id) {
        prop.name = payload.name.clone();
        prop.property_type = payload.property_type.clone();
        if let Some(desc) = payload.description {
            prop.description = desc;
        }
        if let Some(owner) = payload.owner_name {
            prop.owner_name = owner;
        }
        if let Some(contact) = payload.contact_number {
            prop.contact_number = contact;
        }
        if let Some(email) = payload.email {
            prop.email = email;
        }
        if let Some(addr) = payload.address {
            prop.address = addr;
        }
        if let Some(city) = payload.city {
            prop.city = city;
        }
        if let Some(landmark) = payload.nearby_landmark {
            prop.nearby_landmark = Some(landmark);
        }
        if payload.hotel_details.is_some() {
            prop.hotel_details = payload.hotel_details;
        }
        if payload.restaurant_details.is_some() {
            prop.restaurant_details = payload.restaurant_details;
        }
        if payload.ashram_details.is_some() {
            prop.ashram_details = payload.ashram_details;
        }
        if payload.dharamshala_details.is_some() {
            prop.dharamshala_details = payload.dharamshala_details;
        }
        if payload.transport_details.is_some() {
            prop.transport_details = payload.transport_details;
        }

        let updated = prop.clone();
        state_write.log_audit(
            "Super Admin",
            "PROPERTY_UPDATED",
            "Property Management",
            &id,
            &format!("Updated property '{}'", payload.name),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": "Property updated successfully",
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}

pub async fn delete_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    let initial_len = state_write.properties.len();
    state_write.properties.retain(|p| p.id != id);

    if state_write.properties.len() < initial_len {
        state_write.log_audit(
            "Super Admin",
            "PROPERTY_DELETED",
            "Property Management",
            &id,
            &format!("Deleted property id '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Property deleted successfully" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}

pub async fn approve_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(prop) = state_write.properties.iter_mut().find(|p| p.id == id) {
        prop.status = "ACTIVE".to_string();
        prop.rejection_reason = None;
        let name = prop.name.clone();

        state_write.log_audit(
            "Super Admin",
            "PROPERTY_APPROVED",
            "Property Approval",
            &id,
            &format!("Approved and activated property '{}'", name),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": format!("Property '{}' approved and set to ACTIVE", name)
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}

pub async fn reject_property(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
    Json(payload): Json<RejectPropertyDto>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(prop) = state_write.properties.iter_mut().find(|p| p.id == id) {
        prop.status = "REJECTED".to_string();
        prop.rejection_reason = Some(payload.reason.clone());
        let name = prop.name.clone();

        state_write.log_audit(
            "Super Admin",
            "PROPERTY_REJECTED",
            "Property Approval",
            &id,
            &format!("Rejected property '{}'. Reason: {}", name, payload.reason),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": format!("Property '{}' rejected", name)
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}

pub async fn toggle_property_status(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(prop) = state_write.properties.iter_mut().find(|p| p.id == id) {
        prop.status = if prop.status == "ACTIVE" {
            "INACTIVE".to_string()
        } else {
            "ACTIVE".to_string()
        };
        let status = prop.status.clone();
        let name = prop.name.clone();

        state_write.log_audit(
            "Super Admin",
            "STATUS_TOGGLED",
            "Property Management",
            &id,
            &format!("Toggled status of '{}' to {}", name, status),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({
                "success": true,
                "message": format!("Property status changed to {}", status),
                "status": status
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Property not found" })),
        )
    }
}
