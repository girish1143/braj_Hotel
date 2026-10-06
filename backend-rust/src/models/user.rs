use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminUser {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String, // "SYSTEM_ADMIN" | "HOTEL_ADMIN" | "RESTAURANT_MANAGER" | "CUSTOMER"
    pub status: String, // "ACTIVE" | "SUSPENDED"
    pub joined: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserDto {
    pub name: String,
    pub email: String,
    #[serde(default = "default_user_role")]
    pub role: String,
}

fn default_user_role() -> String {
    "CUSTOMER".into()
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRoleDto {
    pub role: String,
}
