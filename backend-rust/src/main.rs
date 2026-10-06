use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, patch, post, put},
    Json, Router,
};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};
use tower_http::cors::{Any, CorsLayer};

// -------------------------------------------------------------
// DATA MODELS
// -------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminHotel {
    pub id: String,
    pub name: String,
    pub slug: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    pub destination_slug: String,
    #[serde(rename = "destinationName", default = "default_destination_name")]
    pub destination_name: String,
    #[serde(rename = "stayType", default = "default_stay_type")]
    pub stay_type: String,
    #[serde(rename = "pricePerNight", default = "default_price")]
    pub price_per_night: f64,
    pub status: String, // "APPROVED" | "SUBMITTED" | "UNDER_REVIEW" | "REJECTED" | "SUSPENDED"
    #[serde(rename = "ownerName", default = "default_owner")]
    pub owner_name: String,
    #[serde(rename = "ownerEmail", default = "default_email")]
    pub owner_email: String,
    #[serde(rename = "ownerPhone", skip_serializing_if = "Option::is_none")]
    pub owner_phone: Option<String>,
    #[serde(rename = "submittedAt", default = "default_submitted_at")]
    pub submitted_at: String,
    #[serde(rename = "documentsVerified", default = "default_true")]
    pub documents_verified: bool,
    #[serde(rename = "tradeLicenseNo", skip_serializing_if = "Option::is_none")]
    pub trade_license_no: Option<String>,
    #[serde(rename = "fssaiLicenseNo", skip_serializing_if = "Option::is_none")]
    pub fssai_license_no: Option<String>,
    #[serde(rename = "nearestLandmark", skip_serializing_if = "Option::is_none")]
    pub nearest_landmark: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub address: Option<String>,
    #[serde(rename = "pureSatvikKitchen", default = "default_true")]
    pub pure_satvik_kitchen: bool,
    #[serde(rename = "templeDarshanAssistance", default = "default_true")]
    pub temple_darshan_assistance: bool,
}

fn default_destination_slug() -> String { "vrindavan".to_string() }
fn default_destination_name() -> String { "Vrindavan".to_string() }
fn default_stay_type() -> String { "hotel".to_string() }
fn default_price() -> f64 { 1500.0 }
fn default_owner() -> String { "Braj Seva Partner".to_string() }
fn default_email() -> String { "partner@brijnidhi.org".to_string() }
fn default_submitted_at() -> String { "01 Oct 2026".to_string() }
fn default_true() -> bool { true }

