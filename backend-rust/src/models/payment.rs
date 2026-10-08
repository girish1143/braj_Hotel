use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentRecord {
    pub id: String,
    #[serde(rename = "bookingId")]
    pub booking_id: String,
    pub customer: String,
    pub amount: f64,
    #[serde(rename = "paymentMethod")]
    pub payment_method: String, // UPI, Credit Card, Debit Card, Net Banking, Cash on Arrival
    #[serde(rename = "transactionId")]
    pub transaction_id: String,
    #[serde(rename = "paymentDate")]
    pub payment_date: String,
    #[serde(rename = "paymentStatus")]
    pub payment_status: String, // Pending, Paid, Failed, Refunded, Partially Refunded
    #[serde(rename = "refundStatus")]
    pub refund_status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionItem {
    pub id: String,
    #[serde(rename = "type")]
    pub transaction_type: String,
    pub guest: String,
    pub amount: f64,
    pub commission: f64,
    pub date: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentOverviewData {
    #[serde(rename = "totalGrossBookings")]
    pub total_gross_bookings: f64,
    #[serde(rename = "platformCommissions")]
    pub platform_commissions: f64,
    #[serde(rename = "payoutsToHotels")]
    pub payouts_to_hotels: f64,
    #[serde(rename = "pendingPayouts")]
    pub pending_payouts: f64,
    #[serde(rename = "commissionRatePct")]
    pub commission_rate_pct: f64,
    #[serde(rename = "recentTransactions")]
    pub recent_transactions: Vec<TransactionItem>,
    #[serde(rename = "payments", default)]
    pub payments: Vec<PaymentRecord>,
}

#[derive(Debug, Deserialize)]
pub struct RefundPaymentDto {
    pub reason: Option<String>,
}
