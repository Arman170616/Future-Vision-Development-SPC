import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, DollarSign, Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { careersApi, JobOpening } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { summary, useSeo } from '../hooks/useSeo';

const JobDetails = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSeo(
    job
      ? {
          title: `${job.title} — ${job.location}`,
          description: summary(job.description),
          jsonLd: {
            '@type': 'JobPosting',
            title: job.title,
            description: job.description,
            datePosted: job.created_at?.slice(0, 10),
            employmentType: job.job_type?.toUpperCase().replace(/[\s-]+/g, '_'),
            hiringOrganization: { '@type': 'Organization', name: 'Future Vision Development SPC', sameAs: 'https://futureinnvo.com', logo: 'https://futureinnvo.com/brand/icon-512.png' },
            jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'OM' } },
          },
        }
      : null,
  );

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        // For now, we'll use the jobs list endpoint and find the specific job
        const response = await careersApi.getJobs();
        const foundJob = response.results.find(j => j.id.toString() === jobId);
        
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError(tr('Job not found', 'الوظيفة غير موجودة'));
        }
      } catch (err) {
        setError(tr('Failed to fetch job details', 'تعذّر تحميل تفاصيل الوظيفة'));
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  // Fallback static data
  const fallbackJob = {
    id: 1,
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Salalah, Oman',
    job_type: 'Full-time',
    experience_required: '5+ years',
    salary_range: '$80,000 - $120,000',
    description: 'We are looking for an experienced software engineer to join our dynamic team and work on cutting-edge projects. You will be responsible for designing and developing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.',
    requirements: [
      { requirement: 'Bachelor\'s degree in Computer Science or related field' },
      { requirement: '5+ years of software development experience' },
      { requirement: 'Proficiency in React, Node.js, and modern web technologies' },
      { requirement: 'Strong problem-solving and communication skills' },
      { requirement: 'Experience with cloud platforms (AWS, Azure)' },
      { requirement: 'Knowledge of database systems (SQL and NoSQL)' },
      { requirement: 'Experience with version control systems (Git)' },
      { requirement: 'Understanding of software development best practices' }
    ],
    responsibilities: [
      { responsibility: 'Design and develop scalable web applications' },
      { responsibility: 'Collaborate with cross-functional teams' },
      { responsibility: 'Mentor junior developers' },
      { responsibility: 'Participate in code reviews and technical discussions' },
      { responsibility: 'Stay up-to-date with emerging technologies' },
      { responsibility: 'Write clean, maintainable, and well-documented code' },
      { responsibility: 'Troubleshoot and debug applications' },
      { responsibility: 'Contribute to architectural decisions' }
    ],
    posted_at: '2024-03-15T10:00:00Z',
    application_deadline: '2024-04-15T23:59:59Z',
    is_active: true
  };

  const displayJob = job || fallbackJob;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading job details...', 'جارٍ تحميل تفاصيل الوظيفة...')}</p>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{tr('Job Not Found', 'الوظيفة غير موجودة')}</h1>
          <p className="text-blue-200 mb-8">{error}</p>
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {tr('Back to Job Openings', 'العودة إلى الوظائف')}
          </Link>
        </div>
      </div>
    );
  }

  const deadline = (displayJob as any).application_deadline ? new Date((displayJob as any).application_deadline) : null;
  const isDeadlinePassed = deadline ? deadline < new Date() : false;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors duration-200 animate-slide-in"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {tr('Back to Job Openings', 'العودة إلى الوظائف')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="glass-effect-strong rounded-2xl p-8 animate-slide-in">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                  {tt(displayJob.department)}
                </span>
                <span className="bg-green-500/30 text-green-200 px-3 py-1 rounded-full text-sm">
                  {tt(displayJob.job_type)}
                </span>
                {!isDeadlinePassed && (
                  <span className="bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full text-sm">
                    {tr('Open for Applications', 'التقديم متاح')}
                  </span>
                )}
                {isDeadlinePassed && (
                  <span className="bg-red-500/30 text-red-200 px-3 py-1 rounded-full text-sm">
                    {tr('Application Deadline Passed', 'انتهى موعد التقديم')}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{displayJob.title}</h1>
              <p className="text-xl text-blue-100 leading-relaxed">{displayJob.description}</p>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-effect-strong rounded-xl p-6 animate-float">
                <h2 className="text-2xl font-bold text-white mb-6">{tr('Job Information', 'معلومات الوظيفة')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Location', 'الموقع')}</div>
                      <div className="font-medium text-white">{tt(displayJob.location)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Employment Type', 'نوع التوظيف')}</div>
                      <div className="font-medium text-white">{tt(displayJob.job_type)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Experience Required', 'الخبرة المطلوبة')}</div>
                      <div className="font-medium text-white">{tt(displayJob.experience_required)}</div>
                    </div>
                  </div>
                  {(displayJob as any).salary_range && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-300 mr-3" />
                      <div>
                        <div className="text-sm text-blue-200">{tr('Salary Range', 'نطاق الراتب')}</div>
                        <div className="font-medium text-white ltr">{(displayJob as any).salary_range}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-effect-strong rounded-xl p-6 animate-float" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold text-white mb-6">{tr('Timeline', 'الجدول الزمني')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Posted Date', 'تاريخ النشر')}</div>
                      <div className="font-medium text-white">
                        {fmtDate((displayJob as any).posted_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-300 mr-3" />
                    <div>
                      <div className="text-sm text-blue-200">{tr('Application Deadline', 'آخر موعد للتقديم')}</div>
                      <div className={`font-medium ${isDeadlinePassed ? 'text-red-300' : 'text-white'}`}>
                        {fmtDate((displayJob as any).application_deadline)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="glass-effect-strong rounded-xl p-8 animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Requirements', 'المتطلبات')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayJob.requirements.map((req, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">
                      {typeof req === 'string' ? req : req.requirement}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="glass-effect-strong rounded-xl p-8 animate-slide-in" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl font-bold text-white mb-6">{tr('Key Responsibilities', 'المهام الرئيسية')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayJob.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-start">
                    <ArrowRight className="h-5 w-5 text-blue-300 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">
                      {typeof resp === 'string' ? resp : resp.responsibility}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Now Card */}
            <div className="glass-effect-strong rounded-xl p-6 text-center animate-float">
              <h3 className="text-xl font-bold text-white mb-4">{tr('Ready to Apply?', 'هل أنت مستعد للتقديم؟')}</h3>
              <p className="text-blue-200 mb-6">
                {tr("Join our team and be part of something amazing. We're looking forward to hearing from you!", 'انضم إلى فريقنا وكن جزءاً من شيء مميز. نتطلع إلى التواصل معك!')}
              </p>
              
              {!isDeadlinePassed ? (
                <Link
                  to={`/apply/${displayJob.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center mb-4"
                >
                  {tr('Apply Now', 'قدّم الآن')}
                  <Users className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <div className="w-full bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold mb-4 cursor-not-allowed">
                  {tr('Application Deadline Passed', 'انتهى موعد التقديم')}
                </div>
              )}
              
              <p className="text-blue-300 text-sm">
                {tr('Application deadline:', 'آخر موعد للتقديم:')} {fmtDate((displayJob as any).application_deadline)}
              </p>
            </div>

            {/* Company Benefits */}
            <div className="glass-effect-strong rounded-xl p-6 animate-float" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-xl font-bold text-white mb-4">{tr('Why Join Future Vision Development?', 'لماذا تنضم إلى تطوير الرؤية المستقبلية؟')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Competitive salary & benefits', 'راتب ومزايا تنافسية')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Remote work flexibility', 'مرونة العمل عن بُعد')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Professional development', 'تطوير مهني مستمر')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Health & wellness programs', 'برامج الصحة والعافية')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Hands-on field experience across Oman', 'خبرة ميدانية عملية في أنحاء عُمان')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                  <span className="text-blue-200">{tr('Career growth opportunities', 'فرص للنمو الوظيفي')}</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="glass-effect-strong rounded-xl p-6 animate-float" style={{ animationDelay: '1s' }}>
              <h3 className="text-xl font-bold text-white mb-4">{tr('Questions?', 'لديك أسئلة؟')}</h3>
              <p className="text-blue-200 text-sm mb-4">
                {tr("Have questions about this position? We're here to help!", 'هل لديك استفسار حول هذه الوظيفة؟ نحن هنا لمساعدتك!')}
              </p>
              <Link
                to="/contact"
                className="w-full glass-effect hover:bg-blue-500/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm"
              >
                {tr('Contact HR Team', 'تواصل مع فريق الموارد البشرية')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
