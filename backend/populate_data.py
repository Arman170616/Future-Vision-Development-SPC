#!/usr/bin/env python
"""
Script to populate the database with initial data from the React components
"""
import os
import sys
import django
from datetime import datetime, date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'futureinnvo_api.settings')
django.setup()

from activities.models import Activity, ActivityHighlight, UpcomingEvent
from teams.models import Department, TeamMember, Expertise, Achievement
from projects.models import (
    Project, ProjectTechnology, ProjectFeature, ProjectResult, 
    ProjectGallery, ProjectTestimonial
)
from blog.models import BlogCategory, BlogPost, BlogTag, BlogPostTag
from careers.models import JobOpening, JobRequirement, JobResponsibility


def populate_activities():
    print("Populating Activities...")
    
    activities_data = [
        {
            'title': 'Annual Tech Innovation Summit 2024',
            'date': date(2024, 3, 15),
            'type': 'conference',
            'image': 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
            'description': 'Our flagship event bringing together technology leaders, innovators, and entrepreneurs to discuss the future of tech.',
            'participants': '500+',
            'highlights': [
                'Keynote speeches from industry leaders',
                'Interactive workshops on emerging technologies',
                'Networking opportunities with tech professionals',
                'Startup pitch competition with $50K prize pool'
            ]
        },
        {
            'title': 'Community Coding Bootcamp',
            'date': date(2024, 2, 20),
            'type': 'education',
            'image': 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
            'description': 'Free coding bootcamp for local students and professionals looking to upskill in modern web development.',
            'participants': '150+',
            'highlights': [
                '6-week intensive program',
                'Focus on React, Node.js, and cloud technologies',
                'Mentorship from senior developers',
                'Job placement assistance for graduates'
            ]
        },
        {
            'title': 'Green Tech Initiative Launch',
            'date': date(2024, 1, 10),
            'type': 'sustainability',
            'image': 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
            'description': 'Launching our commitment to sustainable technology solutions and carbon-neutral operations.',
            'participants': '200+',
            'highlights': [
                'Partnership with local environmental organizations',
                'Introduction of green coding practices',
                'Solar-powered office infrastructure',
                'Employee sustainability training programs'
            ]
        }
    ]
    
    for activity_data in activities_data:
        highlights = activity_data.pop('highlights')
        activity, created = Activity.objects.get_or_create(
            title=activity_data['title'],
            defaults=activity_data
        )
        if created:
            for highlight in highlights:
                ActivityHighlight.objects.create(
                    activity=activity,
                    highlight=highlight
                )
    
    # Upcoming Events
    upcoming_events = [
        {
            'title': 'AI & Machine Learning Workshop',
            'date': date(2024, 4, 20),
            'type': 'workshop',
            'description': 'Hands-on workshop covering the latest in AI and ML technologies.'
        },
        {
            'title': 'Cybersecurity Awareness Week',
            'date': date(2024, 5, 5),
            'type': 'education',
            'description': 'Week-long series of events focused on cybersecurity best practices.'
        }
    ]
    
    for event_data in upcoming_events:
        UpcomingEvent.objects.get_or_create(
            title=event_data['title'],
            defaults=event_data
        )


