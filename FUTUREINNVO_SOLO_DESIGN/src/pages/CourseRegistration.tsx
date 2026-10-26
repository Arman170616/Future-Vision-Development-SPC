import { useState, useEffect, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MessageSquare, Send, CheckCircle2, AlertCircle,
  BookOpen, GraduationCap, Clock, Calendar, MapPin, Users, ClipboardCheck, PhoneCall,
  BadgeCheck, Check, type LucideIcon,
} from 'lucide-react';
import { coursesApi, Course } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const MIN_REASON = 50;
const MAX_REASON = 500;

const emptyForm = (courseId?: string) => ({
  course: courseId ? parseInt(courseId) : 0,
  full_name: '',
  email: '',
  phone: '',
  interest_reason: '',
});

/** Labelled input with a leading icon and an inline error message. */
const Field = ({ label, icon: Icon, error, children }: { label: string; icon: LucideIcon; error?: string; children: ReactNode }) => (
  <label className="block">
    <span className="block text-sm font-semibold text-white mb-2">{label}</span>
    <span className="relative block">
      <Icon className="pointer-events-none absolute start-3.5 top-3.5 h-5 w-5 text-blue-300" />
      {children}
    </span>
    {error && (
      <span className="mt-1.5 flex items-center gap-1.5 text-sm text-red-300">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </span>
    )}
  </label>
);

