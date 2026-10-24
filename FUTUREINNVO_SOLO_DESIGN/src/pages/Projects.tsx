import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Users, Code, Globe, Smartphone, Database, Zap, Brain, Briefcase, Package, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectsApi, Project } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Projects = () => {
  const { tr, tt, lang } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  // ?type=client | in_house — lets other pages link straight to the products tab
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const typeFilter: 'all' | 'client' | 'in_house' = typeParam === 'client' || typeParam === 'in_house' ? typeParam : 'all';
  const setTypeFilter = (type: 'all' | 'client' | 'in_house') => {
    setSearchParams(type === 'all' ? {} : { type }, { replace: true });
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getProjects();
        setProjects(response.results);
      } catch (err) {
        setError(tr('Failed to fetch projects data', 'تعذّر تحميل بيانات المشاريع'));
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fallback static data
  const fallbackProjects = [
    {
      id: 1,
      title: 'Smart City Management Platform',
      category: 'web',
      status: 'completed',
      client: 'Muscat Municipality',
      duration: '18 months',
      team: '12 developers',
      image: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Comprehensive platform for managing city resources, traffic, utilities, and citizen services through IoT integration and real-time analytics.',
      technologies: ['React', 'Node.js', 'MongoDB', 'IoT', 'AWS'],
      features: [
        'Real-time traffic monitoring and optimization',
        'Smart waste management system',
        'Citizen service portal with mobile app',
        'Energy consumption analytics dashboard',
        'Emergency response coordination system'
      ],
      impact: 'Reduced city operational costs by 25% and improved citizen satisfaction scores by 40%'
    },
    {
      id: 2,
      title: 'Healthcare Management System',
      category: 'web',
      status: 'completed',
      client: 'Royal Hospital',
      duration: '14 months',
      team: '10 developers',
      image: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Complete hospital management system with patient records, appointment scheduling, billing, and telemedicine capabilities.',
      technologies: ['Angular', 'Spring Boot', 'PostgreSQL', 'WebRTC', 'Docker'],
      features: [
        'Electronic health records (EHR) system',
        'Appointment scheduling and management',
        'Telemedicine video consultations',
        'Billing and insurance integration',
        'Medical inventory management'
      ],
      impact: 'Streamlined hospital operations, reduced waiting times by 35%, and enabled remote consultations for 10,000+ patients'
    },
    {
      id: 3,
      title: 'E-Commerce Marketplace App',
      category: 'mobile',
      status: 'ongoing',
      client: 'OmanShop',
      duration: '12 months',
      team: '8 developers',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Native mobile marketplace app connecting local businesses with customers, featuring AR product preview and AI-powered recommendations.',
      technologies: ['React Native', 'Firebase', 'TensorFlow', 'AR Kit', 'Stripe'],
      features: [
        'AR product visualization',
        'AI-powered product recommendations',
        'Multi-vendor marketplace support',
        'Real-time order tracking',
        'Integrated payment gateway'
      ],
      impact: 'Expected to onboard 500+ local businesses and serve 50,000+ customers in the first year'
    },
    {
      id: 4,
      title: 'Banking Digital Transformation',
      category: 'web',
      status: 'completed',
      client: 'National Bank of Oman',
      duration: '24 months',
      team: '15 developers',
      image: 'https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Complete digital banking platform with mobile banking, online services, and AI-powered fraud detection system.',
      technologies: ['Vue.js', 'Java', 'Oracle', 'Machine Learning', 'Kubernetes'],
      features: [
        'Online banking portal with advanced security',
        'Mobile banking app with biometric authentication',
        'AI-powered fraud detection system',
        'Personal finance management tools',
        'Investment portfolio management'
      ],
      impact: 'Increased digital banking adoption by 60% and reduced fraud incidents by 80%'
    },
    {
      id: 5,
      title: 'Educational Learning Management System',
      category: 'web',
      status: 'ongoing',
      client: 'Sultan Qaboos University',
      duration: '16 months',
      team: '9 developers',
      image: 'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Modern LMS with virtual classrooms, AI-powered assessment tools, and comprehensive analytics for educational institutions.',
      technologies: ['React', 'Python', 'Django', 'WebRTC', 'TensorFlow'],
      features: [
        'Virtual classroom with video conferencing',
        'AI-powered automated grading system',
        'Interactive whiteboard and collaboration tools',
        'Student progress tracking and analytics',
        'Mobile-responsive design for all devices'
      ],
      impact: 'Supporting 15,000+ students and 800+ faculty members with enhanced online learning experience'
    },
    {
      id: 6,
      title: 'Smart Agriculture IoT Platform',
      category: 'iot',
      status: 'completed',
      client: 'Oman Agriculture Development',
      duration: '10 months',
      team: '6 developers',
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'IoT-based smart farming solution with sensor networks, automated irrigation, and crop monitoring systems.',
      technologies: ['IoT Sensors', 'Python', 'MQTT', 'InfluxDB', 'Grafana'],
      features: [
        'Soil moisture and nutrient monitoring',
        'Automated irrigation control systems',
        'Weather station integration',
        'Crop health monitoring using drones',
        'Yield prediction using machine learning'
      ],
      impact: 'Improved crop yield by 30% and reduced water consumption by 40% across 500+ farms'
    }
  ];

  // Use API data if available, otherwise fallback to static data
  const displayProjects = projects.length > 0 ? projects : fallbackProjects;

  const categories = [
    { id: 'all', label: tr('All Projects', 'جميع المشاريع'), icon: Globe },
    { id: 'web', label: tr('Web Applications', 'تطبيقات الويب'), icon: Code },
    { id: 'mobile', label: tr('Mobile Apps', 'تطبيقات الجوال'), icon: Smartphone },
    { id: 'iot', label: tr('IoT Solutions', 'حلول إنترنت الأشياء'), icon: Zap },
    { id: 'data', label: tr('Data Analytics', 'تحليل البيانات'), icon: Database },
    { id: 'ai', label: tr('AI & Machine Learning', 'الذكاء الاصطناعي وتعلّم الآلة'), icon: Brain },
  ];

  const typeTabs = [
    { id: 'all' as const, label: tr('All', 'الكل'), icon: Globe },
    { id: 'client' as const, label: tr('Client Projects', 'مشاريع العملاء'), icon: Briefcase },
    { id: 'in_house' as const, label: tr('In-House Products', 'منتجاتنا الداخلية'), icon: Package },
  ];

  // Static fallback entries carry no project_type: treat them as client work
  const typeOf = (p: unknown) => (p as Project).project_type ?? 'client';
  const localTitle = (p: { title: string }) => (lang === 'ar' && (p as Project).title_ar) || p.title;
  const localDescription = (p: { description: string }) => (lang === 'ar' && (p as Project).description_ar) || p.description;

  const products = (projects as Project[]).filter(p => p.project_type === 'in_house');

  const filteredProjects = displayProjects
    .filter(project => typeFilter === 'all' || typeOf(project) === typeFilter)
    .filter(project => activeFilter === 'all' || project.category === activeFilter);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading projects...', 'جارٍ تحميل المشاريع...')}</p>
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in">
            {tr('Our Projects', 'مشاريعنا')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr('Explore our portfolio of innovative solutions that have transformed businesses and communities across various industries.', 'استكشف مجموعة حلولنا المبتكرة التي أحدثت تحولاً في الأعمال والمجتمعات عبر مختلف القطاعات.')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float">
            <div className="text-3xl font-bold text-blue-300 mb-2">5+</div>
            <div className="text-blue-100">{tr('Projects Delivered', 'مشاريع منجزة')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '1s' }}>
            <div className="text-3xl font-bold text-green-300 mb-2">98%</div>
            <div className="text-blue-100">{tr('Success Rate', 'نسبة النجاح')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '2s' }}>
            <div className="text-3xl font-bold text-purple-300 mb-2">5+</div>
            <div className="text-blue-100">{tr('Happy Clients', 'عملاء سعداء')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '3s' }}>
            <div className="text-3xl font-bold text-orange-300 mb-2">5</div>
            <div className="text-blue-100">{tr('Industries Served', 'قطاعات نخدمها')}</div>
          </div>
        </div>

        {/* Project type: client work vs in-house products */}
        <div className="flex justify-center mb-8">
          <div className="glass-effect-strong rounded-full p-1.5 inline-flex flex-wrap justify-center gap-1">
            {typeTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTypeFilter(id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  typeFilter === id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-500/20'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase of in-house products */}
        {typeFilter !== 'client' && products.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-6 w-6 text-blue-300" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">{tr('Showcase of Our Products', 'معرض منتجاتنا')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {products.map(product => (
                <article key={product.id} className="glass-effect-strong rounded-3xl overflow-hidden grid md:grid-cols-5 animate-slide-in">
                  <div className="md:col-span-2 relative min-h-[14rem]">
                    <img src={product.image} alt={localTitle(product)} className="absolute inset-0 w-full h-full object-cover" />
                    <span className="absolute top-4 start-4 text-xs font-semibold px-3 py-1 rounded-full bg-black/50 on-media backdrop-blur">
                      {tr('In-house product', 'منتج داخلي')}
                    </span>
                  </div>
                  <div className="md:col-span-3 p-6 md:p-8 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200">{categories.find(c => c.id === product.category)?.label ?? tt(product.category)}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusColor(product.status)}`}>{tt(product.status)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{localTitle(product)}</h3>
                    {(product.tagline || product.tagline_ar) && (
                      <p className="text-blue-300 font-medium mb-3">{(lang === 'ar' && product.tagline_ar) || product.tagline}</p>
                    )}
                    <p className="text-blue-100 mb-5 line-clamp-3">{localDescription(product)}</p>
                    {product.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.technologies.slice(0, 6).map(t => (
                          <span key={t.technology} className="glass-effect text-blue-200 px-3 py-1 rounded-full text-xs">{t.technology}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 mt-auto">
                      {product.product_url && (
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                        >
                          {tr('Visit product', 'زيارة المنتج')}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        to={`/projects/${product.slug}`}
                        className="inline-flex items-center gap-2 glass-effect text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-500/20"
                      >
                        {tr('Product details', 'تفاصيل المنتج')}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {typeFilter === 'in_house' && products.length === 0 && (
          <div className="glass-effect-strong rounded-2xl p-10 text-center mb-12">
            <Package className="h-12 w-12 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{tr('Our products are coming soon', 'منتجاتنا قادمة قريباً')}</h3>
            <p className="text-blue-200">{tr('Our in-house products will be showcased here.', 'سيتم عرض منتجاتنا الداخلية هنا.')}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="-mx-4 px-4 flex flex-nowrap overflow-x-auto sm:overflow-visible sm:flex-wrap sm:justify-center gap-2 sm:gap-4 mb-12 pb-2 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`flex shrink-0 items-center whitespace-nowrap px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 ${
                  activeFilter === category.id
                    ? 'glass-effect-strong text-white animate-pulse-glow'
                    : 'glass-effect text-blue-100 hover:glass-effect-strong hover:text-white'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-effect-strong rounded-2xl overflow-hidden hover:bg-blue-500/20 transition-all duration-300 animate-slide-in">
              <div className="relative">
                <img
                  src={project.image}
                  alt={localTitle(project)}
                  className="w-full h-64 object-cover"
                />
                {typeOf(project) === 'in_house' && (
                  <span className="absolute top-4 start-4 text-xs font-semibold px-3 py-1 rounded-full bg-black/50 on-media backdrop-blur">
                    {tr('In-house product', 'منتج داخلي')}
                  </span>
                )}
                <div className="absolute top-4 end-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {tt(project.status.charAt(0).toUpperCase() + project.status.slice(1))}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3">{localTitle(project)}</h3>
                <p className="text-blue-200 mb-4">{localDescription(project)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-blue-200">
                  {project.duration && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {tt(project.duration)}
                    </div>
                  )}
                  {('team' in project ? project.team : project.team_size) && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {'team' in project ? project.team : project.team_size}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    {typeOf(project) === 'in_house' ? tr('FUTUREINNVO product', 'منتج FUTUREINNVO') : project.client}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">{tr('Key Features:', 'أبرز المزايا:')}</h4>
                  <ul className="space-y-1">
                    {project.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-blue-200">
                        <span className="text-blue-300 mr-2">•</span>
                        {typeof feature === 'string' ? feature : feature.feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-2">{tr('Technologies:', 'التقنيات:')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="glass-effect text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30"
                      >
                        {typeof tech === 'string' ? tech : tech.technology}
                      </span>
                    ))}
                  </div>
                </div>
                
                {project.impact && (
                  <div className="glass-effect p-4 rounded-lg mb-6 border border-green-400/30">
                    <h4 className="font-semibold text-green-300 mb-2">{tr('Impact:', 'الأثر:')}</h4>
                    <p className="text-green-200 text-sm">{project.impact}</p>
                  </div>
                )}
                
                <Link
                  to={`/projects/${'slug' in project ? project.slug : project.id}`}
                  className="w-full glass-effect-strong hover:bg-blue-500/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center animate-pulse-glow"
                >
                  {tr('View Project Details', 'عرض تفاصيل المشروع')}
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass-effect-strong animate-gradient bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4 animate-slide-in">{tr('Ready to Start Your Project?', 'هل أنت مستعد لبدء مشروعك؟')}</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto animate-slide-in">
            {tr("Let's discuss how we can bring your vision to life with cutting-edge technology and innovative solutions.", 'لنتحدث عن كيف يمكننا تحويل رؤيتك إلى واقع بتقنيات متقدمة وحلول مبتكرة.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="glass-effect-strong text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500/30 transition-all duration-200 animate-pulse-glow">
              {tr('Start a Project', 'ابدأ مشروعاً')}
            </button>
            <button className="glass-effect text-white px-8 py-3 rounded-lg font-semibold border border-blue-400/30 hover:glass-effect-strong transition-all duration-200">
              {tr('View All Projects', 'عرض جميع المشاريع')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;