fn default_category() -> String { "thali".to_string() }
fn default_category_name() -> String { "Satvik Bhojanalaya".to_string() }
fn default_price_range() -> String { "₹₹ (₹150 - ₹350)".to_string() }
fn default_bhojan_cost() -> f64 { 250.0 }
fn default_timings() -> String { "11:00 AM - 10:00 PM".to_string() }
fn default_landmark() -> String { "Main Temple".to_string() }
fn default_rating() -> f64 { 4.9 }
fn default_status_approved() -> String { "APPROVED".to_string() }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bhojanalaya {
    #[serde(default)]
    pub id: String,
    pub name: String,
    #[serde(rename = "hindiName", skip_serializing_if = "Option::is_none")]
    pub hindi_name: Option<String>,
    #[serde(default)]
    pub slug: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    pub destination_slug: String,
    #[serde(rename = "destinationName", default = "default_destination_name")]
    pub destination_name: String,
    #[serde(default = "default_category")]
    pub category: String,
    #[serde(rename = "categoryName", default = "default_category_name")]
    pub category_name: String,
    #[serde(rename = "specialityDishes", default)]
    pub speciality_dishes: Vec<String>,
    #[serde(rename = "priceRange", default = "default_price_range")]
    pub price_range: String,
    #[serde(rename = "avgCostForTwo", default = "default_bhojan_cost")]
    pub avg_cost_for_two: f64,
    #[serde(rename = "pureSatvik", default = "default_true")]
    pub pure_satvik: bool,
    #[serde(rename = "pureDesiGhee", default = "default_true")]
    pub pure_desi_ghee: bool,
    #[serde(default = "default_timings")]
    pub timings: String,
    #[serde(rename = "nearestLandmark", default = "default_landmark")]
    pub nearest_landmark: String,
    #[serde(rename = "distanceToLandmark", default)]
    pub distance_to_landmark: String,
    #[serde(rename = "walkMinutes", default)]
    pub walk_minutes: u32,
    #[serde(default)]
    pub address: String,
    #[serde(rename = "contactPhone", default)]
    pub contact_phone: String,
    #[serde(rename = "ratingScore", default = "default_rating")]
    pub rating_score: f64,
    #[serde(rename = "reviewsCount", default)]
    pub reviews_count: u32,
    #[serde(default = "default_status_approved")]
    pub status: String,
    #[serde(rename = "isFeatured", default)]
    pub is_featured: bool,
    #[serde(default)]
    pub images: Vec<String>,
    #[serde(default)]
    pub features: Vec<String>,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BhojanReservation {
    pub id: String,
    #[serde(rename = "bhojanalayaId")]
    pub bhojanalaya_id: String,
    #[serde(rename = "bhojanalayaName")]
    pub bhojanalaya_name: String,
    #[serde(rename = "guestName")]
    pub guest_name: String,
    #[serde(rename = "guestPhone")]
    pub guest_phone: String,
    #[serde(rename = "guestEmail", skip_serializing_if = "Option::is_none")]
    pub guest_email: Option<String>,
    pub date: String,
    #[serde(rename = "mealTime")]
    pub meal_time: String,
    #[serde(rename = "thaliCount")]
    pub thali_count: u32,
    #[serde(rename = "specialRequests", skip_serializing_if = "Option::is_none")]
    pub special_requests: Option<String>,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

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
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminUser {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub status: String,
    pub joined: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformSettings {
    #[serde(rename = "sacredNoticeText")]
    pub sacred_notice_text: String,
    #[serde(rename = "sacredNoticeEnabled")]
    pub sacred_notice_enabled: bool,
    #[serde(rename = "platformCommissionPct")]
    pub platform_commission_pct: f64,
    #[serde(rename = "supportPhone")]
    pub support_phone: String,
    #[serde(rename = "supportEmail")]
    pub support_email: String,
    #[serde(rename = "payoutsAutoApprove")]
    pub payouts_auto_approve: bool,
    #[serde(rename = "maintenanceMode")]
    pub maintenance_mode: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditLog {
    pub id: String,
    pub timestamp: String,
    pub user: String,
    pub action: String,
    pub module: String,
    #[serde(rename = "targetId")]
    pub target_id: String,
    pub details: String,
    #[serde(rename = "ipAddress")]
    pub ip_address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub count: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total: Option<usize>,
}

// -------------------------------------------------------------
// APPLICATION STATE
// -------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct AppState {
    pub hotels: Vec<AdminHotel>,
    pub bhojanalayas: Vec<Bhojanalaya>,
    pub bhojan_reservations: Vec<BhojanReservation>,
    pub bookings: Vec<Booking>,
    pub users: Vec<AdminUser>,
    pub settings: PlatformSettings,
    pub audit_logs: Vec<AuditLog>,
}

impl AppState {
    pub fn new() -> Self {
        // Initial Seed Hotels
        let hotels = vec![
            AdminHotel {
                id: "htl-vrn-01".into(),
                name: "MVT Guesthouse & Satvik Ashram".into(),
                slug: "mvt-guesthouse-vrindavan".into(),
                destination_slug: "vrindavan".into(),
                destination_name: "Vrindavan".into(),
                stay_type: "ashram".into(),
                price_per_night: 1850.0,
                status: "APPROVED".into(),
                owner_name: "ISKCON Seva Trust".into(),
                owner_email: "mvt@brijnidhi.org".into(),
                owner_phone: Some("+91 98765 11001".into()),
                submitted_at: "01 Oct 2026".into(),
                documents_verified: true,
                trade_license_no: Some("TL-VRN-1082".into()),
                fssai_license_no: Some("10020051000108".into()),
                nearest_landmark: Some("ISKCON Krishna Balaram Mandir".into()),
                address: Some("Bhaktivedanta Swami Marg, Raman Reti, Vrindavan".into()),
                pure_satvik_kitchen: true,
                temple_darshan_assistance: true,
            },
            AdminHotel {
                id: "htl-vrn-02".into(),
                name: "Radha Raman Kripa Niwas".into(),
                slug: "radha-raman-kripa-niwas".into(),
                destination_slug: "vrindavan".into(),
                destination_name: "Vrindavan".into(),
                stay_type: "hotel".into(),
                price_per_night: 2200.0,
                status: "APPROVED".into(),
                owner_name: "Shri Radhavallabh Seva Trust".into(),
                owner_email: "seva@radhavallabh.org".into(),
                owner_phone: Some("+91 98765 11002".into()),
                submitted_at: "02 Oct 2026".into(),
                documents_verified: true,
                trade_license_no: Some("TL-VRN-2094".into()),
                fssai_license_no: Some("10020051000109".into()),
                nearest_landmark: Some("Radha Raman Temple".into()),
                address: Some("Near Nidhivan Marg, Vrindavan".into()),
                pure_satvik_kitchen: true,
                temple_darshan_assistance: true,
            },
            AdminHotel {
                id: "htl-mth-01".into(),
                name: "Shri Krishna Janmasthan Heritage Retreat".into(),
                slug: "krishna-janmasthan-retreat".into(),
                destination_slug: "mathura".into(),
                destination_name: "Mathura".into(),
                stay_type: "heritage".into(),
                price_per_night: 2800.0,
                status: "APPROVED".into(),
                owner_name: "Mathura Dham Yatri Seva".into(),
                owner_email: "mathura@brajstay.com".into(),
                owner_phone: Some("+91 98765 11003".into()),
                submitted_at: "02 Oct 2026".into(),
                documents_verified: true,
                trade_license_no: Some("TL-MTH-9021".into()),
                fssai_license_no: Some("10020051000110".into()),
                nearest_landmark: Some("Shri Krishna Janmabhoomi".into()),
                address: Some("Deeg Gate, Mathura".into()),
                pure_satvik_kitchen: true,
                temple_darshan_assistance: true,
            },
            AdminHotel {
                id: "htl-bar-01".into(),
                name: "Shriji Ladli Mahal Bhawan".into(),
                slug: "shriji-ladli-mahal".into(),
                destination_slug: "barsana".into(),
                destination_name: "Barsana".into(),
                stay_type: "dharamshala".into(),
                price_per_night: 1200.0,
                status: "APPROVED".into(),
                owner_name: "Barsana Dham Samiti".into(),
                owner_email: "barsana@brijnidhi.org".into(),
                owner_phone: Some("+91 98765 11004".into()),
                submitted_at: "03 Oct 2026".into(),
                documents_verified: true,
                trade_license_no: Some("TL-BAR-3301".into()),
                fssai_license_no: Some("10020051000111".into()),
                nearest_landmark: Some("Shri Radha Rani Temple".into()),
                address: Some("Bhanukhor Marg, Barsana".into()),
                pure_satvik_kitchen: true,
                temple_darshan_assistance: true,
            },
            AdminHotel {
                id: "htl-gov-01".into(),
                name: "Govardhan Giriraj Kripa Dham".into(),
                slug: "giriraj-kripa-dham".into(),
                destination_slug: "govardhan".into(),
                destination_name: "Govardhan".into(),
                stay_type: "ashram".into(),
                price_per_night: 1450.0,
                status: "APPROVED".into(),
                owner_name: "Parikrama Seva Sansthan".into(),
                owner_email: "parikrama@govardhan.org".into(),
                owner_phone: Some("+91 98765 11005".into()),
                submitted_at: "03 Oct 2026".into(),
                documents_verified: true,
                trade_license_no: Some("TL-GOV-5012".into()),
                fssai_license_no: Some("10020051000112".into()),
                nearest_landmark: Some("Dan Ghati Mandir".into()),
                address: Some("Parikrama Marg, Govardhan".into()),
                pure_satvik_kitchen: true,
                temple_darshan_assistance: true,
            },
        ];

        // Initial Seed Bhojanalayas
        let bhojanalayas = vec![
            Bhojanalaya {
                id: "bhojan-vrn-01".into(),
                name: "Braj Ras Satvik Rasoi".into(),
                hindi_name: Some("ब्रज रस सात्विक रसोई".into()),
                slug: "braj-ras-satvik-rasoi".into(),
                destination_slug: "vrindavan".into(),
                destination_name: "Vrindavan".into(),
                category: "thali".into(),
                category_name: "Pure Satvik Thali".into(),
                speciality_dishes: vec!["Radha Rani Kheer".into(), "Makhan Roti".into(), "Kadhi Pakoda".into(), "Braj Peda".into()],
                price_range: "₹₹ (₹180 - ₹350)".into(),
                avg_cost_for_two: 280.0,
                pure_satvik: true,
                pure_desi_ghee: true,
                timings: "11:00 AM - 10:00 PM".into(),
                nearest_landmark: "Banke Bihari Mandir".into(),
                distance_to_landmark: "200m from Banke Bihari".into(),
                walk_minutes: 3,
                address: "Near Banke Bihari Temple Marg, Vrindavan".into(),
                contact_phone: "+91 98765 22001".into(),
                rating_score: 4.9,
                reviews_count: 320,
                status: "APPROVED".into(),
                is_featured: true,
                images: vec!["https://images.unsplash.com/photo-1613292443284-c772179f8006?q=80&w=1000&auto=format&fit=crop".into()],
                features: vec!["100% Satvik Pure Veg".into(), "Pure Desi Ghee".into(), "No Onion No Garlic".into(), "AC Family Dining".into()],
                description: "Authentic devotional Braj thali cooked in pure cow desi ghee without onion and garlic.".into(),
            },
            Bhojanalaya {
                id: "bhojan-mth-01".into(),
                name: "Radha Rani Annapurna Prasadam".into(),
                hindi_name: Some("राधा रानी अन्नपूर्णा प्रसादम".into()),
                slug: "radha-rani-annapurna".into(),
                destination_slug: "mathura".into(),
                destination_name: "Mathura".into(),
                category: "buffet".into(),
                category_name: "Temple Prasadam Buffet".into(),
                speciality_dishes: vec!["Mathura Ke Peda".into(), "Bedmi Puri Sabzi".into(), "Khurchan".into(), "Rabdi Jalebi".into()],
                price_range: "₹₹ (₹150 - ₹300)".into(),
                avg_cost_for_two: 250.0,
                pure_satvik: true,
                pure_desi_ghee: true,
                timings: "08:00 AM - 10:30 PM".into(),
                nearest_landmark: "Shri Krishna Janmabhoomi".into(),
                distance_to_landmark: "150m from Gate No 1".into(),
                walk_minutes: 2,
                address: "Deeg Gate Marg, Mathura".into(),
                contact_phone: "+91 98765 22002".into(),
                rating_score: 4.8,
                reviews_count: 215,
                status: "APPROVED".into(),
                is_featured: true,
                images: vec!["https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1000&auto=format&fit=crop".into()],
                features: vec!["Pure Desi Ghee".into(), "Traditional Peda Counter".into(), "Devotee Fasting (Vrat) Menu".into()],
                description: "Spiritual dining experience offering daily temple bhog style recipes and legendary Mathura peda.".into(),
            },
        ];

        // Initial Seed Bhojan Reservations
        let bhojan_reservations = vec![
            BhojanReservation {
                id: "res-bhojan-101".into(),
                bhojanalaya_id: "bhojan-vrn-01".into(),
                bhojanalaya_name: "Braj Ras Satvik Rasoi".into(),
                guest_name: "Radhe Krishna Parivar".into(),
                guest_phone: "+91 98765 33001".into(),
                guest_email: Some("radhe@gmail.com".into()),
                date: "Today".into(),
                meal_time: "lunch".into(),
                thali_count: 4,
                special_requests: Some("Extra Braj Peda and pure desi ghee puri".into()),
                status: "CONFIRMED".into(),
                created_at: "Today, 10:15 AM".into(),
            },
            BhojanReservation {
                id: "res-bhojan-102".into(),
                bhojanalaya_id: "bhojan-mth-01".into(),
                bhojanalaya_name: "Radha Rani Annapurna Prasadam".into(),
                guest_name: "Gopal Yatri Group".into(),
                guest_phone: "+91 98765 33002".into(),
                guest_email: Some("gopal@yatra.org".into()),
                date: "Tomorrow".into(),
                meal_time: "dinner".into(),
                thali_count: 6,
                special_requests: Some("Quiet seating near deities".into()),
                status: "CONFIRMED".into(),
                created_at: "Today, 11:45 AM".into(),
            },
        ];

        // Initial Seed Bookings
        let bookings = vec![
            Booking {
                id: "book-101".into(),
                booking_reference: "BN-VRN-10824".into(),
                hotel_id: "htl-vrn-01".into(),
                hotel_name: "MVT Guesthouse & Satvik Ashram".into(),
                room_id: "rm-1".into(),
                room_name: "Deluxe Satvik AC Room".into(),
                guest_name: "Devotee Ramesh (Delhi)".into(),
                guest_phone: "+91 98765 44001".into(),
                guest_email: "ramesh@pilgrim.in".into(),
                check_in: "2026-10-07".into(),
                check_out: "2026-10-09".into(),
                guests_count: 2,
                rooms_count: 1,
                total_nights: 2,
                room_charges: 3700.0,
                tax_amount: 444.0,
                add_on_total: 250.0,
                grand_total: 4394.0,
                status: "CONFIRMED".into(),
                created_at: "06 Oct 2026".into(),
            },
            Booking {
                id: "book-102".into(),
                booking_reference: "BN-MTH-90218".into(),
                hotel_id: "htl-mth-01".into(),
                hotel_name: "Shri Krishna Janmasthan Heritage Retreat".into(),
                room_id: "rm-2".into(),
                room_name: "Heritage Sanctum Suite".into(),
                guest_name: "Priyanshu & Family".into(),
                guest_phone: "+91 98765 44002".into(),
                guest_email: "priyanshu@yatra.com".into(),
                check_in: "2026-10-08".into(),
                check_out: "2026-10-10".into(),
                guests_count: 3,
                rooms_count: 1,
                total_nights: 2,
                room_charges: 5600.0,
                tax_amount: 672.0,
                add_on_total: 800.0,
                grand_total: 7072.0,
                status: "CONFIRMED".into(),
                created_at: "06 Oct 2026".into(),
            },
        ];

        // Initial Seed Users
        let users = vec![
            AdminUser {
                id: "usr-1".into(),
                name: "Girish Sharma".into(),
                email: "admin@brijnidhi.org".into(),
                role: "SYSTEM_ADMIN".into(),
                status: "ACTIVE".into(),
                joined: "03 Oct 2026".into(),
            },
            AdminUser {
                id: "usr-2".into(),
                name: "Radha Mohan Das".into(),
                email: "partner@vrindavan.org".into(),
                role: "HOTEL_ADMIN".into(),
                status: "ACTIVE".into(),
                joined: "04 Oct 2026".into(),
            },
            AdminUser {
                id: "usr-3".into(),
                name: "Shyam Sundar Seva".into(),
                email: "bhojan@mathura.org".into(),
                role: "RESTAURANT_MANAGER".into(),
                status: "ACTIVE".into(),
                joined: "04 Oct 2026".into(),
            },
        ];

        // Initial Settings
        let settings = PlatformSettings {
            sacred_notice_text: "🌸 Radhe Radhe! Clean, pious satvik stays & authentic Braj bhojan with temple darshan assistance.".into(),
            sacred_notice_enabled: true,
            platform_commission_pct: 10.0,
            support_phone: "+91 98765 43210".into(),
            support_email: "seva@brijnidhi.org".into(),
            payouts_auto_approve: false,
            maintenance_mode: false,
        };

        // Initial Audit Logs
        let audit_logs = vec![
            AuditLog {
                id: "aud-1".into(),
                timestamp: "06 Oct 2026, 09:30 PM".into(),
                user: "Rust Engine".into(),
                action: "SYSTEM_INITIALIZED".into(),
                module: "Docker Engine".into(),
                target_id: "sys-01".into(),
                details: "High-performance Rust Admin Engine launched in Docker container.".into(),
                ip_address: "127.0.0.1".into(),
            },
            AuditLog {
                id: "aud-2".into(),
                timestamp: "06 Oct 2026, 09:40 PM".into(),
                user: "Girish Sharma".into(),
                action: "ADMIN_GATE_VERIFIED".into(),
                module: "Security".into(),
                target_id: "usr-1".into(),
                details: "Project Owner authenticated via Passcode Gate (1082026 / Brijnidhi@Admin2026).".into(),
                ip_address: "127.0.0.1".into(),
            },
        ];

        Self {
            hotels,
            bhojanalayas,
            bhojan_reservations,
            bookings,
            users,
            settings,
            audit_logs,
        }
    }

    pub fn log_audit(&mut self, user: &str, action: &str, module: &str, target_id: &str, details: &str, ip: &str) {
        let log = AuditLog {
            id: format!("aud-{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now().format("%d %b %Y, %I:%M %p").to_string(),
            user: user.to_string(),
            action: action.to_string(),
            module: module.to_string(),
            target_id: target_id.to_string(),
            details: details.to_string(),
            ip_address: ip.to_string(),
        };
        self.audit_logs.insert(0, log);
    }
}

// -------------------------------------------------------------
// ROUTE HANDLERS
// -------------------------------------------------------------

// Health check
async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "online",
        "service": "Brijnidhi Admin Rust Backend (Dockerized)",
        "timestamp": Utc::now().to_rfc3339()
    }))
}

