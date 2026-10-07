#!/bin/bash
# ==============================================================================
# Brijnidhi EC2 All-In-One Setup Script (Ubuntu / Debian)
# Sets up BOTH Option 1 (Docker) and Option 2 (Native Rust Toolchain)
# ==============================================================================

set -e

echo "🌸 ==================================================="
echo "   Brijnidhi Platform: EC2 Full Environment Setup"
echo "   Setting up Docker + Native Rust Toolchain + Node/PM2"
echo "======================================================"

# 1. System Update & Essential Tools
echo "📦 1. Updating APT repositories and installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y \
  build-essential \
  curl \
  wget \
  git \
  pkg-config \
  libssl-dev \
  ca-certificates \
  gnupg \
  lsb-release \
  htop \
  ufw

# ------------------------------------------------------------------------------
# OPTION 1: Install & Configure Docker
# ------------------------------------------------------------------------------
echo "🐳 2. Installing Docker Engine (Option 1)..."
if ! command -v docker &> /dev/null; then
  sudo apt-get install -y docker.io docker-compose-plugin
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker "$USER"
  echo "✅ Docker installed successfully."
else
  echo "✅ Docker is already installed."
fi

# ------------------------------------------------------------------------------
# OPTION 2: Install Native Rust Toolchain (rustup, rustc, cargo)
# ------------------------------------------------------------------------------
echo "🦀 3. Installing Native Rust Toolchain (Option 2)..."
if ! command -v rustc &> /dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
  # Export into current subshell and permanent profile
  source "$HOME/.cargo/env"
  if ! grep -q '.cargo/env' "$HOME/.bashrc"; then
    echo 'source "$HOME/.cargo/env"' >> "$HOME/.bashrc"
  fi
  echo "✅ Native Rust installed successfully."
else
  echo "✅ Native Rust is already installed: $(rustc --version)"
fi

# ------------------------------------------------------------------------------
# Node.js 20 & PM2 Setup
# ------------------------------------------------------------------------------
echo "🟢 4. Checking Node.js 20 & PM2..."
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20.x..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2 globally..."
  sudo npm install -g pm2
fi

# ------------------------------------------------------------------------------
# Firewall / Port Configuration (UFW)
# ------------------------------------------------------------------------------
echo "🛡️ 5. Configuring UFW Firewall..."
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3000/tcp   # Next.js Frontend
sudo ufw allow 5000/tcp   # Node.js Express API
sudo ufw allow 5001/tcp   # Rust Admin API (Docker or Native)
sudo ufw --force enable || true

echo "✨ ==================================================="
echo "   INSTALLATION COMPLETE! Summary:"
echo "   - Docker:       $(docker --version 2>/dev/null || echo 'Installed (log out and back in for non-sudo permissions)')"
echo "   - Rustc:        $(source "$HOME/.cargo/env" 2>/dev/null; rustc --version 2>/dev/null || echo 'Installed in ~/.cargo/bin')"
echo "   - Cargo:        $(source "$HOME/.cargo/env" 2>/dev/null; cargo --version 2>/dev/null || echo 'Installed in ~/.cargo/bin')"
echo "   - Node.js:      $(node -v)"
echo "   - PM2:          $(pm2 -v)"
echo "======================================================"
echo "ℹ️  NOTE: If this is your first time adding yourself to the docker group,"
echo "   run 'newgrp docker' or log out and SSH back in."
