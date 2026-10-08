use crate::state::AppState;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;
use std::sync::{Arc, RwLock};

#[derive(Debug, Deserialize)]
pub struct ReportQuery {
    pub report_type: Option<String>, // property, booking, revenue, transport
}

pub async fn get_reports(
    State(state): State<Arc<RwLock<AppState>>>,
    Query(query): Query<ReportQuery>,
) -> impl IntoResponse {
    let st = state.read().unwrap();
    let r_type = query.report_type.unwrap_or_else(|| "all".into());

    let property_report = json!({
        "totalProperties": st.properties.len(),
        "activeProperties": st.properties.iter().filter(|p| p.status == "ACTIVE").count(),
        "underReview": st.properties.iter().filter(|p| p.status == "PENDING" || p.status == "UNDER_REVIEW").count(),
        "hotels": st.properties.iter().filter(|p| p.property_type.eq_ignore_ascii_case("hotel")).count(),
        "restaurants": st.properties.iter().filter(|p| p.property_type.eq_ignore_ascii_case("restaurant")).count(),
        "ashrams": st.properties.iter().filter(|p| p.property_type.eq_ignore_ascii_case("ashram")).count(),
        "dharamshalas": st.properties.iter().filter(|p| p.property_type.eq_ignore_ascii_case("dharamshala")).count(),
        "transport": st.properties.iter().filter(|p| p.property_type.eq_ignore_ascii_case("transport")).count(),
    });

    let total_revenue: f64 = st
        .bookings
        .iter()
        .filter(|b| b.status == "Confirmed" || b.status == "Completed")
        .map(|b| if b.amount > 0.0 { b.amount } else { b.grand_total })
        .sum();

    let revenue_report = json!({
        "grossRevenue": total_revenue,
        "platformCommission": (total_revenue * (st.settings.platform_commission_pct / 100.0)).round(),
        "vendorPayouts": (total_revenue * ((100.0 - st.settings.platform_commission_pct) / 100.0)).round(),
        "averageBookingValue": if !st.bookings.is_empty() { (total_revenue / st.bookings.len() as f64).round() } else { 0.0 }
    });

    let booking_report = json!({
        "totalBookings": st.bookings.len(),
        "confirmed": st.bookings.iter().filter(|b| b.status == "Confirmed").count(),
        "completed": st.bookings.iter().filter(|b| b.status == "Completed").count(),
        "cancelled": st.bookings.iter().filter(|b| b.status == "Cancelled").count(),
        "pending": st.bookings.iter().filter(|b| b.status == "Pending").count(),
    });

    let transport_report = json!({
        "totalDrivers": st.drivers.len(),
        "activeDrivers": st.drivers.iter().filter(|d| d.status == "Active").count(),
        "totalVehicles": st.properties.iter().filter_map(|p| p.transport_details.as_ref()).map(|t| t.vehicles.len()).sum::<usize>(),
    });

    Json(json!({
        "success": true,
        "reportType": r_type,
        "data": {
            "propertyReport": property_report,
            "revenueReport": revenue_report,
            "bookingReport": booking_report,
            "transportReport": transport_report,
        }
    }))
}
