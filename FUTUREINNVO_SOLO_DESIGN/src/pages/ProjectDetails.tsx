import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Globe, ExternalLink, CheckCircle, TrendingUp, Award, Lightbulb } from 'lucide-react';
import { projectsApi, Project } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const ProjectDetails = () => {
  const { tr, tt, fmtDate, lang } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const projectData = await projectsApi.getProject(slug);
        setProject(projectData);
        setError(null);
      } catch (err) {
        setError(tr('Failed to fetch project details', 'تعذّر تحميل تفاصيل المشروع'));
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  // Fallback static data for development
  const fallbackProjects = [
    {
      id: 1,
      title: 'Smart City Management Platform',
      category: 'AI & IoT Solutions',
      status: 'completed',
      client: 'Muscat Municipality',
      duration: '18 months',
      team: '12 developers',
      budget: '$2.5M',
      completionDate: 'March 2024',
      image: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gallery: [
        'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'A comprehensive AI-powered platform for managing city resources, traffic optimization, utilities monitoring, and citizen services through advanced IoT integration and real-time analytics. This digital transformation project revolutionized how the city operates and serves its citizens.',
      challenge: 'Muscat Municipality faced challenges with inefficient resource allocation, traffic congestion, and limited citizen engagement. Traditional systems were siloed and lacked real-time insights, leading to reactive rather than proactive city management.',
      solution: 'We developed an integrated AI platform that connects all city systems through IoT sensors and machine learning algorithms. The solution provides predictive analytics, automated resource optimization, and a unified citizen service portal.',
      technologies: ['React', 'Node.js', 'MongoDB', 'TensorFlow', 'IoT Sensors', 'AWS', 'Python', 'Machine Learning'],
      features: [
        'AI-powered traffic flow optimization reducing congestion by 35%',
        'Smart waste management with predictive collection routes',
        'Citizen service portal with 24/7 AI chatbot support',
        'Real-time energy consumption analytics and optimization',
        'Emergency response coordination with automated alerts',
        'Predictive maintenance for city infrastructure',
        'Mobile app for citizens with AR navigation features',
        'Dashboard with real-time city metrics and KPIs'
      ],
      results: [
        'Reduced city operational costs by 25% ($1.2M annual savings)',
        'Improved citizen satisfaction scores by 40%',
        'Decreased emergency response time by 30%',
        'Optimized energy consumption reducing carbon footprint by 20%',
        'Increased citizen engagement through digital services by 60%'
      ],
      testimonial: {
        quote: "Future Innovation transformed how we manage our city. Their AI solutions have made us more efficient, sustainable, and responsive to our citizens' needs.",
        author: "Ahmed Al-Rashid",
        position: "Director of Digital Services, Muscat Municipality"
      },
      nextSteps: 'Phase 2 expansion to include AI-powered urban planning and smart building integration across the city.'
    },
    {
      id: 2,
      title: 'Healthcare Management System',
      category: 'Digital Transformation',
      status: 'completed',
      client: 'Royal Hospital',
      duration: '14 months',
      team: '10 developers',
      budget: '$1.8M',
      completionDate: 'February 2024',
      image: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gallery: [
        'https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Complete digital transformation of hospital operations with AI-powered patient management, telemedicine capabilities, and intelligent resource allocation. This comprehensive system revolutionized healthcare delivery and patient experience.',
      challenge: 'Royal Hospital struggled with paper-based records, long waiting times, inefficient resource allocation, and limited remote healthcare capabilities, especially highlighted during the pandemic.',
      solution: 'We implemented a fully integrated digital ecosystem with AI-driven patient flow optimization, electronic health records, telemedicine platform, and predictive analytics for resource management.',
      technologies: ['Angular', 'Spring Boot', 'PostgreSQL', 'WebRTC', 'Docker', 'AI/ML', 'Blockchain', 'Cloud Infrastructure'],
      features: [
        'AI-powered electronic health records (EHR) system',
        'Intelligent appointment scheduling with wait time prediction',
        'Telemedicine platform with HD video consultations',
        'Automated billing and insurance claim processing',
        'Smart medical inventory management with predictive restocking',
        'Patient flow optimization using machine learning',
        'Mobile app for patients with health tracking features',
        'Real-time bed management and resource allocation'
      ],
      results: [
        'Reduced patient waiting times by 35%',
        'Enabled remote consultations for 10,000+ patients',
        'Improved operational efficiency by 45%',
        'Decreased medical errors by 60% through digital records',
        'Increased patient satisfaction scores by 50%'
      ],
      testimonial: {
        quote: "The digital transformation has revolutionized our hospital operations. We can now provide better care more efficiently than ever before.",
        author: "Dr. Fatima Al-Zahra",
        position: "Chief Medical Officer, Royal Hospital"
      },
      nextSteps: 'Integration with national health database and expansion of AI diagnostic capabilities.'
    },
    {
      id: 3,
      title: 'E-Commerce Marketplace App',
      category: 'AI & Mobile Solutions',
      status: 'ongoing',
      client: 'OmanShop',
      duration: '12 months',
      team: '8 developers',
      budget: '$1.2M',
      completionDate: 'Expected June 2024',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=1200',
      gallery: [
        'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      description: 'Revolutionary mobile marketplace leveraging AI for personalized shopping experiences, AR product visualization, and intelligent vendor matching. This platform is transforming local e-commerce in Oman.',
      challenge: 'Local businesses struggled to compete with international e-commerce platforms, lacking digital presence and advanced features that modern consumers expect.',
      solution: 'We\'re building a comprehensive marketplace with AI-powered recommendations, AR try-before-buy features, and intelligent logistics optimization to support local businesses.',
      technologies: ['React Native', 'Firebase', 'TensorFlow', 'AR Kit', 'Stripe', 'Node.js', 'Machine Learning', 'Cloud Functions'],
      features: [
        'AI-powered product recommendations based on user behavior',
        'AR product visualization for furniture and fashion items',
        'Multi-vendor marketplace with intelligent vendor matching',
        'Real-time order tracking with delivery optimization',
        'Integrated payment gateway with multiple options',
        'Voice search and AI shopping assistant',
        'Social commerce features with user-generated content',
        'Advanced analytics dashboard for vendors'
      ],
      results: [
        'Successfully onboarded 300+ local businesses (target: 500+)',
        'Achieved 25,000+ app downloads in beta phase',
        'Generated $500K+ in transactions during pilot',
        'Improved local business digital presence by 80%',
        'Created 200+ new jobs in the digital economy'
      ],
      testimonial: {
        quote: "Future Innovation is helping us compete globally while supporting our local economy. Their AI features are game-changing.",
        author: "Mohammed Al-Balushi",
        position: "CEO, OmanShop"
      },
      nextSteps: 'Full launch with expanded AI features and integration with government digital initiatives.'
    }
  ];

  // Use API data if available, otherwise fallback to static data
  const displayProject = project || fallbackProjects.find(p => p.id === parseInt(slug || '1'));
  // In-house product fields and Arabic overrides only exist on API data
  const isProduct = project?.project_type === 'in_house';
  const title = (lang === 'ar' && project?.title_ar) || displayProject?.title || '';
  const description = (lang === 'ar' && project?.description_ar) || displayProject?.description || '';
  const tagline = (lang === 'ar' && project?.tagline_ar) || project?.tagline;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading project details...', 'جارٍ تحميل تفاصيل المشروع...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 text-lg">{error}</p>
          <p className="text-blue-100 mt-2">{tr('Using fallback data...', 'يتم عرض بيانات احتياطية...')}</p>
        </div>
      </div>
    );
  }

  if (!displayProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-effect-strong p-8 rounded-xl">
          <h1 className="text-2xl font-bold text-white mb-4">{tr('Project Not Found', 'المشروع غير موجود')}</h1>
          <Link to="/projects" className="text-blue-300 hover:text-blue-200 transition-colors duration-200">
            {tr('Back to Projects', 'العودة إلى المشاريع')}
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/projects"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors duration-200 animate-slide-in"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {tr('Back to Projects', 'العودة إلى المشاريع')}
        </Link>

        {/* Hero Section */}
        <div className="glass-effect-strong rounded-2xl overflow-hidden mb-12 animate-slide-in">
          <div className="relative h-96">
            <img
              src={displayProject.image}
              alt={displayProject.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-8 start-8 end-8 text-white on-media">
              <div className="flex flex-wrap items-center gap-y-2 mb-4">
                {isProduct && (
                  <span className="me-4 bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {tr('In-house product', 'منتج داخلي')}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayProject.status)}`}>
                  {tt(displayProject.status.charAt(0).toUpperCase() + displayProject.status.slice(1))}
                </span>
                <span className="ms-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {tt(displayProject.category)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              <p className="text-xl text-gray-200 max-w-2xl line-clamp-3">{tagline || description}</p>
              {isProduct && project?.product_url && (
                <a
                  href={project.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  {tr('Visit product', 'زيارة المنتج')}
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="glass-effect-strong rounded-xl p-8 animate-float">
              <h2 className="text-2xl font-bold text-white mb-6">
                {isProduct ? tr('Product Overview', 'نظرة عامة على المنتج') : tr('Project Overview', 'نظرة عامة على المشروع')}
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">{description}</p>
            </div>

            {/* Challenge & Solution */}
            {(displayProject.challenge || displayProject.solution) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayProject.challenge && (
                  <div className="glass-effect-strong rounded-xl p-6 animate-float">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-500/30 p-2 rounded-lg mr-3">
                        <TrendingUp className="h-6 w-6 text-red-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{tr('Challenge', 'التحدي')}</h3>
                    </div>
                    <p className="text-blue-100">{displayProject.challenge}</p>
                  </div>
                )}

                {displayProject.solution && (
                  <div className="glass-effect-strong rounded-xl p-6 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center mb-4">
                      <div className="bg-green-500/30 p-2 rounded-lg mr-3">
                        <Lightbulb className="h-6 w-6 text-green-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{tr('Solution', 'الحل')}</h3>
                    </div>
                    <p className="text-blue-100">{displayProject.solution}</p>
                  </div>
                )}
              </div>
            )}

            {/* Key Features */}
            {displayProject.features && displayProject.features.length > 0 && (
              <div className="glass-effect-strong rounded-xl p-8 animate-float" style={{ animationDelay: '2s' }}>
                <h2 className="text-2xl font-bold text-white mb-6">{tr('Key Features', 'أبرز المزايا')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayProject.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-100">
                        {typeof feature === 'string' ? feature : feature.feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies */}
            {displayProject.technologies && displayProject.technologies.length > 0 && (
              <div className="glass-effect-strong rounded-xl p-8 animate-float" style={{ animationDelay: '3s' }}>
                <h2 className="text-2xl font-bold text-white mb-6">{tr('Technologies Used', 'التقنيات المستخدمة')}</h2>
                <div className="flex flex-wrap gap-3">
                  {displayProject.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/30 text-blue-200 px-4 py-2 rounded-lg font-medium border border-blue-400/30"
                    >
                      {typeof tech === 'string' ? tech : tech.technology}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Results & Impact */}
            <div className="glass-effect-strong rounded-xl p-8">
              <div className="flex items-center mb-6">
                <Award className="h-8 w-8 text-green-300 mr-3" />
                <h2 className="text-2xl font-bold text-white">{tr('Results & Impact', 'النتائج والأثر')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProject.results && displayProject.results.map((result, index) => (
                  <div key={index} className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100 font-medium">
                      {typeof result === 'string' ? result : result.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Testimonial */}
            <div className="glass-effect-strong rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Client Testimonial', 'رأي العميل')}</h2>
              {displayProject.testimonial && (
                <>
                  <blockquote className="text-lg text-blue-100 italic mb-4">
                    "{displayProject.testimonial.quote || displayProject.testimonial.content}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {(displayProject.testimonial.author || displayProject.testimonial.client_name || '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{displayProject.testimonial.author || displayProject.testimonial.client_name}</div>
                      <div className="text-blue-200">{displayProject.testimonial.position || displayProject.testimonial.client_position}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Gallery */}
            {displayProject.gallery && displayProject.gallery.length > 0 && (
              <div className="glass-effect-strong rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">{tr('Project Gallery', 'معرض المشروع')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayProject.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={typeof image === 'string' ? image : image.image}
                      alt={`${displayProject.title} gallery ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {displayProject.nextSteps && (
              <div className="glass-effect-strong rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">{tr('Next Steps', 'الخطوات القادمة')}</h2>
                <p className="text-blue-100">{displayProject.nextSteps}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="glass-effect-strong rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{tr('Project Information', 'معلومات المشروع')}</h3>
              <div className="space-y-4">
                {displayProject.client && !isProduct && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Client', 'العميل')}</div>
                      <div className="font-medium text-white">{displayProject.client}</div>
                    </div>
                  </div>
                )}
                {displayProject.duration && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Duration', 'المدة')}</div>
                      <div className="font-medium text-white">{tt(displayProject.duration)}</div>
                    </div>
                  </div>
                )}
                {displayProject.team && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Team Size', 'حجم الفريق')}</div>
                      <div className="font-medium text-white">{displayProject.team}</div>
                    </div>
                  </div>
                )}
                {displayProject.budget && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Budget', 'الميزانية')}</div>
                      <div className="font-medium text-white ltr">{displayProject.budget}</div>
                    </div>
                  </div>
                )}
                {(displayProject.completionDate || displayProject.completed_at) && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Completion', 'تاريخ الإنجاز')}</div>
                      <div className="font-medium text-white">
                        {displayProject.completionDate || fmtDate(displayProject.completed_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-effect-strong rounded-xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-4">{tr('Interested in Similar Solutions?', 'مهتم بحلول مماثلة؟')}</h3>
              <p className="text-blue-100 mb-6">
                {tr("Let's discuss how we can transform your business with AI and digital innovation.", 'لنتحدث عن كيف يمكننا تحويل أعمالك بالذكاء الاصطناعي والابتكار الرقمي.')}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {tr('Start Your Project', 'ابدأ مشروعك')}
                <ExternalLink className="ml-2 h-5 w-5" />
              </Link>
            </div>

            {/* Related Projects */}
            <div className="glass-effect-strong rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">{tr('Related Projects', 'مشاريع ذات صلة')}</h3>
              <div className="space-y-4">
                {fallbackProjects.filter(p => p.id !== displayProject.id).slice(0, 2).map((relatedProject) => (
                  <Link
                    key={relatedProject.id}
                    to={`/projects/${relatedProject.slug || relatedProject.id}`}
                    className="block group"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-500/20 transition-colors duration-200">
                      <img
                        src={relatedProject.image}
                        alt={relatedProject.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                          {relatedProject.title}
                        </h4>
                        <p className="text-sm text-blue-200">{relatedProject.client}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;