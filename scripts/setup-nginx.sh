#!/bin/bash
# ==============================================================================
# Brijnidhi Nginx Setup & Enable Script
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🌐 Setting up Nginx Virtual Host for Brijnidhi..."

# 1. Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
  echo "Installing Nginx..."
  sudo apt-get update -y
  sudo apt-get install -y nginx
fi

# 2. Copy configuration to sites-available
echo "📋 Copying nginx/brijnidhi.conf to /etc/nginx/sites-available/brijnidhi.conf..."
sudo cp "$PROJECT_ROOT/nginx/brijnidhi.conf" /etc/nginx/sites-available/brijnidhi.conf

# 3. Enable site by creating symlink in sites-enabled
echo "🔗 Enabling site in sites-enabled..."
sudo ln -sf /etc/nginx/sites-available/brijnidhi.conf /etc/nginx/sites-enabled/brijnidhi.conf

# 4. Remove default site if present
if [ -f "/etc/nginx/sites-enabled/default" ]; then
  echo "🗑️ Disabling default Nginx site..."
  sudo rm -f /etc/nginx/sites-enabled/default
fi

# 5. Test Nginx configuration syntax
echo "🩺 Testing Nginx configuration syntax..."
sudo nginx -t

# 6. Reload Nginx
echo "🔄 Reloading Nginx service..."
sudo systemctl reload nginx || sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx Virtual Host is successfully configured and active on port 80!"
