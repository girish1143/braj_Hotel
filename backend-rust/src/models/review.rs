use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Review {
    pub id: String,
    pub customer: String,
    #[serde(rename = "propertyId")]
    pub property_id: String,
    #[serde(rename = "propertyName")]
    pub property_name: String,
    pub rating: u32,
    pub review: String,
    pub date: String,
    pub status: String, // Pending, Approved, Hidden, Flagged
}

#[derive(Debug, Deserialize)]
pub struct UpdateReviewStatusDto {
    pub status: String,
}
