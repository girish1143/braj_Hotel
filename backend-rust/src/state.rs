use crate::models::{
    AdminHotel, AdminUser, AuditLog, BhojanReservation, Bhojanalaya, Booking, PlatformSettings,
};
use chrono::Utc;

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
        // Zero dummy data - completely clean initial state for production
        let hotels: Vec<AdminHotel> = Vec::new();
        let bhojanalayas: Vec<Bhojanalaya> = Vec::new();
        let bhojan_reservations: Vec<BhojanReservation> = Vec::new();
        let bookings: Vec<Booking> = Vec::new();

        // Only the authentic Project Owner Admin account
        let users = vec![AdminUser {
            id: "usr-1".into(),
            name: "Girish Sharma".into(),
            email: "admin@brijnidhi.org".into(),
            role: "SYSTEM_ADMIN".into(),
            status: "ACTIVE".into(),
            joined: Utc::now().format("%d %b %Y").to_string(),
        }];

        // Production platform settings
        let settings = PlatformSettings {
            sacred_notice_text: "🌸 Radhe Radhe! Clean, pious satvik stays & authentic Braj bhojan with temple darshan assistance.".into(),
            sacred_notice_enabled: true,
            platform_commission_pct: 10.0,
            support_phone: "+91 98765 43210".into(),
            support_email: "seva@brijnidhi.org".into(),
            payouts_auto_approve: false,
            maintenance_mode: false,
        };

        // Clean initial audit log
        let audit_logs = vec![AuditLog {
            id: format!("aud-{}", Utc::now().timestamp_millis()),
            timestamp: Utc::now().format("%d %b %Y, %I:%M %p").to_string(),
            user: "Girish Sharma".into(),
            action: "SYSTEM_READY".into(),
            module: "System".into(),
            target_id: "sys-01".into(),
            details: "Brijnidhi Rust Core initialized cleanly with zero dummy data.".into(),
            ip_address: "127.0.0.1".into(),
        }];

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
