use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Driver {
    pub id: String,
    pub name: String,
    pub phone: String,
    pub email: String,
    #[serde(rename = "licenseNumber")]
    pub license_number: String,
    #[serde(rename = "licenseExpiry")]
    pub license_expiry: String,
    pub address: String,
    #[serde(rename = "assignedVehicle")]
    pub assigned_vehicle: Option<String>,
    #[serde(rename = "experienceYears")]
    pub experience_years: u32,
    pub rating: f64,
    pub status: String, // Active, Blocked
    #[serde(rename = "tripsCount")]
    pub trips_count: u32,
}

#[derive(Debug, Deserialize)]
pub struct CreateDriverDto {
    pub name: String,
    pub phone: String,
    pub email: Option<String>,
    #[serde(rename = "licenseNumber")]
    pub license_number: String,
    #[serde(rename = "licenseExpiry")]
    pub license_expiry: String,
    pub address: String,
    #[serde(rename = "assignedVehicle")]
    pub assigned_vehicle: Option<String>,
    #[serde(rename = "experienceYears")]
    pub experience_years: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct AssignVehicleDto {
    #[serde(rename = "vehicleId")]
    pub vehicle_id: Option<String>,
}