// 1. Auth Verify
#[derive(Deserialize)]
struct AuthRequest {
    passcode: Option<String>,
    email: Option<String>,
}

async fn admin_auth_verify(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(body): Json<AuthRequest>,
) -> impl IntoResponse {
    let valid_keys = ["Brijnidhi@Admin2026", "1082026", "RadheAdmin#2026"];
    let provided = body.passcode.unwrap_or_default().trim().to_string();

    if valid_keys.contains(&provided.as_str()) {
        let mut st = state.write().unwrap();
        let token = format!("brijnidhi_admin_sec_token_{}", Utc::now().timestamp_millis());
        st.log_audit(
            "Girish Sharma",
            "ADMIN_LOGIN_SUCCESS",
            "Security",
            "usr-1",
            "Project Owner authenticated successfully via Rust Docker Engine",
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Admin security verification passed in Rust backend. Welcome, Project Owner!",
                "token": token,
                "admin": {
                    "id": "usr-1",
                    "name": "Girish Sharma",
                    "email": body.email.unwrap_or_else(|| "admin@brijnidhi.org".into()),
                    "role": "SYSTEM_ADMIN"
                }
            })),
        )
    } else {
        let mut st = state.write().unwrap();
        st.log_audit(
            "Unknown Entity",
            "ADMIN_LOGIN_FAILED",
            "Security",
            "security-gate",
            "Failed admin authentication attempt in Rust backend",
            "127.0.0.1",
        );

        (
            StatusCode::UNAUTHORIZED,
            Json(serde_json::json!({
                "success": false,
                "message": "Invalid Admin Security Passcode. Access denied."
            })),
        )
    }
}

