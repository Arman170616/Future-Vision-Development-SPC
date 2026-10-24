#!/bin/bash

# Quick fix for frontend build issue

set -e

echo "🔧 Fixing frontend build issue..."

# Stop containers
echo "Stopping containers..."
docker-compose down

# Remove frontend image to force rebuild
echo "Removing frontend image..."
docker rmi $(docker images | grep futureinnvo | grep frontend | awk '{print $3}') 2>/dev/null || true

# Option 1: Try with updated Dockerfile
echo "Attempting build with updated Dockerfile..."
if docker-compose up --build frontend; then
    echo "✅ Frontend build successful with updated Dockerfile!"
    docker-compose up -d
    exit 0
fi

# Option 2: Use simple Dockerfile
echo "Trying with simple Dockerfile..."
cd FUTUREINNVO_SOLO_DESIGN
cp Dockerfile.simple Dockerfile
cd ..

echo "Building with simple approach..."
docker-compose up --build -d

# Check if services are running
echo "Checking services..."
sleep 10
docker-compose ps

# Test endpoints
echo "Testing endpoints..."
curl -f http://104.248.180.230:8000/api/v1/activities/ && echo "✅ Backend OK"
curl -f http://104.248.180.230:3000/ && echo "✅ Frontend OK"

echo "🎉 Fix completed!"
echo "Frontend: http://104.248.180.230:3000"
echo "Backend: http://104.248.180.230:8000"
