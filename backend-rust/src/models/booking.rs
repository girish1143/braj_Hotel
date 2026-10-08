use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Booking {
    pub id: String,
    #[serde(rename = "bookingId", default)]
    pub booking_id: String,
    #[serde(rename = "bookingReference", default)]
    pub booking_reference: String,

    // Customer Information
    #[serde(rename = "customerName", default)]
    pub customer_name: String,
    #[serde(rename = "customerPhone", default)]
    pub customer_phone: String,
    #[serde(rename = "customerEmail", default)]
    pub customer_email: String,

    // Legacy guest alias
    #[serde(rename = "guestName", default)]
    pub guest_name: String,
    #[serde(rename = "guestPhone", default)]
    pub guest_phone: String,
    #[serde(rename = "guestEmail", default)]
    pub guest_email: String,

    // Service & Property Details
    #[serde(rename = "serviceType", default = "default_service_type")]
    pub service_type: String, // Hotel, Restaurant, Ashram, Dharamshala, Transport
    #[serde(rename = "propertyId", default)]
    pub property_id: String,
    #[serde(rename = "propertyName", default)]
    pub property_name: String,

    // Legacy Hotel alias
    #[serde(rename = "hotelId", default)]
    pub hotel_id: String,
    #[serde(rename = "hotelName", default)]
    pub hotel_name: String,
    #[serde(rename = "roomId", default)]
    pub room_id: String,
    #[serde(rename = "roomName", default)]
    pub room_name: String,

    // Timing
    #[serde(rename = "bookingDate", default)]
    pub booking_date: String,
    #[serde(rename = "checkIn", default)]
    pub check_in: String,
    #[serde(rename = "checkOut", default)]
    pub check_out: String,

    // Financials
    #[serde(default)]
    pub amount: f64,
    #[serde(rename = "grandTotal", default)]
    pub grand_total: f64,
    #[serde(rename = "paymentStatus", default = "default_payment_status")]
    pub payment_status: String, // Pending, Paid, Failed, Refunded, Partially Refunded

    // Status: Pending, Confirmed, Checked-In, Completed, Cancelled, Rejected, No-Show
    #[serde(default = "default_status")]
    pub status: String,
    #[serde(rename = "createdAt", default)]
    pub created_at: String,
}

fn default_service_type() -> String { "Hotel".into() }
fn default_payment_status() -> String { "Paid".into() }
fn default_status() -> String { "Confirmed".into() }

#[derive(Debug, Deserialize)]
pub struct CreateBookingDto {
    #[serde(rename = "customerName")]
    pub customer_name: String,
    #[serde(rename = "customerPhone")]
    pub customer_phone: String,
    #[serde(rename = "customerEmail")]
    pub customer_email: Option<String>,
    #[serde(rename = "serviceType")]
    pub service_type: String,
    #[serde(rename = "propertyId")]
    pub property_id: String,
    #[serde(rename = "propertyName")]
    pub property_name: String,
    #[serde(rename = "checkIn")]
    pub check_in: String,
    #[serde(rename = "checkOut")]
    pub check_out: String,
    pub amount: f64,
    #[serde(rename = "paymentStatus")]
    pub payment_status: Option<String>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct BookingStatusDto {
    pub status: Option<String>,
}
