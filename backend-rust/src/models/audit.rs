use serde::{Deserialize, Serialize};

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
