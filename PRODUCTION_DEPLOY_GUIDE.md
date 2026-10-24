# FUTUREINNVO Production Deployment Guide
# Ubuntu Server: 159.65.146.75
# Server Specs: 2 vCPUs, 4GB RAM, 120GB Disk

## 🚀 Quick Deployment Steps

### 1. Server Initial Setup
```bash
# Connect to your server
ssh root@159.65.146.75

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y python3 python3-pip python3-venv nginx postgresql postgresql-contrib nodejs npm git ufw
```

### 2. Setup Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE futureinnvo_db;
CREATE USER futureinnvo_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE futureinnvo_user SET client_encoding TO 'utf8';
ALTER ROLE futureinnvo_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE futureinnvo_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE futureinnvo_db TO futureinnvo_user;
\q
```

### 3. Deploy Application
```bash
# Create application directory
mkdir -p /var/www/futureinnvo
cd /var/www/futureinnvo

# Clone repository
git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git .

# Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with production values

# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Setup frontend
cd ../FUTUREINNVO_SOLO_DESIGN
npm install
npm run build
```

### 4. Configure Services
```bash
# Copy service files
cp deployment/gunicorn.service /etc/systemd/system/
cp deployment/nginx.conf /etc/nginx/sites-available/futureinnvo
ln -s /etc/nginx/sites-available/futureinnvo /etc/nginx/sites-enabled/

# Start services
systemctl daemon-reload
systemctl enable gunicorn
systemctl start gunicorn
systemctl enable nginx
systemctl restart nginx

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable
```

## 🔧 Production Configuration Files

All configuration files are in the `/deployment` directory:
- `gunicorn.service` - Systemd service for Django
- `nginx.conf` - Nginx configuration
- `.env.production` - Environment variables template
- `deploy.sh` - Automated deployment script

## 📊 Server Monitoring

After deployment, monitor your application:
```bash
# Check service status
systemctl status gunicorn
systemctl status nginx

# View logs
journalctl -u gunicorn -f
tail -f /var/log/nginx/error.log
```

## 🔒 SSL Certificate (Optional)
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com
```

## 🎯 Access Your Application
- Backend API: http://159.65.146.75/api/v1/
- Admin Panel: http://159.65.146.75/admin/
- Frontend: http://159.65.146.75/

---
*For detailed troubleshooting and advanced configuration, see the individual config files.*
