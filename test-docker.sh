#!/bin/bash

# Docker Setup Test Script for FUTUREINNVO

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 Testing FUTUREINNVO Docker Setup${NC}"

# Check Docker installation
echo -e "${YELLOW}Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose installation
echo -e "${YELLOW}Checking Docker Compose installation...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose is installed: $(docker-compose --version)${NC}"
else
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Check if Docker daemon is running
echo -e "${YELLOW}Checking Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker daemon is running${NC}"
else
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    exit 1
fi

# Validate Docker Compose files
echo -e "${YELLOW}Validating Docker Compose files...${NC}"

if [ -f "docker-compose.yml" ]; then
    if docker-compose -f docker-compose.yml config &> /dev/null; then
        echo -e "${GREEN}✅ docker-compose.yml is valid${NC}"
    else
        echo -e "${RED}❌ docker-compose.yml has errors${NC}"
        docker-compose -f docker-compose.yml config
        exit 1
    fi
else
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    exit 1
fi

if [ -f "docker-compose.dev.yml" ]; then
    if docker-compose -f docker-compose.dev.yml config &> /dev/null; then
        echo -e "${GREEN}✅ docker-compose.dev.yml is valid${NC}"
    else
        echo -e "${RED}❌ docker-compose.dev.yml has errors${NC}"
        docker-compose -f docker-compose.dev.yml config
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.dev.yml not found${NC}"
fi

# Check Dockerfiles
echo -e "${YELLOW}Checking Dockerfiles...${NC}"

if [ -f "backend/Dockerfile" ]; then
    echo -e "${GREEN}✅ Backend Dockerfile found${NC}"
else
    echo -e "${RED}❌ Backend Dockerfile not found${NC}"
    exit 1
fi

if [ -f "FUTUREINNVO_SOLO_DESIGN/Dockerfile" ]; then
    echo -e "${GREEN}✅ Frontend Dockerfile found${NC}"
else
    echo -e "${RED}❌ Frontend Dockerfile not found${NC}"
    exit 1
fi

# Check required files
echo -e "${YELLOW}Checking required files...${NC}"

required_files=(
    "backend/requirements.txt"
    "backend/manage.py"
    "FUTUREINNVO_SOLO_DESIGN/package.json"
    "FUTUREINNVO_SOLO_DESIGN/nginx.conf"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file found${NC}"
    else
        echo -e "${RED}❌ $file not found${NC}"
        exit 1
    fi
done

# Test build (optional)
read -p "Do you want to test build the containers? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Testing container builds...${NC}"
    
    # Test backend build
    echo -e "${YELLOW}Building backend container...${NC}"
    if docker build -t futureinnvo-backend-test ./backend; then
        echo -e "${GREEN}✅ Backend container built successfully${NC}"
        docker rmi futureinnvo-backend-test
    else
        echo -e "${RED}❌ Backend container build failed${NC}"
        exit 1
    fi
    
    # Test frontend build
    echo -e "${YELLOW}Building frontend container...${NC}"
    if docker build -t futureinnvo-frontend-test ./FUTUREINNVO_SOLO_DESIGN; then
        echo -e "${GREEN}✅ Frontend container built successfully${NC}"
        docker rmi futureinnvo-frontend-test
    else
        echo -e "${RED}❌ Frontend container build failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 All Docker setup tests passed!${NC}"
echo -e "${BLUE}You can now run:${NC}"
echo -e "  ${YELLOW}Development:${NC} ./deploy.sh dev"
echo -e "  ${YELLOW}Production:${NC}  ./deploy.sh production"
