use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use serde_json::{json, Value};
use std::sync::{Arc, RwLock};

use crate::models::{AssignVehicleDto, CreateDriverDto, Driver, Vehicle};
use crate::state::AppState;

pub async fn list_drivers(State(state): State<Arc<RwLock<AppState>>>) -> Json<Value> {
    let state_read = state.read().unwrap();
    Json(json!({
        "success": true,
        "count": state_read.drivers.len(),
        "data": state_read.drivers
    }))
}

pub async fn create_driver(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateDriverDto>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    let id = format!("drv-{}", Utc::now().timestamp_millis());

    let driver = Driver {
        id: id.clone(),
        name: payload.name.clone(),
        phone: payload.phone,
        email: payload.email.unwrap_or_else(|| "driver@brijnidhi.org".into()),
        license_number: payload.license_number,
        license_expiry: payload.license_expiry,
        address: payload.address,
        assigned_vehicle: payload.assigned_vehicle,
        experience_years: payload.experience_years.unwrap_or(2),
        rating: 5.0,
        status: "Active".into(),
        trips_count: 0,
    };

    state_write.drivers.insert(0, driver.clone());
    state_write.log_audit(
        "Transport Manager",
        "DRIVER_ADDED",
        "Transport Management",
        &id,
        &format!("Added driver '{}'", payload.name),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(json!({ "success": true, "message": "Driver added successfully", "data": driver })),
    )
}

pub async fn assign_vehicle(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
    Json(payload): Json<AssignVehicleDto>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(drv) = state_write.drivers.iter_mut().find(|d| d.id == id) {
        drv.assigned_vehicle = payload.vehicle_id.clone();
        let name = drv.name.clone();

        state_write.log_audit(
            "Transport Manager",
            "VEHICLE_ASSIGNED",
            "Transport Management",
            &id,
            &format!("Assigned vehicle '{:?}' to driver '{}'", payload.vehicle_id, name),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Vehicle assigned successfully" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Driver not found" })),
        )
    }
}

pub async fn toggle_driver_status(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    if let Some(drv) = state_write.drivers.iter_mut().find(|d| d.id == id) {
        drv.status = if drv.status == "Active" {
            "Blocked".into()
        } else {
            "Active".into()
        };
        let status = drv.status.clone();
        let name = drv.name.clone();

        state_write.log_audit(
            "Transport Manager",
            "DRIVER_STATUS_TOGGLED",
            "Transport Management",
            &id,
            &format!("Changed driver '{}' status to {}", name, status),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": format!("Driver is now {}", status), "status": status })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Driver not found" })),
        )
    }
}

pub async fn delete_driver(
    State(state): State<Arc<RwLock<AppState>>>,
    Path(id): Path<String>,
) -> (StatusCode, Json<Value>) {
    let mut state_write = state.write().unwrap();
    let initial_len = state_write.drivers.len();
    state_write.drivers.retain(|d| d.id != id);

    if state_write.drivers.len() < initial_len {
        state_write.log_audit(
            "Transport Manager",
            "DRIVER_DELETED",
            "Transport Management",
            &id,
            &format!("Deleted driver id '{}'", id),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(json!({ "success": true, "message": "Driver deleted successfully" })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "message": "Driver not found" })),
        )
    }
}

pub async fn list_vehicles(State(state): State<Arc<RwLock<AppState>>>) -> Json<Value> {
    let state_read = state.read().unwrap();
    let mut all_vehicles: Vec<Vehicle> = Vec::new();

    for prop in &state_read.properties {
        if let Some(t_details) = &prop.transport_details {
            for v in &t_details.vehicles {
                all_vehicles.push(v.clone());
            }
        }
    }

    Json(json!({
        "success": true,
        "count": all_vehicles.len(),
        "data": all_vehicles
    }))
}
