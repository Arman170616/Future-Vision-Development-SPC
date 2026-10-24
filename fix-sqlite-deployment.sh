#!/bin/bash

# Fix deployment to use SQLite instead of PostgreSQL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing deployment to use SQLite database${NC}"

# Navigate to project directory
cd /opt/futureinnvo || cd FUTUREINNVO_FULLSTACK

# Stop any running containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down || true

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main

# Use SQLite compose file
echo -e "${YELLOW}Using SQLite configuration...${NC}"
cp docker-compose.sqlite.yml docker-compose.yml

# Remove any existing database containers
echo -e "${YELLOW}Cleaning up database containers...${NC}"
docker rm futureinnvo_db 2>/dev/null || true
docker volume rm futureinnvo_postgres_data 2>/dev/null || true

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for services
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T backend python manage.py migrate

# Create superuser
echo -e "${YELLOW}Creating superuser...${NC}"
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
echo -e "${YELLOW}Populating sample data...${NC}"
docker-compose exec -T backend python populate_data.py || echo "Sample data already exists"

# Health checks
echo -e "${YELLOW}Performing health checks...${NC}"
sleep 10

# Check backend
if curl -f http://104.248.180.230:8000/api/v1/activities/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Backend logs:"
    docker-compose logs backend --tail=20
fi

# Check frontend
if curl -f http://104.248.180.230:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy!${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo "Frontend logs:"
    docker-compose logs frontend --tail=20
fi

# Show status
echo -e "${BLUE}Container status:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 SQLite deployment completed!${NC}"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo "  Frontend:  http://104.248.180.230:3000"
echo "  Backend:   http://104.248.180.230:8000"
echo "  Admin:     http://104.248.180.230:8000/admin"
echo ""
echo -e "${BLUE}🔐 Admin Credentials:${NC}"
echo "  Username: admin"
echo "  Password: futureinnvo2025!"
