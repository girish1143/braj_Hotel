use crate::models::{
    AdminHotel, AdminUser, AuditLog, BhojanReservation, Bhojanalaya, Booking, Coupon, Customer,
    Driver, PaymentRecord, PlatformSettings, Property, Review,
};
use chrono::Utc;

#[derive(Debug, Clone)]
pub struct AppState {
    pub properties: Vec<Property>,
    pub drivers: Vec<Driver>,
    pub bookings: Vec<Booking>,
    pub customers: Vec<Customer>,
    pub payments: Vec<PaymentRecord>,
    pub reviews: Vec<Review>,
    pub coupons: Vec<Coupon>,
    pub users: Vec<AdminUser>,
    pub settings: PlatformSettings,
    pub audit_logs: Vec<AuditLog>,

    // Backwards compatibility collections
    pub hotels: Vec<AdminHotel>,
    pub bhojanalayas: Vec<Bhojanalaya>,
    pub bhojan_reservations: Vec<BhojanReservation>,
}

impl AppState {
    pub fn new() -> Self {
        // Zero dummy data - completely clean, production-ready state
        let properties: Vec<Property> = Vec::new();
        let drivers: Vec<Driver> = Vec::new();
        let bookings: Vec<Booking> = Vec::new();
        let customers: Vec<Customer> = Vec::new();
        let payments: Vec<PaymentRecord> = Vec::new();
        let reviews: Vec<Review> = Vec::new();
        let coupons: Vec<Coupon> = Vec::new();
        let hotels: Vec<AdminHotel> = Vec::new();
        let bhojanalayas: Vec<Bhojanalaya> = Vec::new();
        let bhojan_reservations: Vec<BhojanReservation> = Vec::new();

        // Project Owner / Super Admin account
        let users = vec![AdminUser {
            id: "usr-super-1".into(),
            name: "Girish Sharma".into(),
            email: "admin@brijnidhi.org".into(),
            role: "SUPER_ADMIN".into(),
            status: "ACTIVE".into(),
            joined: Utc::now().format("%d %b %Y").to_string(),
        }];

        // Production platform settings
        let settings = PlatformSettings {
            sacred_notice_text: "🌸 Radhe Radhe! Brijnidhi Multi-Property Hotel, Ashram, Dharamshala, Restaurant & Tourism Platform.".into(),
            sacred_notice_enabled: true,
            platform_commission_pct: 10.0,
            support_phone: "+91 98765 43210".into(),
            support_email: "seva@brijnidhi.org".into(),
            payouts_auto_approve: false,
            maintenance_mode: false,
        };

        // Initial system initialization audit log
        let audit_logs = vec![AuditLog {
            id: format!("aud-{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now().format("%d %b %Y, %I:%M %p").to_string(),
            user: "Girish Sharma".into(),
            action: "SYSTEM_INITIALIZED".into(),
            module: "System".into(),
            target_id: "sys-01".into(),
            details: "Brijnidhi Rust Multi-Property Admin Platform online with zero dummy data.".into(),
            ip_address: "127.0.0.1".into(),
        }];

        Self {
            properties,
            drivers,
            bookings,
            customers,
            payments,
            reviews,
            coupons,
            users,
            settings,
            audit_logs,
            hotels,
            bhojanalayas,
            bhojan_reservations,
        }
    }

    pub fn log_audit(
        &mut self,
        user: &str,
        action: &str,
        module: &str,
        target_id: &str,
        details: &str,
        ip: &str,
    ) {
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