def populate_teams():
    print("Populating Teams...")
    
    # Create departments
    departments_data = [
        {'name': 'Leadership', 'icon': 'Rocket', 'color': 'text-blue-300'},
        {'name': 'Technology', 'icon': 'Code', 'color': 'text-green-300'},
        {'name': 'Research', 'icon': 'Brain', 'color': 'text-purple-300'},
        {'name': 'Design', 'icon': 'Palette', 'color': 'text-pink-300'},
        {'name': 'Development', 'icon': 'Database', 'color': 'text-orange-300'},
        {'name': 'Analytics', 'icon': 'Award', 'color': 'text-yellow-300'},
        {'name': 'Security', 'icon': 'Shield', 'color': 'text-red-300'},
        {'name': 'Product', 'icon': 'Users', 'color': 'text-indigo-300'},
    ]
    
    for dept_data in departments_data:
        Department.objects.get_or_create(name=dept_data['name'], defaults=dept_data)
    
    # Create team members
    team_members_data = [
        {
            'name': 'Ahmed Al-Rashid',
            'position': 'Chief Executive Officer',
            'department': 'Leadership',
            'image': 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
            'bio': 'Visionary leader with 15+ years in AI and digital transformation. Former tech executive at major corporations.',
            'email': 'ahmed@futureinnvo.com',
            'linkedin_url': '#',
            'expertise': ['Strategic Planning', 'AI Strategy', 'Business Development', 'Innovation Management'],
            'achievements': [
                'Led digital transformation for 50+ companies',
                'Published researcher in AI applications',
                'TEDx speaker on future of technology'
            ]
        },
        {
            'name': 'Sarah Johnson',
            'position': 'Chief Technology Officer',
            'department': 'Technology',
            'image': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
            'bio': 'AI expert and software architect with deep expertise in machine learning and cloud technologies.',
            'email': 'sarah@futureinnvo.com',
            'linkedin_url': '#',
            'expertise': ['Machine Learning', 'Cloud Architecture', 'System Design', 'AI Development'],
            'achievements': [
                'Built AI systems serving 1M+ users',
                'AWS Certified Solutions Architect',
                'Open source contributor with 10K+ stars'
            ]
        }
    ]
    
    for member_data in team_members_data:
        expertise_list = member_data.pop('expertise')
        achievements_list = member_data.pop('achievements')
        department_name = member_data.pop('department')
        
        department = Department.objects.get(name=department_name)
        member_data['department'] = department
        
        member, created = TeamMember.objects.get_or_create(
            name=member_data['name'],
            defaults=member_data
        )
        
        if created:
            for skill in expertise_list:
                Expertise.objects.create(team_member=member, skill=skill)
            for achievement in achievements_list:
                Achievement.objects.create(team_member=member, achievement=achievement)


def populate_projects():
    print("Populating Projects...")

    projects_data = [
        {
            'title': 'Smart City Management Platform',
            'category': 'web',
            'status': 'completed',
            'client': 'Muscat Municipality',
            'duration': '18 months',
            'team_size': '12 developers',
            'budget': '$2.5M',
            'completion_date': 'March 2024',
            'image': 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
            'description': 'Comprehensive platform for managing city resources, traffic, utilities, and citizen services through IoT integration and real-time analytics.',
            'challenge': 'Muscat Municipality faced challenges with inefficient resource allocation, traffic congestion, and limited citizen engagement.',
            'solution': 'We developed an integrated AI platform that connects all city systems through IoT sensors and machine learning algorithms.',
            'impact': 'Reduced city operational costs by 25% and improved citizen satisfaction scores by 40%',
            'next_steps': 'Phase 2 expansion to include AI-powered urban planning and smart building integration across the city.',
            'technologies': ['React', 'Node.js', 'MongoDB', 'IoT', 'AWS'],
            'features': [
                'Real-time traffic monitoring and optimization',
                'Smart waste management system',
                'Citizen service portal with mobile app',
                'Energy consumption analytics dashboard',
                'Emergency response coordination system'
            ],
            'results': [
                'Reduced city operational costs by 25% ($1.2M annual savings)',
                'Improved citizen satisfaction scores by 40%',
                'Decreased emergency response time by 30%'
            ],
            'testimonial': {
                'quote': "Future Innovation transformed how we manage our city. Their AI solutions have made us more efficient, sustainable, and responsive to our citizens' needs.",
                'author': "Ahmed Al-Rashid",
                'position': "Director of Digital Services, Muscat Municipality"
            }
        }
    ]

    for project_data in projects_data:
        technologies = project_data.pop('technologies')
        features = project_data.pop('features')
        results = project_data.pop('results')
        testimonial_data = project_data.pop('testimonial')

        project, created = Project.objects.get_or_create(
            title=project_data['title'],
            defaults=project_data
        )

        if created:
            for tech in technologies:
                ProjectTechnology.objects.create(project=project, technology=tech)
            for feature in features:
                ProjectFeature.objects.create(project=project, feature=feature)
            for result in results:
                ProjectResult.objects.create(project=project, result=result)

            ProjectTestimonial.objects.create(
                project=project,
                **testimonial_data
            )


