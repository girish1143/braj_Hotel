use serde::{Deserialize, Serialize};

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
}
