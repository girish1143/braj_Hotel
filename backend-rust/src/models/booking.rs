use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Booking {
    pub id: String,
    #[serde(rename = "bookingReference")]
    pub booking_reference: String,
    #[serde(rename = "hotelId")]
    pub hotel_id: String,
    #[serde(rename = "hotelName")]
    pub hotel_name: String,
    #[serde(rename = "roomId")]
    pub room_id: String,
    #[serde(rename = "roomName")]
    pub room_name: String,
    #[serde(rename = "guestName")]
    pub guest_name: String,
    #[serde(rename = "guestPhone")]
    pub guest_phone: String,
    #[serde(rename = "guestEmail")]
    pub guest_email: String,
    #[serde(rename = "checkIn")]
    pub check_in: String,
    #[serde(rename = "checkOut")]
    pub check_out: String,
    #[serde(rename = "guestsCount")]
    pub guests_count: u32,
    #[serde(rename = "roomsCount")]
    pub rooms_count: u32,
    #[serde(rename = "totalNights")]
    pub total_nights: u32,
    #[serde(rename = "roomCharges")]
    pub room_charges: f64,
    #[serde(rename = "taxAmount")]
    pub tax_amount: f64,
    #[serde(rename = "addOnTotal")]
    pub add_on_total: f64,
    #[serde(rename = "grandTotal")]
    pub grand_total: f64,
    pub status: String, // "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED"
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct BookingStatusDto {
    pub status: Option<String>,
}
