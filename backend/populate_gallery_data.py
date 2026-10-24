#!/usr/bin/env python
"""
Populate Gallery data for testing
"""
import os
import sys
import django
from datetime import date, timedelta

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'futureinnvo_api.settings')

# Setup Django
django.setup()

from activities.models import Gallery, Activity, UpcomingEvent

def populate_gallery():
    """Create sample gallery items"""
    
    # Get existing activities and events
    activities = Activity.objects.all()
    events = UpcomingEvent.objects.all()
    
    gallery_items = [
        {
            'title': 'Tech Conference 2024 - Opening Ceremony',
            'description': 'Amazing opening ceremony with keynote speakers and networking',
            'media_type': 'photo',
            'image_url': 'https://picsum.photos/800/600?random=1',
            'thumbnail_url': 'https://picsum.photos/300/200?random=1',
            'category': 'conference',
            'taken_date': date.today() - timedelta(days=30),
            'photographer': 'John Smith',
            'location': 'Main Auditorium',
            'is_featured': True,
            'is_public': True,
            'display_order': 1,
        },
        {
            'title': 'Team Building Workshop Highlights',
            'description': 'Fun team building activities and collaboration exercises',
            'media_type': 'video',
            'video_url': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            'thumbnail_url': 'https://picsum.photos/300/200?random=2',
            'category': 'workshop',
            'taken_date': date.today() - timedelta(days=25),
            'photographer': 'Sarah Johnson',
            'location': 'Training Room A',
            'is_featured': True,
            'is_public': True,
            'display_order': 2,
        },
        {
            'title': 'Innovation Hackathon Winners',
            'description': 'Celebration of hackathon winners and their innovative solutions',
            'media_type': 'photo',
            'image_url': 'https://picsum.photos/800/600?random=3',
            'thumbnail_url': 'https://picsum.photos/300/200?random=3',
            'category': 'competition',
            'taken_date': date.today() - timedelta(days=20),
            'photographer': 'Mike Chen',
            'location': 'Innovation Lab',
            'is_featured': False,
            'is_public': True,
            'display_order': 3,
        },
        {
            'title': 'Networking Lunch Session',
            'description': 'Professionals networking and sharing ideas over lunch',
            'media_type': 'photo',
            'image_url': 'https://picsum.photos/800/600?random=4',
            'thumbnail_url': 'https://picsum.photos/300/200?random=4',
            'category': 'networking',
            'taken_date': date.today() - timedelta(days=15),
            'photographer': 'Emily Davis',
            'location': 'Cafeteria',
            'is_featured': False,
            'is_public': True,
            'display_order': 4,
        },
        {
            'title': 'Product Launch Presentation',
            'description': 'Executive presentation of our latest product innovations',
            'media_type': 'video',
            'video_url': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
            'thumbnail_url': 'https://picsum.photos/300/200?random=5',
            'category': 'presentation',
            'taken_date': date.today() - timedelta(days=10),
            'photographer': 'Robert Wilson',
            'location': 'Conference Room B',
            'is_featured': True,
            'is_public': True,
            'display_order': 5,
        },
        {
            'title': 'Code Review Session',
            'description': 'Development team conducting code review and knowledge sharing',
            'media_type': 'photo',
            'image_url': 'https://picsum.photos/800/600?random=6',
            'thumbnail_url': 'https://picsum.photos/300/200?random=6',
            'category': 'meeting',
            'taken_date': date.today() - timedelta(days=8),
            'photographer': 'Lisa Thompson',
            'location': 'Development Floor',
            'is_featured': False,
            'is_public': True,
            'display_order': 6,
        },
        {
            'title': 'Client Success Stories',
            'description': 'Celebrating our successful client partnerships and achievements',
            'media_type': 'photo',
            'image_url': 'https://picsum.photos/800/600?random=7',
            'thumbnail_url': 'https://picsum.photos/300/200?random=7',
            'category': 'celebration',
            'taken_date': date.today() - timedelta(days=5),
            'photographer': 'David Brown',
            'location': 'Client Meeting Room',
            'is_featured': False,
            'is_public': True,
            'display_order': 7,
        },
        {
            'title': 'AI Workshop Demo',
            'description': 'Interactive demonstration of AI technologies and applications',
            'media_type': 'video',
            'video_url': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
            'thumbnail_url': 'https://picsum.photos/300/200?random=8',
            'category': 'workshop',
            'taken_date': date.today() - timedelta(days=3),
            'photographer': 'Anna Garcia',
            'location': 'Tech Lab',
            'is_featured': True,
            'is_public': True,
            'display_order': 8,
        }
    ]
    
    # Create gallery items
    created_count = 0
    for item_data in gallery_items:
        gallery_item, created = Gallery.objects.get_or_create(
            title=item_data['title'],
            defaults=item_data
        )
        
        if created:
            # Optionally link to existing activities/events
            if activities.exists() and created_count < 3:
                gallery_item.activity = activities[created_count % activities.count()]
                gallery_item.save()
            elif events.exists() and created_count >= 3 and created_count < 6:
                gallery_item.upcoming_event = events[(created_count - 3) % events.count()]
                gallery_item.save()
            
            created_count += 1
            print(f"Created gallery item: {gallery_item.title}")
        else:
            print(f"Gallery item already exists: {gallery_item.title}")
    
    print(f"\nGallery population completed! Created {created_count} new gallery items.")
    print(f"Total gallery items in database: {Gallery.objects.count()}")
    
    # Display some statistics
    featured_count = Gallery.objects.filter(is_featured=True).count()
    photo_count = Gallery.objects.filter(media_type='photo').count()
    video_count = Gallery.objects.filter(media_type='video').count()
    
    print(f"\nGallery Statistics:")
    print(f"- Featured items: {featured_count}")
    print(f"- Photos: {photo_count}")
    print(f"- Videos: {video_count}")
    print(f"- Categories: {Gallery.objects.values_list('category', flat=True).distinct().count()}")

if __name__ == '__main__':
    populate_gallery()
