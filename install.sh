#!/bin/bash
set -e

# ─── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
die()  { echo -e "${RED}[✗] $1${NC}"; exit 1; }

# ─── Get server IP ────────────────────────────────────────────────────────────
SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
log "Server IP: $SERVER_IP"

# ─── 1. System packages ───────────────────────────────────────────────────────
log "Updating system packages..."
sudo apt-get update -q

# Node.js 20
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  log "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  log "Node.js $(node -v) already installed"
fi

# nginx
if ! command -v nginx &>/dev/null; then
  log "Installing nginx..."
  sudo apt-get install -y nginx
else
  log "nginx already installed"
fi

# pm2
if ! command -v pm2 &>/dev/null; then
  log "Installing pm2..."
  sudo npm install -g pm2
else
  log "pm2 already installed"
fi

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_DIR/apps/backend"
WEB_DIR="$REPO_DIR/apps/web"

# ─── 2. Backend .env ──────────────────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
  warn "No .env found for backend. Creating one..."
  read -rp "MongoDB URI: " MONGO_URI
  read -rp "JWT Secret (press Enter for default): " JWT_SECRET
  JWT_SECRET=${JWT_SECRET:-"safekids_secret_$(openssl rand -hex 16)"}
  read -rp "SMTP Email (Gmail): " SMTP_USER
  read -rsp "SMTP App Password: " SMTP_PASS
  echo ""

  cat > "$BACKEND_DIR/.env" <<EOF
PORT=5000
NODE_ENV=production
CLIENT_URL=http://$SERVER_IP
MONGODB_URI=$MONGO_URI
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SERVER_IP=$SERVER_IP
EOF
  log "Backend .env created"
else
  log "Backend .env already exists"
fi

# ─── 3. Backend install & build ───────────────────────────────────────────────
log "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install --silent

log "Building backend..."
npm run build

# ─── 4. Frontend build ────────────────────────────────────────────────────────
log "Installing frontend dependencies..."
cd "$WEB_DIR"
npm install --silent

log "Building frontend..."
VITE_API_URL="http://$SERVER_IP" npm run build

# ─── 5. nginx config ──────────────────────────────────────────────────────────
log "Configuring nginx..."
sudo tee /etc/nginx/sites-available/safekids > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Serve React frontend
    root $WEB_DIR/dist;
    index index.html;

    # API → backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # React SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/safekids /etc/nginx/sites-enabled/safekids
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
log "nginx configured and restarted"

# ─── 6. Start backend with pm2 ────────────────────────────────────────────────
log "Starting backend with pm2..."
pm2 delete safekids-backend 2>/dev/null || true
cd "$BACKEND_DIR"
pm2 start dist/index.js --name safekids-backend
pm2 save

# Auto-start on reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME | tail -1 | sudo bash || true

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  SafeKids installed successfully!${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo -e "  Parent Portal : ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Backend API   : ${GREEN}http://$SERVER_IP/api${NC}"
echo -e "  PM2 status    : ${GREEN}pm2 list${NC}"
echo ""
