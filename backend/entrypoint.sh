#!/bin/bash

# Django entrypoint script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting FUTUREINNVO Backend...${NC}"

# Wait for database (only if using PostgreSQL)
if [ -n "$DATABASE_URL" ]; then
    echo -e "${YELLOW}Waiting for PostgreSQL database...${NC}"
    while ! nc -z db 5432; do
      sleep 0.1
    done
    echo -e "${GREEN}PostgreSQL database is ready!${NC}"
else
    echo -e "${GREEN}Using SQLite database${NC}"
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
python manage.py migrate --noinput

# Collect static files
if [ "$DEBUG" = "False" ]; then
    echo -e "${YELLOW}Collecting static files...${NC}"
    python manage.py collectstatic --noinput
fi

# Create superuser if it doesn't exist
echo -e "${YELLOW}Checking for superuser...${NC}"
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@futureinnvo.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
EOF

# Populate sample data if database is empty
echo -e "${YELLOW}Checking sample data...${NC}"
python manage.py shell << EOF
from activities.models import Activity
if Activity.objects.count() == 0:
    print('Populating sample data...')
    exec(open('populate_data.py').read())
    print('Sample data populated!')
else:
    print('Sample data already exists')
EOF

echo -e "${GREEN}Backend setup complete!${NC}"

# Execute the main command
exec "$@"
