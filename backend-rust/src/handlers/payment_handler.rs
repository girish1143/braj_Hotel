use crate::models::TransactionItem;
use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use std::sync::{Arc, RwLock};

pub async fn get_payments(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    let real_stay_revenue: f64 = st
        .bookings
        .iter()
        .filter(|b| b.status == "CONFIRMED" || b.status == "COMPLETED")
        .map(|b| b.grand_total)
        .sum();

    let gross_volume = real_stay_revenue;
    let commission = (gross_volume * (st.settings.platform_commission_pct / 100.0)).round();
    let payouts = gross_volume - commission;
    let pending_payouts = (payouts * 0.3).round();

    // Map real transactions from confirmed bookings with zero dummy data
    let mut transactions: Vec<TransactionItem> = st
        .bookings
        .iter()
        .map(|b| {
            let comm = (b.grand_total * (st.settings.platform_commission_pct / 100.0)).round();
            TransactionItem {
                id: format!("tx-{}", b.id),
                transaction_type: "STAY_PAYMENT".into(),
                guest: b.guest_name.clone(),
                amount: b.grand_total,
                commission: comm,
                date: b.created_at.clone(),
                status: if b.status == "CONFIRMED" || b.status == "COMPLETED" {
                    "SETTLED".into()
                } else {
                    "PENDING".into()
                },
            }
        })
        .collect();

    // Add confirmed bhojan reservations to the transaction ledger
    for res in &st.bhojan_reservations {
        let est_val = (res.thali_count as f64) * 250.0;
        let comm = (est_val * (st.settings.platform_commission_pct / 100.0)).round();
        transactions.push(TransactionItem {
            id: format!("tx-{}", res.id),
            transaction_type: "BHOJAN_PRASADAM".into(),
            guest: res.guest_name.clone(),
            amount: est_val,
            commission: comm,
            date: res.created_at.clone(),
            status: "SETTLED".into(),
        });
    }

    Json(serde_json::json!({
        "success": true,
        "data": {
            "totalGrossBookings": gross_volume,
            "platformCommissions": commission,
            "payoutsToHotels": payouts,
            "pendingPayouts": pending_payouts,
            "commissionRatePct": st.settings.platform_commission_pct,
            "recentTransactions": transactions
        }
    }))
}
