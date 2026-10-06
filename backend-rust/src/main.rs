mod handlers;
mod models;
mod routes;
mod state;

use axum::{routing::get, Json, Router};
use chrono::Utc;
use state::AppState;
use std::{
    net::SocketAddr,
    sync::{Arc, RwLock},
};
use tower_http::cors::{Any, CorsLayer};

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "online",
        "service": "Brijnidhi Admin Rust Backend (Modular)",
        "dummyData": false,
        "timestamp": Utc::now().to_rfc3339()
    }))
}

#[tokio::main]
async fn main() {
    println!("🦀 Starting Brijnidhi Project Owner Admin Backend in Rust (Modular)...");

    // Initialize global state with zero dummy data
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Permissive CORS layer for Next.js frontend communication
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the master application router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/admin/health", get(health_check))
        .nest("/api/admin", routes::admin_router())
        .layer(cors)
        .with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 5001));
    println!("🚀 Rust Admin Backend listening on http://0.0.0.0:5001");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