// 2. Overview Metrics
async fn get_overview(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
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
            "sacredNoticeEnabled": st.settings.sacred_notice_enabled
        }
    }))
}

// 3. Hotels Endpoints
async fn get_hotels(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "count": st.hotels.len(),
        "data": st.hotels
    }))
}

#[derive(Deserialize)]
struct CreateHotelDto {
    name: String,
    #[serde(rename = "destinationSlug", default = "default_destination_slug")]
    destination_slug: String,
    #[serde(rename = "stayType", default = "default_stay_type")]
    stay_type: String,
    #[serde(rename = "pricePerNight", default = "default_price")]
    price_per_night: f64,
    #[serde(rename = "nearestLandmark")]
    nearest_landmark: Option<String>,
    address: Option<String>,
    #[serde(rename = "ownerName", default = "default_owner")]
    owner_name: String,
    #[serde(rename = "ownerEmail", default = "default_email")]
    owner_email: String,
    #[serde(rename = "pureSatvikKitchen", default = "default_true")]
    pure_satvik_kitchen: bool,
    #[serde(rename = "templeDarshanAssistance", default = "default_true")]
    temple_darshan_assistance: bool,
    #[serde(default)]
    status: Option<String>,
}

async fn create_hotel(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateHotelDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let id = format!("prop-{}", Utc::now().timestamp_millis());
    let slug = payload.name.to_lowercase().replace(' ', "-");
    let dest_name = match payload.destination_slug.as_str() {
        "mathura" => "Mathura",
        "barsana" => "Barsana",
        "govardhan" => "Govardhan",
        _ => "Vrindavan",
    };
    let status = payload.status.unwrap_or_else(|| "APPROVED".to_string());

    let hotel = AdminHotel {
        id: id.clone(),
        name: payload.name.clone(),
        slug,
        destination_slug: payload.destination_slug,
        destination_name: dest_name.to_string(),
        stay_type: payload.stay_type,
        price_per_night: payload.price_per_night,
        status,
        owner_name: payload.owner_name,
        owner_email: payload.owner_email,
        owner_phone: None,
        submitted_at: Utc::now().format("%d %b %Y").to_string(),
        documents_verified: true,
        trade_license_no: None,
        fssai_license_no: None,
        nearest_landmark: payload.nearest_landmark,
        address: payload.address,
        pure_satvik_kitchen: payload.pure_satvik_kitchen,
        temple_darshan_assistance: payload.temple_darshan_assistance,
    };

    st.hotels.insert(0, hotel.clone());
    st.log_audit(
        "Project Owner",
        "HOTEL_ADDED",
        "Hotel",
        &id,
        &format!("Added new hotel '{}' in Rust engine", payload.name),
        "127.0.0.1",
    );

    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("Hotel '{}' created successfully.", payload.name),
            "data": hotel
        })),
    )
}

