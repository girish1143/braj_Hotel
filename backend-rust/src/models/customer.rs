use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Customer {
    pub id: String,
    pub name: String,
    pub phone: String,
    pub email: String,
    #[serde(rename = "totalBookings")]
    pub total_bookings: u32,
    #[serde(rename = "totalSpending")]
    pub total_spending: f64,
    #[serde(rename = "lastBooking")]
    pub last_booking: String,
    #[serde(rename = "accountStatus")]
    pub account_status: String, // Active, Suspended, Pending
}

#[derive(Debug, Deserialize)]
pub struct CreateCustomerDto {
    pub name: String,
    pub phone: String,
    pub email: String,
}
