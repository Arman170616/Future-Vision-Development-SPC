import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Users, ArrowRight, Search, Filter, DollarSign, Calendar } from 'lucide-react';
import { careersApi, JobOpening } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const JobOpenings = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await careersApi.getJobs();
        setJobOpenings(response.results);
        setError(null);
      } catch (err) {
        setError(tr('Failed to fetch job openings', 'تعذّر تحميل الوظائف المتاحة'));
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fallback static data
  const fallbackJobOpenings = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Salalah, Oman',
      job_type: 'Full-time',
      experience_required: '5+ years',
      salary_range: '$80,000 - $120,000',
      description: 'We are looking for an experienced software engineer to join our dynamic team and work on cutting-edge projects.',
      requirements: [
        { requirement: 'Bachelor\'s degree in Computer Science or related field' },
        { requirement: '5+ years of software development experience' },
        { requirement: 'Proficiency in React, Node.js, and modern web technologies' },
        { requirement: 'Strong problem-solving and communication skills' },
        { requirement: 'Experience with cloud platforms (AWS, Azure)' }
      ],
      responsibilities: [
        { responsibility: 'Design and develop scalable web applications' },
        { responsibility: 'Collaborate with cross-functional teams' },
        { responsibility: 'Mentor junior developers' },
        { responsibility: 'Participate in code reviews and technical discussions' },
        { responsibility: 'Stay up-to-date with emerging technologies' }
      ],
      posted_at: '2024-03-15T10:00:00Z',
      application_deadline: '2024-04-15T23:59:59Z',
      is_active: true
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Salalah, Oman',
      job_type: 'Full-time',
      experience_required: '3+ years',
      salary_range: '$70,000 - $100,000',
      description: 'Join our product team to drive innovation and deliver exceptional user experiences.',
      requirements: [
        { requirement: 'Bachelor\'s degree in Business, Engineering, or related field' },
        { requirement: '3+ years of product management experience' },
        { requirement: 'Strong analytical and strategic thinking skills' },
        { requirement: 'Experience with Agile methodologies' },
        { requirement: 'Excellent communication and leadership abilities' }
      ],
      responsibilities: [
        { responsibility: 'Define product strategy and roadmap' },
        { responsibility: 'Gather and prioritize product requirements' },
        { responsibility: 'Work closely with engineering and design teams' },
        { responsibility: 'Analyze market trends and user feedback' },
        { responsibility: 'Drive product launches and go-to-market strategies' }
      ],
      posted_at: '2024-03-10T10:00:00Z',
      application_deadline: '2024-04-10T23:59:59Z',
      is_active: true
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Salalah, Oman',
      job_type: 'Full-time',
      experience_required: '2+ years',
      salary_range: '$60,000 - $85,000',
      description: 'Create beautiful and intuitive user experiences that delight our customers.',
      requirements: [
        { requirement: 'Bachelor\'s degree in Design or related field' },
        { requirement: '2+ years of UI/UX design experience' },
        { requirement: 'Proficiency in Figma, Adobe Creative Suite' },
        { requirement: 'Strong portfolio demonstrating design skills' },
        { requirement: 'Understanding of user-centered design principles' }
      ],
      responsibilities: [
        { responsibility: 'Design user interfaces for web and mobile applications' },
        { responsibility: 'Conduct user research and usability testing' },
        { responsibility: 'Create wireframes, prototypes, and design systems' },
        { responsibility: 'Collaborate with developers and product managers' },
        { responsibility: 'Ensure consistent brand experience across products' }
      ],
      posted_at: '2024-03-12T10:00:00Z',
      application_deadline: '2024-04-12T23:59:59Z',
      is_active: true
    }
  ];

  // Use API data if available, otherwise fallback to static data
  const displayJobOpenings = jobOpenings.length > 0 ? jobOpenings : fallbackJobOpenings;

  // Get unique departments and job types for filtering
  const departments = ['All', ...new Set(displayJobOpenings.map(job => job.department))];
  const jobTypes = ['All', ...new Set(displayJobOpenings.map(job => job.job_type))];

  // Filter jobs based on search and filters
  const filteredJobs = displayJobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment;
    const matchesType = selectedType === 'All' || job.job_type === selectedType;
    
    return matchesSearch && matchesDepartment && matchesType && job.is_active;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading job openings...', 'جارٍ تحميل الوظائف...')}</p>
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
            {tr('Join Our ', 'انضم إلى ')}<span className="text-blue-300 animate-pulse-glow">{tr('Team', 'فريقنا')}</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr('Discover exciting career opportunities and be part of our mission to transform the future through innovation and technology.', 'اكتشف فرصاً وظيفية مميزة وكن جزءاً من رسالتنا في صناعة المستقبل عبر الابتكار والتقنية.')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float">
            <div className="text-3xl font-bold text-blue-300 mb-2">{displayJobOpenings.length}</div>
            <div className="text-blue-100">{tr('Open Positions', 'وظائف متاحة')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl font-bold text-green-300 mb-2">{departments.length - 1}</div>
            <div className="text-blue-100">{tr('Departments', 'الأقسام')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '0.4s' }}>
            <div className="text-3xl font-bold text-purple-300 mb-2">10+</div>
            <div className="text-blue-100">{tr('Team Members', 'أعضاء الفريق')}</div>
          </div>
          <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '0.6s' }}>
            <div className="text-3xl font-bold text-yellow-300 mb-2">2+</div>
            <div className="text-blue-100">{tr('Countries', 'دول')}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect-strong rounded-xl p-6 mb-8 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <input
                type="text"
                placeholder={tr('Search jobs...', 'ابحث عن وظيفة...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-blue-900 text-white">{tt(dept)}</option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
              >
                {jobTypes.map(type => (
                  <option key={type} value={type} className="bg-blue-900 text-white">{tt(type)}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className="text-blue-200">
                {tr(`${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} found`, `عدد الوظائف: ${filteredJobs.length}`)}
              </span>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {filteredJobs.map((job, index) => (
            <div 
              key={job.id} 
              className="glass-effect-strong rounded-xl p-6 hover:bg-blue-500/20 transition-all duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                    <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                      {tt(job.department)}
                    </span>
                    <span className="bg-green-500/30 text-green-200 px-3 py-1 rounded-full text-sm">
                      {tt(job.job_type)}
                    </span>
                  </div>

                  <p className="text-blue-100 mb-4 leading-relaxed">{job.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-200">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tt(job.location)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {tt(job.experience_required)}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="ltr">{job.salary_range || tr('Competitive', 'تنافسي')}</span>
                    </div>
                    {'posted_at' in job && job.posted_at && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {tr('Posted', 'نُشرت في')} {fmtDate(job.posted_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 lg:mt-0 lg:ms-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="glass-effect hover:bg-blue-500/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
                  >
                    {tr('View Details', 'عرض التفاصيل')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to={`/apply/${job.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
                  >
                    {tr('Apply Now', 'قدّم الآن')}
                    <Users className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">{tr('No positions found', 'لا توجد وظائف')}</h3>
            <p className="text-blue-200">{tr('Try adjusting your search criteria or check back later for new opportunities.', 'جرّب تعديل معايير البحث أو عُد لاحقاً للاطلاع على فرص جديدة.')}</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 glass-effect-strong rounded-xl p-8 text-center animate-slide-in">
          <h2 className="text-3xl font-bold text-white mb-4">{tr("Don't See the Perfect Role?", 'لم تجد الوظيفة المناسبة؟')}</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            {tr("We're always looking for talented individuals to join our team. Send us your resume and let us know how you'd like to contribute to our mission.", 'نبحث دائماً عن أصحاب المواهب للانضمام إلى فريقنا. أرسل لنا سيرتك الذاتية وأخبرنا كيف ترغب في الإسهام في رسالتنا.')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200"
          >
            {tr('Get in Touch', 'تواصل معنا')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobOpenings;