async fn update_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        if let Some(name) = payload.get("name").and_then(|v| v.as_str()) {
            hotel.name = name.to_string();
        }
        if let Some(price) = payload.get("pricePerNight").and_then(|v| v.as_f64()) {
            hotel.price_per_night = price;
        }
        if let Some(stay_type) = payload.get("stayType").and_then(|v| v.as_str()) {
            hotel.stay_type = stay_type.to_string();
        }
        if let Some(dest) = payload.get("destinationSlug").and_then(|v| v.as_str()) {
            hotel.destination_slug = dest.to_string();
            hotel.destination_name = match dest {
                "mathura" => "Mathura".into(),
                "barsana" => "Barsana".into(),
                "govardhan" => "Govardhan".into(),
                _ => "Vrindavan".into(),
            };
        }
        if let Some(landmark) = payload.get("nearestLandmark").and_then(|v| v.as_str()) {
            hotel.nearest_landmark = Some(landmark.to_string());
        }
        if let Some(addr) = payload.get("address").and_then(|v| v.as_str()) {
            hotel.address = Some(addr.to_string());
        }

        let updated = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_UPDATED",
            "Hotel",
            &id,
            &format!("Updated hotel '{}'", updated.name),
            "127.0.0.1",
        );

        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Hotel '{}' updated successfully.", updated.name),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

