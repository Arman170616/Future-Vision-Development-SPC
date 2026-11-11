import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, FileText, Upload, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { careersApi, JobOpening, JobApplication } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const JobApplicationPage = () => {
  const { tr, tt } = useLanguage();
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience_level: '',
    cover_letter: '',
    resume_file: null as File | null
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = tr('Full name is required', 'الاسم الكامل مطلوب');
    }

    if (!formData.email.trim()) {
      errors.email = tr('Email is required', 'البريد الإلكتروني مطلوب');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = tr('Please enter a valid email address', 'يرجى إدخال بريد إلكتروني صحيح');
    }

    if (!formData.phone.trim()) {
      errors.phone = tr('Phone number is required', 'رقم الهاتف مطلوب');
    }

    if (!formData.experience_level) {
      errors.experience_level = tr('Please select your experience level', 'يرجى اختيار مستوى خبرتك');
    }

    if (!formData.cover_letter.trim()) {
      errors.cover_letter = tr('Cover letter is required', 'خطاب التقديم مطلوب');
    } else if (formData.cover_letter.trim().length < 100) {
      errors.cover_letter = tr('Cover letter should be at least 100 characters', 'يجب ألا يقل خطاب التقديم عن 100 حرف');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !job) return;

    try {
      setSubmitting(true);
      
      const applicationData: Omit<JobApplication, 'id' | 'job_title' | 'applied_at'> = {
        job: job.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experience_level: formData.experience_level,
        cover_letter: formData.cover_letter,
      };

      await careersApi.submitApplication(applicationData);
      setSubmitted(true);
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/jobs');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(tr('Failed to submit application. Please try again.', 'تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, resume_file: file }));
  };

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
          <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="glass-effect-strong rounded-2xl p-8">
            <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">{tr('Application Submitted!', 'تم إرسال الطلب!')}</h1>
            <p className="text-blue-200 mb-6">
              {tr(`Thank you for your interest in the ${job?.title} position. We'll review your application and get back to you soon.`, `شكراً لاهتمامك بوظيفة ${job?.title}. سنراجع طلبك ونتواصل معك قريباً.`)}
            </p>
            <p className="text-blue-300 text-sm">
              {tr('Redirecting to job openings in a few seconds...', 'سيتم تحويلك إلى صفحة الوظائف خلال ثوانٍ...')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors duration-200 animate-slide-in"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {tr('Back to Job Openings', 'العودة إلى الوظائف')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect-strong rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4">{tr('Position Details', 'تفاصيل الوظيفة')}</h2>
              
              {job && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-blue-300">{job.title}</h3>
                    <p className="text-blue-200 text-sm">{tt(job.department)}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-200">{tr('Location:', 'الموقع:')}</span>
                      <span className="text-white">{tt(job.location)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">{tr('Type:', 'النوع:')}</span>
                      <span className="text-white">{tt(job.job_type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">{tr('Experience:', 'الخبرة:')}</span>
                      <span className="text-white">{tt(job.experience_required)}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex justify-between">
                        <span className="text-blue-200">{tr('Salary:', 'الراتب:')}</span>
                        <span className="text-white ltr">{job.salary_range}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-blue-400/30">
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="glass-effect-strong rounded-xl p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{tr('Apply for this Position', 'قدّم على هذه الوظيفة')}</h1>
                <p className="text-blue-200">
                  {tr('Fill out the form below to submit your application. All fields marked with * are required.', 'املأ النموذج أدناه لإرسال طلبك. جميع الحقول المميزة بـ * مطلوبة.')}
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-300 mr-2" />
                    <span className="text-red-200">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      {tr('Full Name *', 'الاسم الكامل *')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-blue-900/30 border rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                        formErrors.name ? 'border-red-400' : 'border-blue-400/30'
                      }`}
                      placeholder={tr('Enter your full name', 'أدخل اسمك الكامل')}
                    />
                    {formErrors.name && (
                      <p className="text-red-300 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      {tr('Email Address *', 'البريد الإلكتروني *')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-blue-900/30 border rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                        formErrors.email ? 'border-red-400' : 'border-blue-400/30'
                      }`}
                      placeholder={tr('Enter your email address', 'أدخل بريدك الإلكتروني')}
                    />
                    {formErrors.email && (
                      <p className="text-red-300 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {tr('Phone Number *', 'رقم الهاتف *')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-blue-900/30 border rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                        formErrors.phone ? 'border-red-400' : 'border-blue-400/30'
                      }`}
                      placeholder={tr('Enter your phone number', 'أدخل رقم هاتفك')}
                    />
                    {formErrors.phone && (
                      <p className="text-red-300 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      {tr('Experience Level *', 'مستوى الخبرة *')}
                    </label>
                    <select
                      name="experience_level"
                      value={formData.experience_level}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-blue-900/30 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none ${
                        formErrors.experience_level ? 'border-red-400' : 'border-blue-400/30'
                      }`}
                    >
                      <option value="" className="bg-blue-900">{tr('Select experience level', 'اختر مستوى الخبرة')}</option>
                      <option value="0-1" className="bg-blue-900">{tr('0-1 years', '0-1 سنة')}</option>
                      <option value="2-3" className="bg-blue-900">{tr('2-3 years', '2-3 سنوات')}</option>
                      <option value="4-5" className="bg-blue-900">{tr('4-5 years', '4-5 سنوات')}</option>
                      <option value="6-10" className="bg-blue-900">{tr('6-10 years', '6-10 سنوات')}</option>
                      <option value="10+" className="bg-blue-900">{tr('10+ years', 'أكثر من 10 سنوات')}</option>
                    </select>
                    {formErrors.experience_level && (
                      <p className="text-red-300 text-sm mt-1">{formErrors.experience_level}</p>
                    )}
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    {tr('Resume/CV', 'السيرة الذاتية')}
                  </label>
                  <div className="border-2 border-dashed border-blue-400/30 rounded-lg p-6 text-center hover:border-blue-400/50 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                      <p className="text-blue-200">
                        {formData.resume_file ? formData.resume_file.name : tr('Click to upload your resume', 'انقر لرفع سيرتك الذاتية')}
                      </p>
                      <p className="text-blue-300 text-sm mt-1">{tr('PDF, DOC, or DOCX (Max 5MB)', 'PDF أو DOC أو DOCX (بحد أقصى 5 ميجابايت)')}</p>
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    {tr('Cover Letter *', 'خطاب التقديم *')}
                  </label>
                  <textarea
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                    rows={6}
                    className={`w-full px-4 py-3 bg-blue-900/30 border rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-vertical ${
                      formErrors.cover_letter ? 'border-red-400' : 'border-blue-400/30'
                    }`}
                    placeholder={tr("Tell us why you're interested in this position and what makes you a great fit...", 'أخبرنا لماذا تهتم بهذه الوظيفة وما الذي يجعلك مناسباً لها...')}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {formErrors.cover_letter && (
                      <p className="text-red-300 text-sm">{formErrors.cover_letter}</p>
                    )}
                    <p className="text-blue-300 text-sm ml-auto">
                      {tr(`${formData.cover_letter.length}/1000 characters`, `${formData.cover_letter.length}/1000 حرف`)}
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {tr('Submitting Application...', 'جارٍ إرسال الطلب...')}
                      </>
                    ) : (
                      <>
                        {tr('Submit Application', 'إرسال الطلب')}
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
