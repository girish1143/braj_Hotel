use serde::{Deserialize, Serialize};

fn default_destination_slug() -> String { "vrindavan".to_string() }
fn default_destination_name() -> String { "Vrindavan".to_string() }
fn default_category() -> String { "thali".to_string() }
fn default_category_name() -> String { "Satvik Bhojanalaya".to_string() }
fn default_price_range() -> String { "₹₹ (₹150 - ₹350)".to_string() }
fn default_bhojan_cost() -> f64 { 250.0 }
fn default_timings() -> String { "11:00 AM - 10:00 PM".to_string() }
fn default_landmark() -> String { "Main Temple".to_string() }
fn default_rating() -> f64 { 4.9 }
fn default_status_approved() -> String { "APPROVED".to_string() }
fn default_true() -> bool { true }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bhojanalaya {
    #[serde(default)]
    pub id: String,
    pub name: String,
    #[serde(rename = "hindiName", skip_serializing_if = "Option::is_none")]
    pub hindi_name: Option<String>,
    #[serde(default)]
    pub slug: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    pub destination_slug: String,
    #[serde(rename = "destinationName", default = "default_destination_name")]
    pub destination_name: String,
    #[serde(default = "default_category")]
    pub category: String,
    #[serde(rename = "categoryName", default = "default_category_name")]
    pub category_name: String,
    #[serde(rename = "specialityDishes", default)]
    pub speciality_dishes: Vec<String>,
    #[serde(rename = "priceRange", default = "default_price_range")]
    pub price_range: String,
    #[serde(rename = "avgCostForTwo", default = "default_bhojan_cost")]
    pub avg_cost_for_two: f64,
    #[serde(rename = "pureSatvik", default = "default_true")]
    pub pure_satvik: bool,
    #[serde(rename = "pureDesiGhee", default = "default_true")]
    pub pure_desi_ghee: bool,
    #[serde(default = "default_timings")]
    pub timings: String,
    #[serde(rename = "nearestLandmark", default = "default_landmark")]
    pub nearest_landmark: String,
    #[serde(rename = "distanceToLandmark", default)]
    pub distance_to_landmark: String,
    #[serde(rename = "walkMinutes", default)]
    pub walk_minutes: u32,
    #[serde(default)]
    pub address: String,
    #[serde(rename = "contactPhone", default)]
    pub contact_phone: String,
    #[serde(rename = "ratingScore", default = "default_rating")]
    pub rating_score: f64,
    #[serde(rename = "reviewsCount", default)]
    pub reviews_count: u32,
    #[serde(default = "default_status_approved")]
    pub status: String,
    #[serde(rename = "isFeatured", default)]
    pub is_featured: bool,
    #[serde(default)]
    pub images: Vec<String>,
    #[serde(default)]
    pub features: Vec<String>,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BhojanReservation {
    pub id: String,
    #[serde(rename = "bhojanalayaId")]
    pub bhojanalaya_id: String,
    #[serde(rename = "bhojanalayaName")]
    pub bhojanalaya_name: String,
    #[serde(rename = "guestName")]
    pub guest_name: String,
    #[serde(rename = "guestPhone")]
    pub guest_phone: String,
    #[serde(rename = "guestEmail", skip_serializing_if = "Option::is_none")]
    pub guest_email: Option<String>,
    pub date: String,
    #[serde(rename = "mealTime")]
    pub meal_time: String,
    #[serde(rename = "thaliCount")]
    pub thali_count: u32,
    #[serde(rename = "specialRequests", skip_serializing_if = "Option::is_none")]
    pub special_requests: Option<String>,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct BhojanStatusDto {
    pub status: Option<String>,
}