async fn delete_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.hotels.iter().position(|h| h.id == id) {
        let removed = st.hotels.remove(idx);
        st.log_audit(
            "Project Owner",
            "HOTEL_DELETED",
            "Hotel",
            &id,
            &format!("Deleted hotel '{}'", removed.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' was permanently deleted.", removed.name),
                "data": removed
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

async fn approve_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = "APPROVED".into();
        hotel.documents_verified = true;
        let approved = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_APPROVED",
            "Hotel",
            &id,
            &format!("Approved property '{}' into live catalog", approved.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' has been APPROVED and is now LIVE.", approved.name),
                "data": approved
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

#[derive(Deserialize)]
struct RejectDto {
    reason: Option<String>,
}

async fn reject_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<RejectDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = "REJECTED".into();
        let rejected = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_REJECTED",
            "Hotel",
            &id,
            &format!("Rejected property '{}'. Reason: {:?}", rejected.name, payload.reason),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' has been REJECTED.", rejected.name),
                "data": rejected
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

async fn toggle_suspend_hotel(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(hotel) = st.hotels.iter_mut().find(|h| h.id == id) {
        hotel.status = if hotel.status == "SUSPENDED" {
            "APPROVED".into()
        } else {
            "SUSPENDED".into()
        };
        let updated = hotel.clone();
        st.log_audit(
            "Project Owner",
            "HOTEL_SUSPENDED_TOGGLE",
            "Hotel",
            &id,
            &format!("Toggled status of '{}' to {}", updated.name, updated.status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Property '{}' status is now {}.", updated.name, updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Hotel not found" })),
        )
    }
}

// 4. Bhojan Endpoints
async fn get_bhojan(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bhojanalayas.len(),
        "data": st.bhojanalayas
    }))
}

async fn create_bhojan(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(mut payload): Json<Bhojanalaya>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if payload.id.is_empty() {
        payload.id = format!("bhojan-{}", Utc::now().timestamp_millis());
    }
    st.bhojanalayas.insert(0, payload.clone());
    st.log_audit(
        "Project Owner",
        "BHOJAN_ADDED",
        "Bhojanalaya",
        &payload.id,
        &format!("Added bhojan spot '{}'", payload.name),
        "127.0.0.1",
    );
    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("Bhojanalaya '{}' created successfully.", payload.name),
            "data": payload
        })),
    )
}

