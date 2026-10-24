"""
Populate courses data for testing
"""
import os
import django
import sys
from datetime import date, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'futureinnvo_api.settings')
django.setup()

from courses.models import Course

def create_sample_courses():
    """Create sample courses for testing"""
    
    courses_data = [
        {
            'name': 'Introduction to Web Development',
            'slug': 'intro-web-development',
            'short_description': 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
            'description': 'This comprehensive course covers the fundamentals of web development. You will learn HTML for structure, CSS for styling, and JavaScript for interactivity. By the end of this course, you will be able to create responsive websites from scratch.',
            'duration': '8 weeks',
            'instructor': 'Sarah Johnson',
            'price': 299.00,
            'level': 'beginner',
            'course_type': 'online',
            'max_students': 30,
            'curriculum': '''
Week 1-2: HTML Fundamentals
- HTML5 semantic elements
- Forms and input types
- Document structure

Week 3-4: CSS Styling
- CSS selectors and properties
- Flexbox and Grid
- Responsive design

Week 5-6: JavaScript Basics
- Variables and functions
- DOM manipulation
- Event handling

Week 7-8: Project Development
- Building a complete website
- Best practices
- Deployment
            ''',
            'prerequisites': 'Basic computer skills and familiarity with using web browsers.',
            'learning_outcomes': '''
- Create semantic HTML documents
- Style websites with modern CSS
- Add interactivity with JavaScript
- Build responsive web layouts
- Deploy websites to the internet
            ''',
            'start_date': date.today() + timedelta(days=14),
            'end_date': date.today() + timedelta(days=70),
            'is_active': True,
            'is_featured': True
        },
        {
            'name': 'Python for Data Science',
            'slug': 'python-data-science',
            'short_description': 'Master Python programming for data analysis and machine learning.',
            'description': 'Dive deep into Python programming with a focus on data science applications. Learn pandas, numpy, matplotlib, and scikit-learn to analyze data and build machine learning models.',
            'duration': '12 weeks',
            'instructor': 'Dr. Ahmed Al-Rashid',
            'price': 599.00,
            'level': 'intermediate',
            'course_type': 'hybrid',
            'max_students': 25,
            'curriculum': '''
Week 1-3: Python Fundamentals
- Data types and structures
- Control flow and functions
- Object-oriented programming

Week 4-6: Data Manipulation
- Pandas for data analysis
- NumPy for numerical computing
- Data cleaning techniques

Week 7-9: Data Visualization
- Matplotlib and Seaborn
- Creating meaningful charts
- Statistical plotting

Week 10-12: Machine Learning
- Scikit-learn fundamentals
- Supervised learning algorithms
- Model evaluation and selection
            ''',
            'prerequisites': 'Basic programming knowledge. Familiarity with mathematics and statistics is helpful.',
            'learning_outcomes': '''
- Write efficient Python code
- Manipulate and analyze large datasets
- Create compelling data visualizations
- Build and evaluate machine learning models
- Apply data science techniques to real-world problems
            ''',
            'start_date': date.today() + timedelta(days=21),
            'end_date': date.today() + timedelta(days=105),
            'is_active': True,
            'is_featured': True
        },
        {
            'name': 'Digital Marketing Mastery',
            'slug': 'digital-marketing-mastery',
            'short_description': 'Learn comprehensive digital marketing strategies and tools.',
            'description': 'Master the art and science of digital marketing. This course covers SEO, social media marketing, content marketing, email marketing, and analytics to help you grow businesses online.',
            'duration': '10 weeks',
            'instructor': 'Maria Rodriguez',
            'price': 399.00,
            'level': 'beginner',
            'course_type': 'online',
            'max_students': 40,
            'curriculum': '''
Week 1-2: Digital Marketing Foundations
- Understanding digital ecosystems
- Customer journey mapping
- Marketing funnels

Week 3-4: Search Engine Optimization
- Keyword research
- On-page and off-page SEO
- Technical SEO basics

Week 5-6: Social Media Marketing
- Platform-specific strategies
- Content creation and curation
- Community management

Week 7-8: Content Marketing
- Content strategy development
- Blogging and video marketing
- Email marketing campaigns

Week 9-10: Analytics and Optimization
- Google Analytics setup
- Performance measurement
- Conversion optimization
            ''',
            'prerequisites': 'Basic computer skills and familiarity with social media platforms.',
            'learning_outcomes': '''
- Develop comprehensive marketing strategies
- Optimize websites for search engines
- Create engaging social media campaigns
- Build effective email marketing campaigns
- Measure and analyze marketing performance
            ''',
            'start_date': date.today() + timedelta(days=7),
            'end_date': date.today() + timedelta(days=77),
            'is_active': True,
            'is_featured': False
        },
        {
            'name': 'Mobile App Development with React Native',
            'slug': 'react-native-mobile-dev',
            'short_description': 'Build cross-platform mobile apps with React Native.',
            'description': 'Learn to develop mobile applications for both iOS and Android using React Native. This course covers everything from basic components to advanced features like navigation, state management, and API integration.',
            'duration': '14 weeks',
            'instructor': 'James Chen',
            'price': 699.00,
            'level': 'intermediate',
            'course_type': 'online',
            'max_students': 20,
            'curriculum': '''
Week 1-3: React Native Fundamentals
- Development environment setup
- Core components and styling
- Handling user input

Week 4-6: Navigation and UI
- React Navigation
- Custom components
- Animations and gestures

Week 7-9: State Management
- Context API and Redux
- Async operations
- Local storage

Week 10-12: Advanced Features
- Camera and media handling
- Push notifications
- Maps integration

Week 13-14: Deployment
- Building for production
- App store submission
- Performance optimization
            ''',
            'prerequisites': 'Knowledge of JavaScript and React. Basic understanding of mobile development concepts.',
            'learning_outcomes': '''
- Build complete mobile applications
- Implement complex user interfaces
- Manage application state effectively
- Integrate with third-party APIs
- Deploy apps to app stores
            ''',
            'start_date': date.today() + timedelta(days=28),
            'end_date': date.today() + timedelta(days=126),
            'is_active': True,
            'is_featured': False
        },
        {
            'name': 'UI/UX Design Fundamentals',
            'slug': 'ui-ux-design-fundamentals',
            'short_description': 'Master the principles of user interface and user experience design.',
            'description': 'Explore the world of UI/UX design with hands-on projects and real-world applications. Learn design thinking, prototyping, user research, and create stunning interfaces.',
            'duration': '6 weeks',
            'instructor': 'Lisa Thompson',
            'price': 449.00,
            'level': 'beginner',
            'course_type': 'hybrid',
            'max_students': 35,
            'curriculum': '''
Week 1: Design Thinking
- User-centered design principles
- Design thinking process
- User persona development

Week 2: User Research
- Research methodologies
- User interviews and surveys
- Usability testing

Week 3: Information Architecture
- Site mapping and user flows
- Wireframing techniques
- Content strategy

Week 4: Visual Design
- Color theory and typography
- Layout and composition
- Design systems

Week 5: Prototyping
- Low and high-fidelity prototypes
- Interactive prototyping tools
- Testing and iteration

Week 6: Portfolio Development
- Case study creation
- Portfolio presentation
- Career guidance
            ''',
            'prerequisites': 'No prior design experience required. Creativity and attention to detail are beneficial.',
            'learning_outcomes': '''
- Apply design thinking methodology
- Conduct effective user research
- Create wireframes and prototypes
- Design visually appealing interfaces
- Build a professional design portfolio
            ''',
            'start_date': date.today() + timedelta(days=35),
            'end_date': date.today() + timedelta(days=77),
            'is_active': True,
            'is_featured': True
        }
    ]
    
    created_courses = []
    for course_data in courses_data:
        course, created = Course.objects.get_or_create(
            slug=course_data['slug'],
            defaults=course_data
        )
        if created:
            created_courses.append(course)
            print(f"Created course: {course.name}")
        else:
            print(f"Course already exists: {course.name}")
    
    print(f"\nSample data creation complete! Created {len(created_courses)} new courses.")
    return created_courses

if __name__ == '__main__':
    create_sample_courses()
