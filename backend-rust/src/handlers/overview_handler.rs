use crate::state::AppState;
use axum::{extract::State, response::IntoResponse, Json};
use std::sync::{Arc, RwLock};

pub async fn get_overview(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();

    let total_hotels = st.hotels.len();
    let active_hotels = st.hotels.iter().filter(|h| h.status == "APPROVED").count();
    let pending_approvals = st
        .hotels
        .iter()
        .filter(|h| h.status == "SUBMITTED" || h.status == "UNDER_REVIEW")
        .count();
    let total_users = st.users.len();
    let total_bhojan = st.bhojanalayas.len();
    let active_bhojan = st.bhojanalayas.iter().filter(|b| b.status == "APPROVED").count();
    let total_bhojan_reservations = st.bhojan_reservations.len();
    let total_stay_bookings = st.bookings.len();

    let real_stay_revenue: f64 = st
        .bookings
        .iter()
        .filter(|b| b.status == "CONFIRMED" || b.status == "COMPLETED")
        .map(|b| b.grand_total)
        .sum();
    let estimated_revenue: f64 = st
        .hotels
        .iter()
        .filter(|h| h.status == "APPROVED")
        .map(|h| h.price_per_night * 2.0)
        .sum();
    let total_gross_revenue = if real_stay_revenue > 0.0 {
        real_stay_revenue
    } else {
        estimated_revenue
    };
    let commission_pct = st.settings.platform_commission_pct;
    let platform_commission = (total_gross_revenue * (commission_pct / 100.0)).round();

    // Combined recent activity (last 5 stay bookings and bhojan orders)
    let recent_bookings = st.bookings.iter().take(4).cloned().collect::<Vec<_>>();
    let recent_bhojan_res = st.bhojan_reservations.iter().take(4).cloned().collect::<Vec<_>>();

    Json(serde_json::json!({
        "success": true,
        "data": {
            "totalHotels": total_hotels,
            "activeHotels": active_hotels,
            "pendingApprovals": pending_approvals,
            "totalBhojan": total_bhojan,
            "activeBhojan": active_bhojan,
            "totalStayBookings": total_stay_bookings,
            "totalBhojanReservations": total_bhojan_reservations,
            "totalUsers": total_users,
            "revenueToday": total_gross_revenue,
            "platformCommissionEarnedToday": platform_commission,
            "commissionRatePct": commission_pct,
            "activeDestinations": 4,
            "avgCustomerRating": 4.9,
            "sacredNoticeEnabled": st.settings.sacred_notice_enabled,
            "recentStayBookings": recent_bookings,
            "recentBhojanReservations": recent_bhojan_res,
            "recentAuditLogs": st.audit_logs.iter().take(5).collect::<Vec<_>>()
        }
    }))
}
