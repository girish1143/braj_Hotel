use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Coupon {
    pub id: String,
    #[serde(rename = "couponCode")]
    pub coupon_code: String,
    #[serde(rename = "discountType")]
    pub discount_type: String, // Percentage, Fixed, First Booking, Seasonal, Property Specific, Transport
    #[serde(rename = "discountValue")]
    pub discount_value: f64,
    #[serde(rename = "minBookingAmount")]
    pub min_booking_amount: f64,
    #[serde(rename = "maxDiscount")]
    pub max_discount: f64,
    #[serde(rename = "startDate")]
    pub start_date: String,
    #[serde(rename = "endDate")]
    pub end_date: String,
    #[serde(rename = "usageLimit")]
    pub usage_limit: u32,
    #[serde(rename = "usageCount")]
    pub usage_count: u32,
    #[serde(rename = "propertyId")]
    pub property_id: Option<String>,
    #[serde(rename = "propertyName")]
    pub property_name: Option<String>,
    pub status: String, // Active, Inactive, Expired
}

#[derive(Debug, Deserialize)]
pub struct CreateCouponDto {
    #[serde(rename = "couponCode")]
    pub coupon_code: String,
    #[serde(rename = "discountType")]
    pub discount_type: String,
    #[serde(rename = "discountValue")]
    pub discount_value: f64,
    #[serde(rename = "minBookingAmount")]
    pub min_booking_amount: Option<f64>,
    #[serde(rename = "maxDiscount")]
    pub max_discount: Option<f64>,
    #[serde(rename = "startDate")]
    pub start_date: String,
    #[serde(rename = "endDate")]
    pub end_date: String,
    #[serde(rename = "usageLimit")]
    pub usage_limit: Option<u32>,
    #[serde(rename = "propertyId")]
    pub property_id: Option<String>,
    #[serde(rename = "propertyName")]
    pub property_name: Option<String>,
}
