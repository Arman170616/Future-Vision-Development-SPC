# 🚀 FUTUREINNVO Server Deployment Instructions

## 📋 **Server Details**
- **IP Address**: `104.248.180.230`
- **Repository**: `https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git`
- **Deployment Type**: Docker Containers

## 🎯 **Quick Deployment (Recommended)**

### **Step 1: Connect to Server**
```bash
ssh root@104.248.180.230
# or
ssh your-username@104.248.180.230
```

### **Step 2: Run Automated Deployment**
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK/main/server-deploy.sh -o server-deploy.sh
chmod +x server-deploy.sh
./server-deploy.sh
```

### **Step 3: Access Your Application**
After deployment completes:
- **Frontend**: http://104.248.180.230:3000
- **Backend API**: http://104.248.180.230:8000
- **Admin Panel**: http://104.248.180.230:8000/admin
- **API Documentation**: http://104.248.180.230:8000/api/v1/

## 🔧 **Manual Deployment Steps**

### **1. Prepare Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable
```

### **2. Clone Repository**
```bash
git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git
cd FUTUREINNVO_FULLSTACK
```

### **3. Configure Environment**
```bash
# Copy production environment
cp .env.production .env

# Edit if needed (optional)
nano .env
```

### **4. Deploy Application**
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy in production mode
./deploy.sh production
```

### **5. Verify Deployment**
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs

# Test endpoints
curl http://104.248.180.230:8000/api/v1/activities/
curl http://104.248.180.230:3000/
```

## 🔐 **Default Admin Access**

After deployment, you can access the Django admin:
- **URL**: http://104.248.180.230:8000/admin
- **Username**: `admin`
- **Password**: `futureinnvo2025!`

**⚠️ Important**: Change the default password immediately after first login!

## 📊 **Service Ports**

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://104.248.180.230:3000 | React Application |
| Backend | 8000 | http://104.248.180.230:8000 | Django API |
| Database | 5432 | Internal only | PostgreSQL |
| Redis | 6379 | Internal only | Cache |

## 🛠️ **Management Commands**

### **Container Management**
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update and restart
git pull origin main
docker-compose up --build -d
```

### **Database Management**
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access database
docker-compose exec db psql -U futureinnvo_user -d futureinnvo_db

# Backup database
docker-compose exec db pg_dump -U futureinnvo_user futureinnvo_db > backup.sql
```

### **Application Management**
```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Populate sample data
docker-compose exec backend python populate_data.py

# View application logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔍 **Troubleshooting**

### **Common Issues**

**1. Containers won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

**2. Database connection issues:**
```bash
# Check database container
docker-compose exec db psql -U futureinnvo_user -d futureinnvo_db

# Reset database
docker-compose down -v
docker-compose up -d
```

**3. Frontend not loading:**
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

**4. API not responding:**
```bash
# Check backend logs
docker-compose logs backend

# Test API directly
curl http://104.248.180.230:8000/api/v1/activities/
```

### **Performance Monitoring**
```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h

# Check system load
htop
```

## 🔒 **Security Recommendations**

### **Immediate Actions**
1. **Change default admin password**
2. **Set up SSH key authentication**
3. **Configure fail2ban for SSH protection**
4. **Set up regular backups**

### **SSL/HTTPS Setup**
```bash
# Install Certbot
sudo apt install certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration for HTTPS
# Edit nginx/sites-available/futureinnvo.conf
```

### **Firewall Configuration**
```bash
# Check firewall status
sudo ufw status

# Allow specific IPs only (optional)
sudo ufw allow from YOUR_IP_ADDRESS to any port 22
```

## 📈 **Monitoring & Maintenance**

### **Regular Tasks**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update application
cd /opt/futureinnvo
git pull origin main
docker-compose up --build -d

# Clean up Docker
docker system prune -f

# Backup database
docker-compose exec db pg_dump -U futureinnvo_user futureinnvo_db > backup_$(date +%Y%m%d).sql
```

### **Log Monitoring**
```bash
# View real-time logs
docker-compose logs -f

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

## 📞 **Support**

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Verify container status: `docker-compose ps`
3. Test API endpoints manually
4. Contact: futureinnvoteam@gmail.com

---

## 🎉 **Success!**

After successful deployment, your FUTUREINNVO application will be running at:
- **Main Application**: http://104.248.180.230:3000
- **API**: http://104.248.180.230:8000/api/v1/
- **Admin**: http://104.248.180.230:8000/admin

The application includes:
- ✅ React TypeScript frontend with modern UI
- ✅ Django REST API backend
- ✅ PostgreSQL database with sample data
- ✅ Redis caching
- ✅ EmailJS contact form integration
- ✅ Job application system
- ✅ Error handling and monitoring

**Your FUTUREINNVO project is now live on the server! 🚀**