def populate_blog():
    print("Populating Blog...")

    # Create categories
    categories = ['Technology', 'Business', 'Security', 'Sustainability', 'Privacy']
    for cat_name in categories:
        BlogCategory.objects.get_or_create(name=cat_name)

    # Create tags
    tags = ['AI', 'Software Development', 'Innovation', 'Green Tech', 'Environment', 'Remote Work', 'Digital Transformation', 'Productivity', 'Cybersecurity', 'IoT', 'Privacy', 'Low-Code', 'Development', 'Accessibility', 'Data Privacy', 'GDPR', 'Trust']
    for tag_name in tags:
        BlogTag.objects.get_or_create(name=tag_name)

    # Create blog posts
    blog_posts_data = [
        {
            'title': 'The Future of AI in Software Development',
            'excerpt': 'Exploring how artificial intelligence is revolutionizing the way we build and maintain software applications.',
            'content': 'Artificial Intelligence is transforming software development in unprecedented ways...',
            'author': 'Dr. Sarah Johnson',
            'category': 'Technology',
            'image': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
            'read_time': '8 min read',
            'featured': True,
            'tags': ['AI', 'Software Development', 'Innovation']
        },
        {
            'title': 'Building Sustainable Tech Solutions',
            'excerpt': 'How we can create technology that not only solves problems but also protects our environment.',
            'content': 'Sustainability in technology is no longer optional...',
            'author': 'Michael Chen',
            'category': 'Sustainability',
            'image': 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
            'read_time': '6 min read',
            'featured': False,
            'tags': ['Green Tech', 'Environment', 'Innovation']
        }
    ]

    for post_data in blog_posts_data:
        tags_list = post_data.pop('tags')
        category_name = post_data.pop('category')

        category = BlogCategory.objects.get(name=category_name)
        post_data['category'] = category
        post_data['published_at'] = datetime.now()

        post, created = BlogPost.objects.get_or_create(
            title=post_data['title'],
            defaults=post_data
        )

        if created:
            for tag_name in tags_list:
                tag = BlogTag.objects.get(name=tag_name)
                BlogPostTag.objects.create(post=post, tag=tag)


def populate_careers():
    print("Populating Careers...")

    jobs_data = [
        {
            'title': 'Senior Software Engineer',
            'department': 'engineering',
            'location': 'Salalah, Oman',
            'job_type': 'full-time',
            'experience_required': '5+ years',
            'description': 'We are looking for an experienced software engineer to join our dynamic team and work on cutting-edge projects.',
            'requirements': [
                "Bachelor's degree in Computer Science or related field",
                '5+ years of software development experience',
                'Proficiency in React, Node.js, and modern web technologies',
                'Strong problem-solving and communication skills',
                'Experience with cloud platforms (AWS, Azure)'
            ],
            'responsibilities': [
                'Design and develop scalable web applications',
                'Collaborate with cross-functional teams',
                'Mentor junior developers',
                'Participate in code reviews and technical discussions',
                'Stay up-to-date with emerging technologies'
            ]
        },
        {
            'title': 'Product Manager',
            'department': 'product',
            'location': 'Salalah, Oman',
            'job_type': 'full-time',
            'experience_required': '3+ years',
            'description': 'Join our product team to drive innovation and deliver exceptional user experiences.',
            'requirements': [
                "Bachelor's degree in Business, Engineering, or related field",
                '3+ years of product management experience',
                'Strong analytical and strategic thinking skills',
                'Experience with Agile methodologies',
                'Excellent communication and leadership abilities'
            ],
            'responsibilities': [
                'Define product strategy and roadmap',
                'Gather and prioritize product requirements',
                'Work closely with engineering and design teams',
                'Analyze market trends and user feedback',
                'Drive product launches and go-to-market strategies'
            ]
        }
    ]

    for job_data in jobs_data:
        requirements = job_data.pop('requirements')
        responsibilities = job_data.pop('responsibilities')

        job, created = JobOpening.objects.get_or_create(
            title=job_data['title'],
            defaults=job_data
        )

        if created:
            for req in requirements:
                JobRequirement.objects.create(job=job, requirement=req)
            for resp in responsibilities:
                JobResponsibility.objects.create(job=job, responsibility=resp)


if __name__ == '__main__':
    print("Starting data population...")
    populate_activities()
    populate_teams()
    populate_projects()
    populate_blog()
    populate_careers()
    print("Data population completed!")
