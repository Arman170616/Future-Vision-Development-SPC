# 🐳 FUTUREINNVO Docker Deployment Guide

## 🎯 **Overview**

This guide provides complete instructions for deploying the FUTUREINNVO project using Docker containers. The setup includes:

- **Frontend**: React TypeScript app with Nginx
- **Backend**: Django REST API with Gunicorn
- **Database**: PostgreSQL
- **Cache**: Redis
- **Reverse Proxy**: Nginx (production)

## 📋 **Prerequisites**

### **Required Software**
- Docker 20.10+
- Docker Compose 2.0+
- Git

### **System Requirements**
- **Minimum**: 2GB RAM, 10GB disk space
- **Recommended**: 4GB RAM, 20GB disk space

## 🚀 **Quick Start**

### **1. Clone Repository**
```bash
git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git
cd FUTUREINNVO_FULLSTACK
```

### **2. Development Deployment**
```bash
# Quick development setup
./deploy.sh dev

# Or manually:
docker-compose -f docker-compose.dev.yml up --build -d
```

### **3. Production Deployment**
```bash
# Production setup
./deploy.sh production

# Or manually:
docker-compose up --build -d
```

## 🔧 **Configuration**

### **Environment Variables**

**Development (.env.dev):**
```env
DEBUG=True
DATABASE_URL=postgresql://dev_user:dev_password@db:5432/futureinnvo_dev
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Production (.env.production):**
```env
DEBUG=False
SECRET_KEY=futureinnvo-production-secret-key-2025-secure
DATABASE_URL=postgresql://futureinnvo_user:futureinnvo_password@db:5432/futureinnvo_db
ALLOWED_HOSTS=104.248.180.230,localhost,127.0.0.1,backend
```

### **Docker Compose Files**

**Development**: `docker-compose.dev.yml`
- Hot reload enabled
- Debug mode on
- Development database
- Exposed ports for debugging

**Production**: `docker-compose.yml`
- Optimized builds
- Security hardened
- Production database
- Nginx reverse proxy

## 📦 **Container Architecture**

### **Services Overview**

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000/5174 | React app with Nginx |
| backend | 8000/8001 | Django API with Gunicorn |
| db | 5432/5433 | PostgreSQL database |
| redis | 6379/6380 | Redis cache |
| nginx | 80/443 | Reverse proxy (prod only) |

### **Container Details**

**Frontend Container:**
```dockerfile
# Multi-stage build
FROM node:18-alpine as build
# Build React app
FROM nginx:alpine
# Serve with Nginx
```

**Backend Container:**
```dockerfile
FROM python:3.11-slim
# Install dependencies
# Run with Gunicorn (prod) or runserver (dev)
```

## 🛠️ **Deployment Commands**

### **Basic Operations**
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build -d
```

### **Database Operations**
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Populate sample data
docker-compose exec backend python populate_data.py

# Database backup
docker-compose exec db pg_dump -U futureinnvo_user futureinnvo_db > backup.sql
```

### **Maintenance Commands**
```bash
# View container status
docker-compose ps

# Check container health
docker-compose exec backend curl -f http://localhost:8000/api/v1/activities/

# Clean up unused images
docker system prune -f

# View resource usage
docker stats
```

## 🔒 **Security Configuration**

### **Production Security**

**SSL/HTTPS Setup:**
1. Obtain SSL certificates
2. Place in `nginx/ssl/` directory
3. Update `nginx/sites-available/futureinnvo.conf`

**Environment Security:**
- Use strong passwords
- Set secure SECRET_KEY
- Enable HTTPS redirects
- Configure security headers

**Database Security:**
- Use strong database passwords
- Limit database access
- Regular backups
- Enable connection encryption

## 📊 **Monitoring & Logging**

### **Health Checks**
```bash
# Check all services
curl http://localhost/health

# Check backend API
curl http://localhost:8000/api/v1/activities/

# Check frontend
curl http://localhost:3000/
```

### **Log Management**
```bash
# View all logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100
```

### **Performance Monitoring**
```bash
# Container resource usage
docker stats

# Database performance
docker-compose exec db psql -U futureinnvo_user -d futureinnvo_db -c "SELECT * FROM pg_stat_activity;"
```

## 🚀 **Production Deployment**

### **Server Setup**

**1. Prepare Server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**2. Deploy Application:**
```bash
# Clone repository
git clone https://github.com/futureinnvo/futureinnvo-website.git
cd futureinnvo-website

# Set up environment
cp .env.production .env
# Edit .env with your production values

# Deploy
./deploy.sh production
```

**3. Configure Domain:**
```bash
# Update DNS records to point to your server
# Configure SSL certificates
# Update nginx configuration with your domain
```

## 🔧 **Troubleshooting**

### **Common Issues**

**Container won't start:**
```bash
# Check logs
docker-compose logs service_name

# Check container status
docker-compose ps

# Rebuild container
docker-compose up --build service_name
```

**Database connection issues:**
```bash
# Check database container
docker-compose exec db psql -U futureinnvo_user -d futureinnvo_db

# Reset database
docker-compose down -v
docker-compose up -d db
```

**Frontend build issues:**
```bash
# Clear node modules
docker-compose exec frontend rm -rf node_modules
docker-compose up --build frontend
```

### **Performance Issues**

**Slow response times:**
- Check container resources: `docker stats`
- Optimize database queries
- Enable Redis caching
- Scale containers: `docker-compose up --scale backend=3`

**High memory usage:**
- Limit container memory in docker-compose.yml
- Optimize application code
- Use production builds

## 📋 **Backup & Recovery**

### **Database Backup**
```bash
# Create backup
docker-compose exec db pg_dump -U futureinnvo_user futureinnvo_db > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U futureinnvo_user -d futureinnvo_db < backup.sql
```

### **Full System Backup**
```bash
# Backup volumes
docker run --rm -v futureinnvo_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Backup application files
tar czf app_backup.tar.gz --exclude=node_modules --exclude=.git .
```

## 🎯 **Next Steps**

1. **Set up monitoring** (Prometheus, Grafana)
2. **Configure CI/CD** pipeline
3. **Set up automated backups**
4. **Implement log aggregation**
5. **Add performance monitoring**

---

## 📞 **Support**

For deployment issues:
- **Email**: futureinnvoteam@gmail.com
- **Documentation**: Check logs and health endpoints
- **Community**: Create GitHub issues for bugs

**Built with ❤️ by the FUTUREINNVO Team**