async fn update_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<Bhojanalaya>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(item) = st.bhojanalayas.iter_mut().find(|b| b.id == id) {
        *item = payload;
        item.id = id.clone();
        let updated = item.clone();
        st.log_audit(
            "Project Owner",
            "BHOJAN_UPDATED",
            "Bhojanalaya",
            &id,
            &format!("Updated bhojan spot '{}'", updated.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Bhojanalaya '{}' updated successfully.", updated.name),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

async fn delete_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.bhojanalayas.iter().position(|b| b.id == id) {
        let removed = st.bhojanalayas.remove(idx);
        st.log_audit(
            "Project Owner",
            "BHOJAN_DELETED",
            "Bhojanalaya",
            &id,
            &format!("Deleted bhojan spot '{}'", removed.name),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Bhojanalaya deleted successfully."
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

#[derive(Deserialize)]
struct StatusDto {
    status: Option<String>,
}

async fn toggle_status_bhojan(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<StatusDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(b) = st.bhojanalayas.iter_mut().find(|x| x.id == id) {
        b.status = payload.status.unwrap_or_else(|| {
            if b.status == "APPROVED" {
                "SUSPENDED".into()
            } else {
                "APPROVED".into()
            }
        });
        let updated = b.clone();
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Status updated to {}", updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Bhojanalaya not found" })),
        )
    }
}

async fn get_bhojan_reservations(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bhojan_reservations.len(),
        "data": st.bhojan_reservations
    }))
}

// 5. Bookings Endpoints
async fn get_bookings(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.bookings.len(),
        "data": st.bookings
    }))
}

async fn update_booking_status(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<StatusDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let new_status = payload.status.unwrap_or_else(|| "CONFIRMED".into());
    if let Some(bk) = st.bookings.iter_mut().find(|b| b.id == id) {
        bk.status = new_status.clone();
        let updated = bk.clone();
        st.log_audit(
            "Project Owner",
            "BOOKING_STATUS_CHANGED",
            "Booking",
            &id,
            &format!("Updated booking status to {}", new_status),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("Booking status updated to {}", new_status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Booking not found" })),
        )
    }
}

async fn delete_booking(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.bookings.iter().position(|b| b.id == id) {
        st.bookings.remove(idx);
        st.log_audit(
            "Project Owner",
            "BOOKING_DELETED",
            "Booking",
            &id,
            "Deleted booking record",
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": "Booking permanently deleted."
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "Booking not found" })),
        )
    }
}

// 6. Users Endpoints
async fn get_users(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "total": st.users.len(),
        "data": st.users
    }))
}

#[derive(Deserialize)]
struct CreateUserDto {
    name: String,
    email: String,
    #[serde(default = "default_role")]
    role: String,
}
fn default_role() -> String { "CUSTOMER".into() }

async fn create_user(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<CreateUserDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    let new_user = AdminUser {
        id: format!("usr-{}", Utc::now().timestamp_millis()),
        name: payload.name.trim().to_string(),
        email: payload.email.trim().to_lowercase(),
        role: payload.role,
        status: "ACTIVE".into(),
        joined: Utc::now().format("%d %b %Y").to_string(),
    };
    st.users.insert(0, new_user.clone());
    st.log_audit(
        "Project Owner",
        "USER_CREATED",
        "User",
        &new_user.id,
        &format!("Created user account {}", new_user.email),
        "127.0.0.1",
    );
    (
        StatusCode::CREATED,
        Json(serde_json::json!({
            "success": true,
            "message": format!("User '{}' created successfully.", new_user.name),
            "data": new_user
        })),
    )
}

#[derive(Deserialize)]
struct RoleDto {
    role: String,
}

async fn update_user_role(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<RoleDto>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(user) = st.users.iter_mut().find(|u| u.id == id) {
        user.role = payload.role.clone();
        let updated = user.clone();
        st.log_audit(
            "Project Owner",
            "USER_ROLE_CHANGED",
            "User",
            &id,
            &format!("Changed role of {} to {}", updated.email, payload.role),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User role updated to {}", payload.role),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}

async fn toggle_suspend_user(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(user) = st.users.iter_mut().find(|u| u.id == id) {
        user.status = if user.status == "SUSPENDED" {
            "ACTIVE".into()
        } else {
            "SUSPENDED".into()
        };
        let updated = user.clone();
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User status updated to {}", updated.status),
                "data": updated
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}

async fn delete_user(
    Path(id): Path<String>,
    State(state): State<Arc<RwLock<AppState>>>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    if let Some(idx) = st.users.iter().position(|u| u.id == id) {
        let removed = st.users.remove(idx);
        st.log_audit(
            "Project Owner",
            "USER_DELETED",
            "User",
            &id,
            &format!("Deleted user account {}", removed.email),
            "127.0.0.1",
        );
        (
            StatusCode::OK,
            Json(serde_json::json!({
                "success": true,
                "message": format!("User '{}' removed.", removed.name)
            })),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "success": false, "message": "User not found" })),
        )
    }
}

// 7. Settings Endpoints
async fn get_settings(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "data": st.settings
    }))
}

