# FutureInnvo_ERP

# FUTUREINNVO - The Future of Innovation

![FUTUREINNVO Logo](https://via.placeholder.com/800x200/1e3a8a/ffffff?text=FUTUREINNVO+-+The+Future+of+Innovation)

A modern, responsive React TypeScript application showcasing FUTUREINNVO's innovative projects, team, and services. Built with cutting-edge web technologies and featuring a beautiful glass morphism design.

## 🌟 Features

### 🎨 **Modern Design**
- **Glass Morphism UI**: Beautiful translucent design elements
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Smooth Animations**: Engaging hover effects and transitions
- **Dark Theme**: Professional blue/purple gradient theme

### 📱 **Core Pages**
- **Home**: Company overview and hero section
- **Projects**: Dynamic project showcase with detail pages
- **Team**: Meet our team with department filtering
- **Activities**: Company activities and upcoming events
- **Blog**: Technical articles and company updates
- **Jobs**: Career opportunities with application system
- **Contact**: Functional contact form with EmailJS

### 🔧 **Technical Features**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **EmailJS** for contact form functionality
- **Django REST API** backend integration
- **Error Boundaries** for graceful error handling
- **Animated 404** and error pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/The-Future-of-Innovation/FUTUREINNVO_FULLSTACK.git
   cd FUTUREINNVO_FULLSTACK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your EmailJS credentials:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://104.248.180.230:5174
   ```

## 🏗️ Project Structure

```
FUTUREINNVO_SOLO_DESIGN/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── Team.tsx
│   │   ├── Activities.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogDetails.tsx
│   │   ├── JobOpenings.tsx
│   │   ├── JobDetails.tsx
│   │   ├── JobApplication.tsx
│   │   ├── Contact.tsx
│   │   ├── NotFound.tsx
│   │   └── CEOMessage.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── utils/           # Utility functions
│   │   └── emailTest.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── backend/             # Django REST API
├── .env                 # Environment variables
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend (Django)
cd backend
python manage.py runserver    # Start Django API server
python manage.py migrate      # Run database migrations
```

## 🌐 API Integration

### Django REST API Endpoints

```
GET  /api/v1/activities/          # List activities
GET  /api/v1/upcoming-events/     # Upcoming events
GET  /api/v1/departments/         # Team departments
GET  /api/v1/members/             # Team members
GET  /api/v1/projects/            # Projects list
GET  /api/v1/projects/{slug}/     # Project details
GET  /api/v1/categories/          # Blog categories
GET  /api/v1/posts/               # Blog posts
GET  /api/v1/posts/{slug}/        # Blog post details
GET  /api/v1/jobs/                # Job openings
POST /api/v1/applications/        # Submit job application
```

### EmailJS Configuration

The contact form uses EmailJS for email delivery. Configure your template with these parameters:

```javascript
{
  from_name: "User's name",
  from_email: "User's email",
  company: "User's company",
  subject: "Message subject",
  message: "Message content",
  to_email: "futureinnvoteam@gmail.com",
  reply_to: "User's email",
  timestamp: "Current date/time"
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Background**: Dark gradients
- **Text**: White/Blue tones
- **Accents**: Green, Yellow, Red for status

### Components
- **Glass Effect**: `glass-effect` and `glass-effect-strong` classes
- **Animations**: Float, slide-in, pulse, glitch effects
- **Buttons**: Consistent hover states and transitions
- **Cards**: Rounded corners with backdrop blur

## 📱 Responsive Breakpoints

```css
sm:  640px   # Small devices
md:  768px   # Medium devices
lg:  1024px  # Large devices
xl:  1280px  # Extra large devices
```

## 🔒 Environment Variables

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxx

# API Configuration (optional)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Set environment variables** in your hosting platform

### Backend (Django)

1. **Prepare for production**
   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic
   python manage.py migrate
   ```

2. **Deploy to your preferred platform** (Heroku, DigitalOcean, etc.)

## 🧪 Testing

### Manual Testing
- Visit all pages and test navigation
- Submit contact form and job applications
- Test responsive design on different devices
- Verify error pages (404, JavaScript errors)

### EmailJS Testing
```javascript
// Use browser console
import { testEmailJSConfig, sendTestEmail } from './src/utils/emailTest';
testEmailJSConfig();
sendTestEmail();
```

## 🐛 Troubleshooting

### Common Issues

**EmailJS not working:**
- Check environment variables are set correctly
- Verify EmailJS template configuration
- Check browser console for error messages

**API connection issues:**
- Ensure Django server is running on port 8000
- Check CORS configuration in Django settings
- Verify API endpoints are accessible

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## 📞 Support

- **Email**: futureinnvoteam@gmail.com
- **Phone**: +968 7111 1040
- **Address**: Al Shadaah City Mall, Salalah, Oman

## 📄 License

This project is proprietary software owned by FUTUREINNVO. All rights reserved.

## 🤝 Contributing

This is a private project. For internal development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 🔄 Recent Updates

### Latest Changes (September 2025)
- ✅ **EmailJS Integration**: Functional contact form with email delivery
- ✅ **Job Application System**: Complete job posting and application workflow
- ✅ **Error Handling**: Animated 404 pages and error boundaries
- ✅ **API Integration**: Full Django REST API backend connection
- ✅ **Enhanced UI**: Glass morphism design with smooth animations
- ✅ **Mobile Responsive**: Optimized for all device sizes

### Technical Improvements
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Performance**: Optimized loading states and error handling
- ✅ **SEO Ready**: Proper meta tags and semantic HTML
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **Modern Stack**: Latest React 18 with Vite build system

---

**Built with ❤️ by the FUTUREINNVO Team**

*The Future of Innovation starts here.*
