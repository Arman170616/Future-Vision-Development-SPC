#!/bin/bash

# FUTUREINNVO Docker Deployment Script

set -e

echo "🚀 Starting FUTUREINNVO deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Environment selection
ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    print_status "Deploying in DEVELOPMENT mode..."
else
    COMPOSE_FILE="docker-compose.yml"
    print_status "Deploying in PRODUCTION mode..."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Remove old images (optional)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing old images..."
    docker system prune -f
fi

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f $COMPOSE_FILE up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    docker-compose -f $COMPOSE_FILE exec backend python manage.py migrate
else
    docker-compose -f $COMPOSE_FILE exec backend python manage.py migrate
fi

# Collect static files (production only)
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "development" ]; then
    print_status "Collecting static files..."
    docker-compose -f $COMPOSE_FILE exec backend python manage.py collectstatic --noinput
fi

# Create superuser (optional)
read -p "Do you want to create a Django superuser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating Django superuser..."
    docker-compose -f $COMPOSE_FILE exec backend python manage.py createsuperuser
fi

# Populate sample data (optional)
read -p "Do you want to populate sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Populating sample data..."
    docker-compose -f $COMPOSE_FILE exec backend python populate_data.py
fi

# Health check
print_status "Performing health checks..."
sleep 10

# Check backend health
if curl -f http://104.248.180.230:8000/api/v1/activities/ > /dev/null 2>&1; then
    print_success "Backend is healthy!"
else
    print_error "Backend health check failed!"
fi

# Check frontend health
if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    FRONTEND_PORT=5174
else
    FRONTEND_PORT=3000
fi

if curl -f http://104.248.180.230:$FRONTEND_PORT/ > /dev/null 2>&1; then
    print_success "Frontend is healthy!"
else
    print_error "Frontend health check failed!"
fi

# Show running containers
print_status "Running containers:"
docker-compose -f $COMPOSE_FILE ps

# Show logs
print_status "Recent logs:"
docker-compose -f $COMPOSE_FILE logs --tail=20

print_success "🎉 Deployment completed!"
print_status "Access your application:"
if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "development" ]; then
    echo "  Frontend: http://104.248.180.230:5174"
    echo "  Backend:  http://104.248.180.230:8001"
    echo "  Admin:    http://104.248.180.230:8001/admin"
else
    echo "  Frontend: http://104.248.180.230:3000"
    echo "  Backend:  http://104.248.180.230:8000"
    echo "  Admin:    http://104.248.180.230:8000/admin"
fi

print_status "To view logs: docker-compose -f $COMPOSE_FILE logs -f"
print_status "To stop: docker-compose -f $COMPOSE_FILE down"
