import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { careersApi, JobOpening, JobApplication } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Career = () => {
  const { tr, tt } = useLanguage();
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    coverLetter: '',
  });

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
      type: 'Full-time',
      experience: '5+ years',
      description: 'We are looking for an experienced software engineer to join our dynamic team and work on cutting-edge projects.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of software development experience',
        'Proficiency in React, Node.js, and modern web technologies',
        'Strong problem-solving and communication skills',
        'Experience with cloud platforms (AWS, Azure)',
      ],
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Mentor junior developers',
        'Participate in code reviews and technical discussions',
        'Stay up-to-date with emerging technologies',
      ],
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Salalah, Oman',
      type: 'Full-time',
      experience: '3+ years',
      description: 'Join our product team to drive innovation and deliver exceptional user experiences.',
      requirements: [
        'Bachelor\'s degree in Business, Engineering, or related field',
        '3+ years of product management experience',
        'Strong analytical and strategic thinking skills',
        'Experience with Agile methodologies',
        'Excellent communication and leadership abilities',
      ],
      responsibilities: [
        'Define product strategy and roadmap',
        'Gather and prioritize product requirements',
        'Work closely with engineering and design teams',
        'Analyze market trends and user feedback',
        'Drive product launches and go-to-market strategies',
      ],
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Salalah, Oman',
      type: 'Full-time',
      experience: '2+ years',
      description: 'Create beautiful and intuitive user experiences that delight our customers.',
      requirements: [
        'Bachelor\'s degree in Design or related field',
        '2+ years of UI/UX design experience',
        'Proficiency in Figma, Adobe Creative Suite',
        'Strong portfolio demonstrating design skills',
        'Understanding of user-centered design principles',
      ],
      responsibilities: [
        'Design user interfaces for web and mobile applications',
        'Conduct user research and usability testing',
        'Create wireframes, prototypes, and design systems',
        'Collaborate with developers and product managers',
        'Ensure consistent brand experience across products',
      ],
    },
  ];

  // Use API data if available, otherwise fallback to static data
  const displayJobOpenings = jobOpenings.length > 0 ? jobOpenings : fallbackJobOpenings;

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJob) {
      alert(tr('Please select a job position first.', 'يرجى اختيار الوظيفة أولاً.'));
      return;
    }

    try {
      const applicationPayload: Omit<JobApplication, 'id' | 'job_title' | 'applied_at'> = {
        job: selectedJob.id,
        name: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        experience_level: applicationData.experience,
        cover_letter: applicationData.coverLetter,
      };

      await careersApi.submitApplication(applicationPayload);
      alert(tr('Application submitted successfully! We will get back to you soon.', 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.'));

      // Reset form
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        coverLetter: '',
      });
      setSelectedJob(null);
    } catch (err) {
      console.error('Error submitting application:', err);
      alert(tr('Failed to submit application. Please try again.', 'تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى.'));
    }
    setApplicationData({
      name: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      coverLetter: '',
    });
  };

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
            {tr('Join Our Team', 'انضم إلى فريقنا')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in mb-8">
            {tr('Build your career with us and be part of shaping the future through innovation and technology.', 'ابنِ مسيرتك المهنية معنا وكن جزءاً من صناعة المستقبل عبر الابتكار والتقنية.')}
          </p>

          {/* Link to new Jobs page */}
          <div className="animate-slide-in">
            <Link
              to="/jobs"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 text-lg"
            >
              {tr('Browse All Job Openings', 'تصفّح جميع الوظائف')}
              <ExternalLink className="ml-2 h-5 w-5" />
            </Link>
            <p className="text-blue-300 text-sm mt-2">
              {tr('View detailed job descriptions and apply online', 'اطّلع على الوصف الوظيفي التفصيلي وقدّم عبر الإنترنت')}
            </p>
          </div>
        </div>

        {/* Company Culture */}
        <section className="mb-16">
          <div className="glass-effect-strong rounded-2xl p-8 md:p-12 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{tr('Why Work With Us?', 'لماذا تعمل معنا؟')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center animate-float">
                <Users className="h-12 w-12 text-blue-300 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="text-xl font-semibold text-white mb-2">{tr('Collaborative Environment', 'بيئة عمل تعاونية')}</h3>
                <p className="text-blue-100">{tr('Work with talented professionals who share your passion for innovation.', 'اعمل مع محترفين موهوبين يشاركونك شغف الابتكار.')}</p>
              </div>
              <div className="text-center animate-float" style={{ animationDelay: '1s' }}>
                <Briefcase className="h-12 w-12 text-green-300 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="text-xl font-semibold text-white mb-2">{tr('Growth Opportunities', 'فرص للنمو')}</h3>
                <p className="text-blue-100">{tr('Advance your career with continuous learning and development programs.', 'طوّر مسيرتك عبر برامج التعلّم والتطوير المستمر.')}</p>
              </div>
              <div className="text-center animate-float" style={{ animationDelay: '2s' }}>
                <ArrowRight className="h-12 w-12 text-purple-300 mx-auto mb-4 animate-pulse-glow" />
                <h3 className="text-xl font-semibold text-white mb-2">{tr('Cutting-Edge Projects', 'مشاريع متقدمة')}</h3>
                <p className="text-blue-100">{tr('Work on innovative projects that make a real impact on businesses and society.', 'اعمل على مشاريع مبتكرة تُحدث أثراً حقيقياً في الأعمال والمجتمع.')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center animate-slide-in">{tr('Current Openings', 'الوظائف الحالية')}</h2>
          <div className="space-y-6">
            {displayJobOpenings.map((job) => (
              <div key={job.id} className="glass-effect-strong rounded-xl overflow-hidden animate-float hover:bg-blue-500/20 transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                        <span className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {tt(job.department)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {tt(job.location)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {tt('type' in job ? job.type : job.job_type)}
                        </span>
                        <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded">
                          {tt('experience' in job ? job.experience : job.experience_required)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="mt-4 md:mt-0 bg-blue-500/30 hover:bg-blue-500/50 text-white px-6 py-2 rounded-lg transition-all duration-200 border border-blue-400/30"
                    >
                      {selectedJob === job.id ? tr('Hide Details', 'إخفاء التفاصيل') : tr('View Details', 'عرض التفاصيل')}
                    </button>
                  </div>
                  <p className="text-blue-100">{job.description}</p>
                  
                  {selectedJob === job.id && (
                    <div className="mt-6 pt-6 border-t border-blue-400/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">{tr('Requirements', 'المتطلبات')}</h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-300 mr-2">•</span>
                                <span className="text-blue-100">
                                  {typeof req === 'string' ? req : req.requirement}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">{tr('Responsibilities', 'المهام')}</h4>
                          <ul className="space-y-2">
                            {job.responsibilities.map((resp, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-300 mr-2">•</span>
                                <span className="text-blue-100">
                                  {typeof resp === 'string' ? resp : resp.responsibility}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section>
          <div className="glass-effect-strong rounded-2xl p-8 md:p-12 animate-slide-in">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">{tr('Apply Now', 'قدّم الآن')}</h2>
            <form onSubmit={handleApplicationSubmit} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    {tr('Full Name *', 'الاسم الكامل *')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                    value={applicationData.name}
                    onChange={(e) => setApplicationData({ ...applicationData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    {tr('Email Address *', 'البريد الإلكتروني *')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                    value={applicationData.email}
                    onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                    {tr('Phone Number', 'رقم الهاتف')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                    value={applicationData.phone}
                    onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-white mb-2">
                    {tr('Position Applied For *', 'الوظيفة المتقدَّم لها *')}
                  </label>
                  <select
                    id="position"
                    required
                    className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                    value={applicationData.position}
                    onChange={(e) => setApplicationData({ ...applicationData, position: e.target.value })}
                  >
                    <option value="">{tr('Select Position', 'اختر الوظيفة')}</option>
                    {displayJobOpenings.map((job) => (
                      <option key={job.id} value={job.title}>{job.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label htmlFor="experience" className="block text-sm font-medium text-white mb-2">
                  {tr('Years of Experience', 'سنوات الخبرة')}
                </label>
                <select
                  id="experience"
                  className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData({ ...applicationData, experience: e.target.value })}
                >
                  <option value="">{tr('Select Experience Level', 'اختر مستوى الخبرة')}</option>
                  <option value="0-1">{tr('0-1 years', '0-1 سنة')}</option>
                  <option value="2-3">{tr('2-3 years', '2-3 سنوات')}</option>
                  <option value="4-5">{tr('4-5 years', '4-5 سنوات')}</option>
                  <option value="6-10">{tr('6-10 years', '6-10 سنوات')}</option>
                  <option value="10+">{tr('10+ years', 'أكثر من 10 سنوات')}</option>
                </select>
              </div>
              
              <div className="mt-6">
                <label htmlFor="coverLetter" className="block text-sm font-medium text-white mb-2">
                  {tr('Cover Letter *', 'خطاب التقديم *')}
                </label>
                <textarea
                  id="coverLetter"
                  rows={6}
                  required
                  className="w-full px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors text-white placeholder-blue-200"
                  placeholder={tr("Tell us why you're the perfect fit for this role...", 'أخبرنا لماذا أنت الشخص المناسب لهذه الوظيفة...')}
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                ></textarea>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  {tr('Submit Application', 'إرسال الطلب')}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Career;