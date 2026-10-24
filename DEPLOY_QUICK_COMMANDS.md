# Quick Deployment Commands for 159.65.146.75

## 🚀 One-Command Deployment

```bash
# SSH into your server
ssh root@159.65.146.75

# Download and run deployment script
curl -sSL https://raw.githubusercontent.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK/main/deployment/deploy.sh | sudo bash
```

## 📋 Manual Step-by-Step

### 1. Connect to Server
```bash
ssh root@159.65.146.75
```

### 2. Update System
```bash
apt update && apt upgrade -y
```

### 3. Install Dependencies
```bash
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib nodejs npm git ufw
```

### 4. Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE futureinnvo_db;
CREATE USER futureinnvo_user WITH PASSWORD 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE futureinnvo_db TO futureinnvo_user;
\q
```

### 5. Deploy Application
```bash
cd /var/www
git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git futureinnvo
cd futureinnvo

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn psycopg2-binary

# Frontend setup
cd ../FUTUREINNVO_SOLO_DESIGN
npm install
npm run build
```

### 6. Configure Services
```bash
# Copy configuration files
cp deployment/gunicorn.service /etc/systemd/system/futureinnvo.service
cp deployment/nginx.conf /etc/nginx/sites-available/futureinnvo
ln -s /etc/nginx/sites-available/futureinnvo /etc/nginx/sites-enabled/

# Start services
systemctl daemon-reload
systemctl enable futureinnvo
systemctl start futureinnvo
systemctl restart nginx

# Setup firewall
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## ✅ Verification

### Check Services
```bash
systemctl status futureinnvo
systemctl status nginx
```

### Test URLs
- Frontend: http://159.65.146.75/
- API: http://159.65.146.75/api/v1/
- Admin: http://159.65.146.75/admin/

## 🔧 Troubleshooting

### View Logs
```bash
journalctl -u futureinnvo -f
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart futureinnvo
systemctl restart nginx
```

## 🔒 SSL Setup (Optional)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---
**Server Details:**
- IP: 159.65.146.75
- OS: Ubuntu 24.04 LTS
- RAM: 4GB
- CPU: 2 vCPUs
- Storage: 120GB