async fn update_settings(
    State(state): State<Arc<RwLock<AppState>>>,
    Json(payload): Json<PlatformSettings>,
) -> impl IntoResponse {
    let mut st = state.write().unwrap();
    st.settings = payload.clone();
    st.log_audit(
        "Project Owner",
        "SETTINGS_UPDATED",
        "Settings",
        "platform-config",
        &format!("Updated platform settings in Rust: Commission {}%", payload.platform_commission_pct),
        "127.0.0.1",
    );
    Json(serde_json::json!({
        "success": true,
        "message": "Platform settings updated successfully.",
        "data": payload
    }))
}

// 8. Public Notice Banner
async fn get_public_notice(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "data": {
            "text": st.settings.sacred_notice_text,
            "enabled": st.settings.sacred_notice_enabled,
            "supportPhone": st.settings.support_phone
        }
    }))
}

// 9. Payments & Financials
async fn get_payments(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    let real_stay_revenue: f64 = st
        .bookings
        .iter()
        .filter(|b| b.status == "CONFIRMED" || b.status == "COMPLETED")
        .map(|b| b.grand_total)
        .sum();
    let estimated: f64 = st
        .hotels
        .iter()
        .filter(|h| h.status == "APPROVED")
        .map(|h| h.price_per_night * 2.0)
        .sum();
    let gross_volume = if real_stay_revenue > 0.0 {
        real_stay_revenue
    } else {
        estimated
    };
    let commission = (gross_volume * (st.settings.platform_commission_pct / 100.0)).round();
    let payouts = gross_volume - commission;
    let pending_payouts = (payouts * 0.3).round();

    Json(serde_json::json!({
        "success": true,
        "data": {
            "totalGrossBookings": gross_volume,
            "platformCommissions": commission,
            "payoutsToHotels": payouts,
            "pendingPayouts": pending_payouts,
            "commissionRatePct": st.settings.platform_commission_pct,
            "recentTransactions": [
                {
                    "id": "tx-101",
                    "type": "STAY_PAYMENT",
                    "guest": "Devotee Ramesh (Delhi)",
                    "amount": 4394,
                    "commission": 439,
                    "date": "Today, 11:20 AM",
                    "status": "SETTLED"
                },
                {
                    "id": "tx-102",
                    "type": "BHOJAN_PRASADAM",
                    "guest": "Radhe Krishna Parivar",
                    "amount": 1120,
                    "commission": 112,
                    "date": "Today, 01:15 PM",
                    "status": "SETTLED"
                }
            ]
        }
    }))
}

// 10. Audit Logs
async fn get_audit_logs(State(state): State<Arc<RwLock<AppState>>>) -> impl IntoResponse {
    let st = state.read().unwrap();
    Json(serde_json::json!({
        "success": true,
        "data": st.audit_logs
    }))
}

// -------------------------------------------------------------
// MAIN & ROUTER
// -------------------------------------------------------------

#[tokio::main]
async fn main() {
    println!("🦀 Starting Brijnidhi Project Owner Admin Backend in Rust (Dockerized)...");

    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Permissive CORS for development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/admin/health", get(health_check))
        // Auth & Overview
        .route("/api/admin/auth/verify", post(admin_auth_verify))
        .route("/api/admin/overview", get(get_overview))
        // Hotels
        .route("/api/admin/hotels", get(get_hotels).post(create_hotel))
        .route(
            "/api/admin/hotels/:id",
            put(update_hotel).delete(delete_hotel),
        )
        .route("/api/admin/hotels/:id/approve", patch(approve_hotel))
        .route("/api/admin/hotels/:id/reject", patch(reject_hotel))
        .route("/api/admin/hotels/:id/suspend", patch(toggle_suspend_hotel))
        // Bhojan
        .route("/api/admin/bhojan", get(get_bhojan).post(create_bhojan))
        .route(
            "/api/admin/bhojan/:id",
            put(update_bhojan).delete(delete_bhojan),
        )
        .route("/api/admin/bhojan/:id/status", patch(toggle_status_bhojan))
        .route(
            "/api/admin/bhojan/reservations",
            get(get_bhojan_reservations),
        )
        // Bookings
        .route("/api/admin/bookings", get(get_bookings))
        .route(
            "/api/admin/bookings/:id/status",
            patch(update_booking_status),
        )
        .route("/api/admin/bookings/:id", delete(delete_booking))
        // Users
        .route("/api/admin/users", get(get_users).post(create_user))
        .route("/api/admin/users/:id/role", patch(update_user_role))
        .route(
            "/api/admin/users/:id/suspend",
            patch(toggle_suspend_user),
        )
        .route("/api/admin/users/:id", delete(delete_user))
        // Settings & Notice
        .route("/api/admin/settings", get(get_settings).put(update_settings))
        .route("/api/admin/public-notice", get(get_public_notice))
        // Payments & Audit
        .route("/api/admin/payments", get(get_payments))
        .route("/api/admin/audit-logs", get(get_audit_logs))
        .layer(cors)
        .with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 5001));
    println!("🚀 Rust Admin Backend listening on http://0.0.0.0:5001");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