const CourseRegistration = () => {
  const { tr, tt, fmtDate, fmtPrice } = useLanguage();
  const { courseId } = useParams<{ courseId: string }>();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // A course passed in the URL starts locked; "Change course" reopens the picker
  const [picking, setPicking] = useState(!courseId);

  const [formData, setFormData] = useState(emptyForm(courseId));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const coursesResponse = await coursesApi.getCourses();
        setCourses(coursesResponse.results);

        if (courseId && !coursesResponse.results.some(c => c.id === parseInt(courseId))) {
          setError(tr('Course not found', 'الدورة غير موجودة'));
          setPicking(true);
          setFormData(prev => ({ ...prev, course: 0 }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(tr('Failed to load course information', 'تعذّر تحميل معلومات الدورة'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selected = courses.find(c => c.id === Number(formData.course)) ?? null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const chooseCourse = (id: number) => {
    setFormData(prev => ({ ...prev, course: id }));
    setFormErrors(prev => ({ ...prev, course: '' }));
    setPicking(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = tr('Full name is required', 'الاسم الكامل مطلوب');
    }

    if (!formData.email.trim()) {
      errors.email = tr('Email is required', 'البريد الإلكتروني مطلوب');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = tr('Please enter a valid email address', 'يرجى إدخال بريد إلكتروني صحيح');
    }

    if (!formData.phone.trim()) {
      errors.phone = tr('Phone number is required', 'رقم الهاتف مطلوب');
    } else if (!/^\+?1?\d{9,15}$/.test(formData.phone.replace(/[\s-()]/g, ''))) {
      errors.phone = tr('Please enter a valid phone number', 'يرجى إدخال رقم هاتف صحيح');
    }

    if (!formData.course || formData.course === 0) {
      errors.course = tr('Please select a course', 'يرجى اختيار دورة');
    }

    if (!formData.interest_reason.trim()) {
      errors.interest_reason = tr('Please tell us why you are interested in this course', 'أخبرنا لماذا تهتم بهذه الدورة');
    } else if (formData.interest_reason.trim().length < MIN_REASON) {
      errors.interest_reason = tr('Please provide at least 50 characters explaining your interest', 'يرجى كتابة 50 حرفاً على الأقل لشرح اهتمامك');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await coursesApi.submitRegistration({ ...formData, course: Number(formData.course) });
      setSubmitted(true);
      setSubmitMessage(response.message);
      setFormData(prev => ({ ...emptyForm(), course: prev.course }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting registration:', err);
      if (err instanceof Error && err.message.includes('already registered')) {
        setFormErrors({ email: tr('You have already registered for this course with this email address', 'لقد سجّلت مسبقاً في هذه الدورة بهذا البريد الإلكتروني') });
      } else {
        setError(tr('Failed to submit registration. Please try again.', 'تعذّر إرسال التسجيل. يرجى المحاولة مرة أخرى.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full ps-11 pe-4 py-3 rounded-xl bg-blue-900/30 border text-white placeholder-blue-300 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-400 ${
      formErrors[field] ? 'border-red-400' : 'border-blue-400/30'
    }`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4 text-lg">{tr('Loading registration form...', 'جارٍ تحميل نموذج التسجيل...')}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="glass-effect-strong rounded-3xl p-8 md:p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-11 w-11 text-green-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{tr('Registration Submitted!', 'تم إرسال التسجيل!')}</h1>
          <p className="text-blue-200 mb-2">{tr(submitMessage, 'شكراً لك! تم استلام طلب تسجيلك وسنتواصل معك قريباً.')}</p>
          {selected && <p className="text-white font-semibold mb-8">{selected.name}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/courses" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
              {tr('Browse More Courses', 'تصفّح المزيد من الدورات')}
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubmitMessage('');
                setFormData(emptyForm());
                setPicking(true);
              }}
              className="inline-flex items-center justify-center gap-2 glass-effect text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/20"
            >
              {tr('Register for Another Course', 'التسجيل في دورة أخرى')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reasonLength = formData.interest_reason.trim().length;
  const steps = [
    { icon: ClipboardCheck, title: tr('Submit your application', 'أرسل طلبك'), text: tr('Fill in the form — it takes about two minutes.', 'املأ النموذج، ولن يستغرق ذلك أكثر من دقيقتين.') },
    { icon: PhoneCall, title: tr('We review and contact you', 'نراجع طلبك ونتواصل معك'), text: tr('Our team reviews your application and reaches out by email or phone.', 'يراجع فريقنا طلبك ويتواصل معك عبر البريد الإلكتروني أو الهاتف.') },
    { icon: BadgeCheck, title: tr('Confirm your seat', 'أكّد مقعدك'), text: tr('Once confirmed, you will receive the course schedule and details.', 'بعد التأكيد، ستصلك تفاصيل الدورة وجدولها.') },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          to={selected ? `/courses?course=${selected.slug}` : '/courses'}
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          {selected ? tr(`Back to ${selected.name}`, `العودة إلى ${selected.name}`) : tr('Back to Courses', 'العودة إلى الدورات')}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="eyebrow glass-effect mb-5">
            <GraduationCap className="h-4 w-4" />
            {tr('Registration', 'التسجيل')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {tr('Course ', 'التسجيل في ')}<span className="text-gradient">{tr('Registration', 'الدورة')}</span>
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            {selected
              ? tr(`Register for ${selected.name}`, `التسجيل في ${selected.name}`)
              : tr('Select and register for your desired course', 'اختر الدورة التي تريدها وسجّل فيها')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 glass-effect-strong rounded-3xl p-6 md:p-8 space-y-8">
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-center gap-2 text-red-200">
                <AlertCircle className="h-5 w-5 text-red-300 shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1 — course */}
            <section>
              <h2 className="flex items-center gap-3 text-lg font-bold text-white mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center ltr">1</span>
                {tr('Choose your course', 'اختر دورتك')}
              </h2>

              {!picking && selected ? (
                <div className="glass-effect rounded-2xl p-4 flex items-center gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-300" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-white">{selected.name}</span>
                    <span className="block text-sm text-blue-200 capitalize">
                      {tt(selected.level)} · {tt(selected.course_type)} · {tt(selected.duration)}
                    </span>
                  </span>
                  <button type="button" onClick={() => setPicking(true)} className="text-sm font-semibold text-blue-300 hover:text-blue-200 shrink-0">
                    {tr('Change', 'تغيير')}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label={tr('Courses', 'الدورات')}>
                  {courses.map(c => {
                    const active = Number(formData.course) === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => chooseCourse(c.id)}
                        className={`text-start rounded-2xl p-4 border transition-all ${
                          active
                            ? 'border-blue-400 bg-blue-500/20 shadow-lg'
                            : 'glass-effect hover:bg-blue-500/10'
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${active ? 'bg-blue-600 border-blue-600' : 'border-blue-400/40'}`}>
                            {active && <Check className="h-3.5 w-3.5 text-white" />}
                          </span>
                        </span>
                        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-200 capitalize">
                          <span>{tt(c.level)}</span>
                          <span>{tt(c.duration)}</span>
                          <span className="ltr font-semibold text-white">{fmtPrice(c.price)}</span>
                          {c.is_full && <span className="text-red-300">{tr('Waitlist', 'قائمة الانتظار')}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {formErrors.course && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.course}
                </p>
              )}
            </section>

            {/* Step 2 — details */}
            <section>
              <h2 className="flex items-center gap-3 text-lg font-bold text-white mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center ltr">2</span>
                {tr('Your details', 'بياناتك')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Field label={tr('Full Name *', 'الاسم الكامل *')} icon={User} error={formErrors.full_name}>
                    <input type="text" name="full_name" autoComplete="name" value={formData.full_name} onChange={handleInputChange}
                      className={inputClass('full_name')} placeholder={tr('Enter your full name', 'أدخل اسمك الكامل')} />
                  </Field>
                </div>
                <Field label={tr('Email Address *', 'البريد الإلكتروني *')} icon={Mail} error={formErrors.email}>
                  <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleInputChange}
                    className={inputClass('email')} placeholder={tr('Enter your email address', 'أدخل بريدك الإلكتروني')} />
                </Field>
                <Field label={tr('Phone Number *', 'رقم الهاتف *')} icon={Phone} error={formErrors.phone}>
                  <input type="tel" name="phone" autoComplete="tel" value={formData.phone} onChange={handleInputChange}
                    className={inputClass('phone')} placeholder={tr('e.g. +968 7111 1040', 'مثال: \u2066+968 7111 1040\u2069')} />
                </Field>
              </div>
            </section>

            {/* Step 3 — motivation */}
            <section>
              <h2 className="flex items-center gap-3 text-lg font-bold text-white mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center ltr">3</span>
                {tr('Why this course?', 'لماذا هذه الدورة؟')}
              </h2>
              <Field label={tr('Why are you interested in joining this course? *', 'لماذا ترغب في الانضمام إلى هذه الدورة؟ *')} icon={MessageSquare} error={formErrors.interest_reason}>
                <textarea
                  name="interest_reason"
                  value={formData.interest_reason}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={MAX_REASON}
                  className={`${inputClass('interest_reason')} resize-y`}
                  placeholder={tr('Tell us why you want to join this course, what you hope to learn, and how it fits your goals...', 'أخبرنا لماذا تريد الانضمام إلى هذه الدورة، وما الذي تأمل أن تتعلمه، وكيف تخدم أهدافك...')}
                />
              </Field>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-blue-900/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${reasonLength >= MIN_REASON ? 'bg-green-400' : 'bg-blue-400/60'}`}
                    style={{ width: `${Math.min(100, (reasonLength / MIN_REASON) * 100)}%` }}
                  />
                </div>
                <span className={`text-xs shrink-0 ltr ${reasonLength >= MIN_REASON ? 'text-green-300' : 'text-muted opacity-80'}`}>
                  {reasonLength >= MIN_REASON
                    ? tr(`${formData.interest_reason.length}/${MAX_REASON} ✓`, `${formData.interest_reason.length}/${MAX_REASON} ✓`)
                    : tr(`${MIN_REASON - reasonLength} more characters`, `${MIN_REASON - reasonLength} حرفاً متبقياً`)}
                </span>
              </div>
            </section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  {tr('Submitting Registration...', 'جارٍ إرسال التسجيل...')}
                </>
              ) : (
                <>
                  {selected?.is_full ? tr('Join the Waitlist', 'الانضمام إلى قائمة الانتظار') : tr('Submit Registration', 'إرسال التسجيل')}
                  <Send className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="glass-effect-strong rounded-3xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-4">{tr('Course summary', 'ملخص الدورة')}</h3>
              {selected ? (
                <>
                  <h4 className="text-xl font-bold text-white mb-1">{selected.name}</h4>
                  <p className="text-sm text-blue-200 mb-5">{tr('by', 'تقديم')} {selected.instructor}</p>
                  <dl className="space-y-3 text-sm">
                    {[
                      { icon: Clock, label: tr('Duration', 'المدة'), value: tt(selected.duration) },
                      { icon: MapPin, label: tr('Format', 'نمط الدراسة'), value: tt(selected.course_type) },
                      { icon: Calendar, label: tr('Starts', 'تاريخ البدء'), value: selected.start_date ? fmtDate(selected.start_date) : '—' },
                      { icon: Users, label: tr('Spots Left', 'المقاعد المتبقية'), value: String(selected.spots_remaining) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-blue-300 shrink-0" />
                        <dt className="text-blue-200">{label}</dt>
                        <dd className="ms-auto font-semibold text-white capitalize">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 pt-5 border-t border-blue-400/20 flex items-baseline justify-between">
                    <span className="text-blue-200 text-sm">{tr('Price', 'السعر')}</span>
                    <span className="text-2xl font-bold text-white ltr">{fmtPrice(selected.price)}</span>
                  </div>
                  {selected.is_full && (
                    <p className="mt-4 text-sm text-red-300">{tr('This course is full — you will be added to the waitlist.', 'هذه الدورة مكتملة، وستتم إضافتك إلى قائمة الانتظار.')}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-blue-200">{tr('Choose a course to see its details here.', 'اختر دورة لعرض تفاصيلها هنا.')}</p>
              )}
            </div>

            <div className="glass-effect-strong rounded-3xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300 mb-5">{tr('What happens next', 'الخطوات التالية')}</h3>
              <ol className="space-y-5">
                {steps.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3">
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-300" />
                    </span>
                    <span>
                      <span className="block font-semibold text-white text-sm">{title}</span>
                      <span className="block text-xs text-blue-200 leading-relaxed mt-0.5">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseRegistration;
