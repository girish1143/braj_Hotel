use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminHotel {
    pub id: String,
    pub name: String,
    pub slug: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    pub destination_slug: String,
    #[serde(rename = "destinationName", default = "default_destination_name")]
    pub destination_name: String,
    #[serde(rename = "stayType", default = "default_stay_type")]
    pub stay_type: String,
    #[serde(rename = "pricePerNight", default = "default_price")]
    pub price_per_night: f64,
    pub status: String, // "APPROVED" | "SUBMITTED" | "UNDER_REVIEW" | "REJECTED" | "SUSPENDED"
    #[serde(rename = "ownerName", default = "default_owner")]
    pub owner_name: String,
    #[serde(rename = "ownerEmail", default = "default_email")]
    pub owner_email: String,
    #[serde(rename = "ownerPhone", skip_serializing_if = "Option::is_none")]
    pub owner_phone: Option<String>,
    #[serde(rename = "submittedAt", default = "default_submitted_at")]
    pub submitted_at: String,
    #[serde(rename = "documentsVerified", default = "default_true")]
    pub documents_verified: bool,
    #[serde(rename = "tradeLicenseNo", skip_serializing_if = "Option::is_none")]
    pub trade_license_no: Option<String>,
    #[serde(rename = "fssaiLicenseNo", skip_serializing_if = "Option::is_none")]
    pub fssai_license_no: Option<String>,
    #[serde(rename = "nearestLandmark", skip_serializing_if = "Option::is_none")]
    pub nearest_landmark: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<String>,
    #[serde(rename = "pureSatvikKitchen", default = "default_true")]
    pub pure_satvik_kitchen: bool,
    #[serde(rename = "templeDarshanAssistance", default = "default_true")]
    pub temple_darshan_assistance: bool,
}

fn default_destination_slug() -> String { "vrindavan".to_string() }
fn default_destination_name() -> String { "Vrindavan".to_string() }
fn default_stay_type() -> String { "hotel".to_string() }
fn default_price() -> f64 { 1500.0 }
fn default_owner() -> String { "Braj Seva Partner".to_string() }
fn default_email() -> String { "partner@brijnidhi.org".to_string() }
fn default_submitted_at() -> String { "01 Oct 2026".to_string() }
fn default_true() -> bool { true }

#[derive(Debug, Deserialize)]
pub struct CreateHotelDto {
    pub name: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    pub destination_slug: String,
    #[serde(rename = "stayType", default = "default_stay_type")]
    pub stay_type: String,
    #[serde(rename = "pricePerNight", default = "default_price")]
    pub price_per_night: f64,
    #[serde(rename = "nearestLandmark")]
    pub nearest_landmark: Option<String>,
    pub address: Option<String>,
    #[serde(rename = "ownerName", default = "default_owner")]
    pub owner_name: String,
    #[serde(rename = "ownerEmail", default = "default_email")]
    pub owner_email: String,
    #[serde(rename = "pureSatvikKitchen", default = "default_true")]
    pub pure_satvik_kitchen: bool,
    #[serde(rename = "templeDarshanAssistance", default = "default_true")]
    pub temple_darshan_assistance: bool,
    #[serde(default)]
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct RejectHotelDto {
    pub reason: Option<String>,
}
