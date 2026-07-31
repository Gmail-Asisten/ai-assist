#!/bin/bash
set -e

# ============================================================
# AI Gmail Assistant — VPS Deployment Script
# Run this script on the VPS to deploy the application
# ============================================================

APP_DIR="/home/ubuntu/ai-gmail-assistant"
REPO_URL="https://github.com/Gmail-Asisten/ai-assist.git"
BRANCH="main"

echo "🚀 Starting deployment..."

# ─── Step 1: Clone or Pull ─────────────────────────────────
if [ -d "$APP_DIR" ]; then
    echo "📦 Pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "📦 Cloning repository..."
    git clone -b $BRANCH "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ─── Step 2: Install dependencies ──────────────────────────
echo "📦 Installing dependencies..."
npm ci --production=false

# ─── Step 3: Generate Prisma client ────────────────────────
echo "🗄️  Generating Prisma client..."
npx prisma generate

# ─── Step 4: Run database migrations ──────────────────────
echo "🗄️  Running database migrations..."
npx prisma db push

# ─── Step 5: Build the app ─────────────────────────────────
echo "🏗️  Building Next.js app..."
npm run build

# ─── Step 6: Setup PM2 ─────────────────────────────────────
echo "🔄 Setting up PM2..."

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Stop existing process if running
pm2 stop ai-gmail-assistant 2>/dev/null || true
pm2 delete ai-gmail-assistant 2>/dev/null || true

# Start with PM2
pm2 start npm --name "ai-gmail-assistant" -- start
pm2 save

# Setup PM2 startup (so it restarts on reboot)
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo ""
echo "✅ Deployment complete!"
echo "🌐 App running at http://localhost:3000"
echo "🌐 Accessible via https://assistmail.web.id (through Nginx)"
echo ""
echo "📋 Useful commands:"
echo "   pm2 logs ai-gmail-assistant   — View logs"
echo "   pm2 restart ai-gmail-assistant — Restart app"
echo "   pm2 status                     — Check status"
