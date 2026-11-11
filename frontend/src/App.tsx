import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Team from './pages/Team';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import JobOpenings from './pages/JobOpenings';
import JobDetails from './pages/JobDetails';
import JobApplication from './pages/JobApplication';
import NotFound from './pages/NotFound';
import TestError from './pages/TestError';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Services from './pages/Services';
import Experience from './pages/Experience';
import { SeoManager } from './hooks/useSeo';

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
              <Route path="/services" element={<Services />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/team" element={<Team />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetails />} />
              <Route path="/jobs" element={<JobOpenings />} />
              <Route path="/jobs/:jobId" element={<JobDetails />} />
              <Route path="/apply/:jobId" element={<JobApplication />} />
              {/* Pages from the previous site: keep old links working */}
              <Route path="/ceo-message" element={<Navigate to="/about" replace />} />
              {['/projects', '/projects/*', '/courses', '/courses/*', '/register', '/register/*', '/ai-courses-salalah', '/ai-solutions-salalah'].map(path => (
                <Route key={path} path={path} element={<Navigate to="/services" replace />} />
              ))}
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
