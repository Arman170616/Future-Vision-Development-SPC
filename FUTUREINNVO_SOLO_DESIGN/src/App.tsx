import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import LiquidBackground from './components/LiquidBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Career from './pages/Career';
import Contact from './pages/Contact';
import Activities from './pages/Activities';
import Gallery from './pages/Gallery';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Team from './pages/Team';
import CEOMessage from './pages/CEOMessage';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import JobOpenings from './pages/JobOpenings';
import JobDetails from './pages/JobDetails';
import JobApplication from './pages/JobApplication';
import Courses from './pages/Courses';
import CourseRegistration from './pages/CourseRegistration';
import NotFound from './pages/NotFound';
import TestError from './pages/TestError';
import Privacy from './pages/Privacy';
import About from './pages/About';
import { SeoManager } from './hooks/useSeo';

// Course details now expand inline on /courses; keep old /courses/<slug> links working
const CourseRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/courses?course=${encodeURIComponent(slug ?? '')}`} replace />;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <Router>
        <SeoManager />
        <div className="min-h-screen">
          <LiquidBackground />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetails />} />
              <Route path="/team" element={<Team />} />
              <Route path="/ceo-message" element={<CEOMessage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />
              <Route path="/jobs" element={<JobOpenings />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/apply/:jobId" element={<JobApplication />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:slug" element={<CourseRedirect />} />
              <Route path="/register" element={<CourseRegistration />} />
              <Route path="/register/:courseId" element={<CourseRegistration />} />
              <Route path="/privacy" element={<Privacy />} />
              {/* Test route for Error Boundary - remove in production */}
              <Route path="/test-error" element={<TestError />} />
              {/* 404 Catch-all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
