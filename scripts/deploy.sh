#!/bin/bash
# ==============================================================================
# Brijnidhi Deployment Script
# Supports BOTH Option 1 (Docker) and Option 2 (Native Rust)
# Usage:
#   ./scripts/deploy.sh docker   # Run Rust backend via Docker
#   ./scripts/deploy.sh native   # Run Rust backend natively via PM2
#   ./scripts/deploy.sh          # Default (runs Docker for Rust, PM2 for Node/Next)
# ==============================================================================

set -e

MODE="${1:-docker}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Deploying Brijnidhi (Rust Admin Mode: $MODE)..."

# 1. Pull Latest Code
echo "📥 1. Pulling latest code from git..."
git pull origin main

# 2. Build Node.js Backend (Port 5000)
echo "📦 2. Building Node.js Backend..."
cd "$PROJECT_ROOT/backend"
npm ci --prefer-offline --no-audit
npm run build

# 3. Build Next.js Frontend (Port 3000)
echo "📦 3. Building Next.js Frontend..."
cd "$PROJECT_ROOT/frontend"
npm ci --prefer-offline --no-audit
npm run build

# 4. Handle Rust Admin Backend (Port 5001)
if [ "$MODE" = "native" ]; then
  echo "🦀 4. Building Rust Backend NATIVELY (Option 2)..."
  source "$HOME/.cargo/env" || true
  cd "$PROJECT_ROOT/backend-rust"
  cargo build --release

  # Stop any existing Docker container on port 5001 if running
  docker stop brijnidhi-admin-rust-container 2>/dev/null || true

  # Restart PM2 with native rust configuration
  cd "$PROJECT_ROOT"
  pm2 startOrReload ecosystem.config.js --env production --only brijnidhi-rust-admin,brijnidhi-backend,brijnidhi-frontend
else
  echo "🐳 4. Building & Running Rust Backend via DOCKER (Option 1)..."
  cd "$PROJECT_ROOT/backend-rust"
  docker build -t brijnidhi-admin-rust .
  docker stop brijnidhi-admin-rust-container 2>/dev/null || true
  docker rm brijnidhi-admin-rust-container 2>/dev/null || true
  docker run -d --name brijnidhi-admin-rust-container -p 5001:5001 --restart always brijnidhi-admin-rust:latest

  # Restart PM2 for Node & Next.js only
  cd "$PROJECT_ROOT"
  pm2 startOrReload ecosystem.config.js --env production --only brijnidhi-backend,brijnidhi-frontend
fi

pm2 save

# 5. Verify Health Checks
echo "🩺 5. Performing Health Checks..."
sleep 3

# Check Node API (5000)
curl -s -f -m 5 http://127.0.0.1:5000/api/health > /dev/null && echo "✅ Port 5000 (Node API): HEALTHY" || echo "⚠️ Port 5000 check failed"

# Check Rust Admin API (5001)
curl -s -f -m 5 http://127.0.0.1:5001/health > /dev/null && echo "✅ Port 5001 (Rust Admin): HEALTHY" || echo "⚠️ Port 5001 check failed"

# Check Frontend (3000)
curl -s -f -m 5 http://127.0.0.1:3000 > /dev/null && echo "✅ Port 3000 (Frontend): HEALTHY" || echo "⚠️ Port 3000 check failed"

echo "🎉 Deployment completed successfully!"
