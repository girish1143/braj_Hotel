use serde::{Deserialize, Serialize};

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
