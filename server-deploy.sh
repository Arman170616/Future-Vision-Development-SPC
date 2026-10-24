#!/bin/bash

# FUTUREINNVO Server Deployment Script for 104.248.180.230

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}🚀 FUTUREINNVO Server Deployment Script${NC}"
echo -e "${BLUE}Server IP: 104.248.180.230${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_success "Docker installed successfully!"
else
    print_success "Docker is already installed: $(docker --version)"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully!"
else
    print_success "Docker Compose is already installed: $(docker-compose --version)"
fi

# Install additional tools
print_status "Installing additional tools..."
sudo apt install -y curl wget git htop nano ufw

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5174/tcp
sudo ufw --force enable

# Clone or update repository
REPO_DIR="/opt/futureinnvo"
if [ -d "$REPO_DIR" ]; then
    print_status "Updating existing repository..."
    cd $REPO_DIR
    sudo git pull origin main
else
    print_status "Cloning repository..."
    sudo git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git $REPO_DIR
    cd $REPO_DIR
fi

# Set permissions
sudo chown -R $USER:$USER $REPO_DIR
chmod +x deploy.sh

# Copy environment file
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.production .env
    print_warning "Please edit .env file with your specific configuration"
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down || true

# Build and start containers
print_status "Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Collect static files
print_status "Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# Create superuser (optional)
print_status "Creating Django superuser..."
docker-compose exec -T backend python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@futureinnvo.com', 'futureinnvo2025!')
    print('Superuser created: admin / futureinnvo2025!')
else:
    print('Superuser already exists')
EOF

# Populate sample data
print_status "Populating sample data..."
docker-compose exec -T backend python populate_data.py || print_warning "Sample data population failed or already exists"

# Health checks
print_status "Performing health checks..."
sleep 10

# Check backend
if curl -f http://104.248.180.230:8000/api/v1/activities/ > /dev/null 2>&1; then
    print_success "✅ Backend is healthy!"
else
    print_error "❌ Backend health check failed!"
fi

# Check frontend
if curl -f http://104.248.180.230:3000/ > /dev/null 2>&1; then
    print_success "✅ Frontend is healthy!"
else
    print_error "❌ Frontend health check failed!"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show recent logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_success "🎉 FUTUREINNVO deployment completed!"
echo ""
print_status "🌐 Access your application:"
echo "  Frontend:  http://104.248.180.230:3000"
echo "  Backend:   http://104.248.180.230:8000"
echo "  Admin:     http://104.248.180.230:8000/admin"
echo "  API Docs:  http://104.248.180.230:8000/api/v1/"
echo ""
print_status "🔐 Admin Credentials:"
echo "  Username: admin"
echo "  Password: futureinnvo2025!"
echo ""
print_status "📋 Useful Commands:"
echo "  View logs:     docker-compose logs -f"
echo "  Restart:       docker-compose restart"
echo "  Stop:          docker-compose down"
echo "  Update:        git pull && docker-compose up --build -d"
echo ""
print_warning "🔒 Security Recommendations:"
echo "  1. Change default admin password"
echo "  2. Set up SSL certificates"
echo "  3. Configure domain name"
echo "  4. Set up regular backups"
echo "  5. Monitor logs regularly"
