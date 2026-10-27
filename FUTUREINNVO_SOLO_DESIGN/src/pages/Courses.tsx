import { useState, useEffect, useRef, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Clock, Search, Star, Award, Calendar, ChevronDown, GraduationCap,
  CheckCircle2, ListChecks, FileText, Eye, ExternalLink, Heart, Send, X, MapPin, ArrowRight,
} from 'lucide-react';
import { coursesApi, Course, CourseAttachment, mediaUrl } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const FOLD = 14; // size of the turned-down page corner, px

/** The course's material as a small book in the card corner: its first image as the cover, otherwise a document page. */
const BookCover = ({ course, moreLabel }: { course: Course; moreLabel: (n: number) => string }) => {
  const attachments = course.attachments ?? [];
  const cover = attachments.find(a => a.is_image);
  const doc = attachments.find(a => !a.is_image);
  if (!cover && !doc) return null;
  const ext = (doc?.name.split('.').pop() ?? '').toUpperCase().slice(0, 4) || 'FILE';
  const more = attachments.length - 1;

  return (
    <span
      aria-hidden
      className="relative shrink-0 w-12 h-16 sm:w-[66px] sm:h-[88px] md:w-[74px] md:h-[98px] rotate-3 transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:-translate-y-1 group-hover:scale-105"
    >
      {/* page edges behind the cover */}
      <span className="absolute inset-0 translate-x-[6px] translate-y-[4px] rounded-e-md rounded-s-sm bg-white/60 shadow-sm ring-1 ring-black/5" />
      <span className="absolute inset-0 translate-x-[3px] translate-y-[2px] rounded-e-md rounded-s-sm bg-white/85 ring-1 ring-black/5" />
      <span
        className="absolute inset-0 overflow-hidden rounded-e-md rounded-s-sm bg-white shadow-[0_10px_22px_-8px_rgba(0,0,0,0.45)]"
        style={{ clipPath: `polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%)` }}
      >
        {cover ? (
          <img src={mediaUrl(cover.url)} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col gap-[5px] bg-gradient-to-b from-white to-stone-100 px-2.5 pt-4">
            {[90, 70, 85, 60, 75].map((w, i) => <span key={i} className="h-[3px] rounded-full bg-stone-300/80" style={{ width: `${w}%` }} />)}
            <span className="mt-auto mb-2 self-start rounded bg-red-500 px-1 py-px text-[9px] font-bold tracking-wide text-white">{ext}</span>
          </span>
        )}
        {/* spine */}
        <span className="absolute inset-y-0 start-0 w-[6px] bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
      </span>
      {/* turned-down corner */}
      <span
        className="absolute end-0 top-0 rounded-es-sm shadow-[-2px_2px_3px_rgba(0,0,0,0.25)]"
        style={{ width: FOLD, height: FOLD, background: 'linear-gradient(225deg, transparent 50%, #f5efe9 50%, #e2d8cf 100%)' }}
      />
      {more > 0 && (
        <span className="absolute -bottom-2 -end-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white shadow ltr">
          {moreLabel(more)}
        </span>
      )}
    </span>
  );
};

const OFFICE_EXTENSIONS = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

/** In-page reader URL: PDFs in the browser's viewer (no toolbar), Office files in Microsoft's online viewer. */
const readerUrl = (doc: CourseAttachment) => {
  const url = mediaUrl(doc.url);
  const ext = (doc.name.split('.').pop() ?? '').toLowerCase();
  if (OFFICE_EXTENSIONS.includes(ext)) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  // Phones without a built-in PDF viewer (e.g. Android Chrome) would only offer a download
  const nav = navigator as Navigator & { pdfViewerEnabled?: boolean };
  if (nav.pdfViewerEnabled === false) return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`;
  return `${url}#toolbar=0&navpanes=0&view=FitH`;
};

/** Split admin-entered multi-line text into clean list items ("- item", "• item", "1. item"). */
const toLines = (text?: string) =>
  (text ?? '')
    .split('\n')
    .map(line => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);

const levelColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

/** Group curriculum lines under "Week 1: …" / "Module 2 …" style headings when the admin text uses them. */
const toSections = (lines: string[]) => {
  const heading = /^(week|module|unit|day|part|phase|session)\s*\d+/i;
  if (!lines.some(line => heading.test(line))) return null;
  const sections: { title: string; items: string[] }[] = [];
  lines.forEach(line => {
    if (heading.test(line) || sections.length === 0) sections.push({ title: line, items: [] });
    else sections[sections.length - 1].items.push(line);
  });
  return sections;
};

type InterestState = { open: boolean; sending: boolean; done: boolean; error: string };

const Courses = () => {
  const { tr, tt, fmtDate, fmtPrice } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);

  // The open course lives in the URL (?course=slug) so a course can be linked to directly
  const openSlug = searchParams.get('course');
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const [lightbox, setLightbox] = useState<CourseAttachment | null>(null);
  const [reader, setReader] = useState<CourseAttachment | null>(null);
  const [interest, setInterest] = useState<Record<number, InterestState>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getCourses();
        setCourses(response.results);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Bring a deep-linked course into view once the list has rendered
  useEffect(() => {
    if (!loading && openSlug) {
      itemRefs.current[openSlug]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lightbox && !reader) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setLightbox(null);
      setReader(null);
    };
    const overflow = document.body.style.overflow;
    if (reader) document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [lightbox, reader]);

  const toggle = (slug: string) => {
    setSearchParams(openSlug === slug ? {} : { course: slug }, { replace: true });
  };

  const filteredCourses = courses.filter(course => {
    const q = searchTerm.toLowerCase();
    if (q && ![course.name, course.instructor, course.short_description].some(v => v?.toLowerCase().includes(q))) return false;
    if (levelFilter && course.level !== levelFilter) return false;
    if (typeFilter && course.course_type !== typeFilter) return false;
    if (showFeatured && !course.is_featured) return false;
    return true;
  });

  const interestOf = (id: number): InterestState => interest[id] ?? { open: false, sending: false, done: false, error: '' };
  const setInterestOf = (id: number, patch: Partial<InterestState>) =>
    setInterest(prev => ({ ...prev, [id]: { ...(prev[id] ?? { open: false, sending: false, done: false, error: '' }), ...patch } }));

  const submitInterest = async (e: FormEvent<HTMLFormElement>, course: Course) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setInterestOf(course.id, { sending: true, error: '' });
    try {
      await coursesApi.submitInterest({
        course: course.id,
        full_name: String(form.get('full_name') || '').trim(),
        email: String(form.get('email') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        message: String(form.get('message') || '').trim(),
      });
      setInterestOf(course.id, { sending: false, done: true });
    } catch {
      setInterestOf(course.id, {
        sending: false,
        error: tr('Could not send your request. Please check your details and try again.', 'تعذّر إرسال طلبك. يرجى التحقق من بياناتك والمحاولة مرة أخرى.'),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4 text-lg">{tr('Loading courses...', 'جارٍ تحميل الدورات...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="glass-effect-strong rounded-xl p-8">
            <BookOpen className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">{tr('Unable to Load Courses', 'تعذّر تحميل الدورات')}</h1>
            <p className="text-blue-200 mb-6">{tr(error, 'تعذّر تحميل الدورات. يرجى المحاولة مرة أخرى لاحقاً.')}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {tr('Try Again', 'حاول مرة أخرى')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="eyebrow glass-effect mb-6 animate-slide-in">
            <GraduationCap className="h-4 w-4" />
            {tr('Training', 'التدريب')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-in">
            {tr('Our ', '')}<span className="text-gradient">{tr('Training Courses', 'دوراتنا التدريبية')}</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-6 max-w-3xl mx-auto leading-relaxed">
            {tr('Advance your skills with our comprehensive courses designed by industry experts. From beginners to advanced professionals, we have something for everyone.', 'طوّر مهاراتك عبر دورات شاملة صمّمها خبراء القطاع. من المبتدئين إلى المحترفين المتقدمين، لدينا ما يناسب الجميع.')}
          </p>
          <div className="inline-flex items-center gap-2 text-blue-200">
            <Award className="h-5 w-5 text-blue-300" />
            {tr('Professional Certification Available', 'شهادات احترافية معتمدة')}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="glass-effect-strong rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 h-5 w-5" />
            <input
              type="text"
              placeholder={tr('Search courses, instructors...', 'ابحث عن دورة أو مدرّب...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">{tr('All Levels', 'جميع المستويات')}</option>
              <option value="beginner">{tr('Beginner', 'مبتدئ')}</option>
              <option value="intermediate">{tr('Intermediate', 'متوسط')}</option>
              <option value="advanced">{tr('Advanced', 'متقدم')}</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">{tr('All Types', 'جميع الأنواع')}</option>
              <option value="online">{tr('Online', 'عن بُعد')}</option>
              <option value="offline">{tr('Offline', 'حضوري')}</option>
              <option value="hybrid">{tr('Hybrid', 'مدمج')}</option>
            </select>
            <label className="flex items-center gap-2 text-white cursor-pointer px-2">
              <input type="checkbox" checked={showFeatured} onChange={e => setShowFeatured(e.target.checked)} />
              <Star className="h-4 w-4 text-yellow-400" />
              {tr('Featured Only', 'المميزة فقط')}
            </label>
          </div>
        </div>
      </section>

      {/* Courses — expand / collapse list */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{tr('No Courses Found', 'لا توجد دورات')}</h3>
            <p className="text-blue-200">{tr('Try adjusting your search or filter criteria.', 'جرّب تعديل البحث أو معايير التصفية.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map(course => {
              const open = openSlug === course.slug;
              const outcomes = toLines(course.learning_outcomes);
              const curriculum = toLines(course.curriculum);
              const sections = toSections(curriculum);
              const prerequisites = toLines(course.prerequisites);
              const attachments = course.attachments ?? [];
              const images = attachments.filter(a => a.is_image);
              const documents = attachments.filter(a => !a.is_image);
              const state = interestOf(course.id);
              const panelId = `course-panel-${course.id}`;

              return (
                <article
                  key={course.id}
                  ref={el => { itemRefs.current[course.slug] = el; }}
                  className={`glass-effect-strong rounded-2xl overflow-hidden scroll-mt-28 transition-shadow ${open ? 'shadow-2xl' : ''}`}
                >
                  {/* Header (always visible) */}
                  <button
                    type="button"
                    onClick={() => toggle(course.slug)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="group w-full text-start p-5 md:p-6 flex items-center gap-4 hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl items-center justify-center bg-blue-500/20">
                      <GraduationCap className="h-7 w-7 text-blue-300" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-lg md:text-xl font-bold text-white">{course.name}</span>
                        {course.is_featured && (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <Star className="h-3 w-3" />
                            {tr('Featured', 'مميزة')}
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-blue-200 mb-3">
                        {tr('by', 'تقديم')} {course.instructor}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-blue-200">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${levelColor[course.level] ?? 'bg-gray-100 text-gray-800'}`}>
                          {tt(course.level)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 capitalize"><MapPin className="h-4 w-4" />{tt(course.course_type)}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{tt(course.duration)}</span>
                        {course.start_date && (
                          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{fmtDate(course.start_date)}</span>
                        )}
                      </span>
                    </span>
                    <BookCover course={course} moreLabel={n => `+${n}`} />
                    <span className="hidden md:block text-xl font-bold text-white ltr shrink-0">{fmtPrice(course.price)}</span>
                    <ChevronDown className={`h-6 w-6 shrink-0 text-blue-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Details (expand / collapse) */}
                  <div
                    id={panelId}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden" {...(!open && { inert: '' })}>
                      <div className="border-t border-blue-400/20 p-5 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                          {/* Course details */}
                          <div className={attachments.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
                            <p className="text-blue-100 leading-relaxed mb-6 whitespace-pre-line">{course.description || course.short_description}</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                              {[
                                { icon: Clock, label: tr('Duration', 'المدة'), value: tt(course.duration) },
                                { icon: Calendar, label: tr('Starts', 'تاريخ البدء'), value: course.start_date ? fmtDate(course.start_date) : '—' },
                                { icon: MapPin, label: tr('Format', 'نمط الدراسة'), value: tt(course.course_type) },
                              ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-blue-800/30 rounded-xl p-3 text-center">
                                  <Icon className="h-5 w-5 text-blue-300 mx-auto mb-1" />
                                  <div className="text-white font-semibold text-sm capitalize">{value}</div>
                                  <div className="text-blue-200 text-xs">{label}</div>
                                </div>
                              ))}
                            </div>

                            {outcomes.length > 0 && (
                              <div className="mb-6">
                                <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                                  <Award className="h-5 w-5 text-blue-300" />
                                  {tr("What You'll Learn", 'ماذا ستتعلم')}
                                </h4>
                                <ul className="grid sm:grid-cols-2 gap-2">
                                  {outcomes.map(item => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-blue-100">
                                      <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0 mt-0.5" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {curriculum.length > 0 && (
                              <div className="mb-6">
                                <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                                  <ListChecks className="h-5 w-5 text-blue-300" />
                                  {tr('Course Curriculum', 'محتوى الدورة')}
                                </h4>
                                {sections ? (
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {sections.map((section, index) => (
                                      <div key={section.title} className="bg-blue-800/30 rounded-xl p-4">
                                        <div className="flex items-start gap-2 font-semibold text-white text-sm mb-2">
                                          <span className="w-6 h-6 shrink-0 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center ltr">
                                            {index + 1}
                                          </span>
                                          <span className="pt-0.5">{section.title}</span>
                                        </div>
                                        <ul className="space-y-1 ps-8">
                                          {section.items.map(item => (
                                            <li key={item} className="text-sm text-blue-100 list-disc">{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                <ol className="grid sm:grid-cols-2 gap-2">
                                  {curriculum.map((item, index) => (
                                    <li key={item} className="flex items-start gap-3 text-sm text-blue-100">
                                      <span className="w-6 h-6 shrink-0 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center ltr">
                                        {index + 1}
                                      </span>
                                      <span className="pt-0.5">{item}</span>
                                    </li>
                                  ))}
                                </ol>
                                )}
                              </div>
                            )}

                            {prerequisites.length > 0 && (
                              <div>
                                <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                                  <CheckCircle2 className="h-5 w-5 text-blue-300" />
                                  {tr('Prerequisites', 'المتطلبات المسبقة')}
                                </h4>
                                <ul className="space-y-1.5">
                                  {prerequisites.map(item => (
                                    <li key={item} className="text-sm text-blue-100">• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Course files beside the details */}
                          {attachments.length > 0 && (
                            <aside className="lg:col-span-2 space-y-4 lg:sticky lg:top-28 self-start">
                              {images.map(image => (
                                <figure key={image.id} className="glass-effect rounded-2xl overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setLightbox(image)}
                                    className="block w-full bg-white"
                                    aria-label={tr(`Enlarge ${image.title || image.name}`, `تكبير ${image.title || image.name}`)}
                                  >
                                    <img src={mediaUrl(image.url)} alt={image.title || course.name} loading="lazy" className="w-full max-h-80 object-contain" />
                                  </button>
                                  {image.title && <figcaption className="px-4 py-2.5 text-sm text-blue-100">{image.title}</figcaption>}
                                </figure>
                              ))}
                              {documents.map(doc => (
                                <button
                                  type="button"
                                  key={doc.id}
                                  onClick={() => setReader(doc)}
                                  className="group w-full text-start glass-effect rounded-2xl p-4 flex items-center gap-3 hover:bg-blue-500/10 transition-colors"
                                >
                                  <span className="w-11 h-11 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-300" />
                                  </span>
                                  <span className="flex-1 min-w-0">
                                    <span className="block font-medium text-white truncate">{doc.title || doc.name}</span>
                                    <span className="block text-xs text-blue-200 uppercase ltr">{doc.name.split('.').pop()}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-blue-500/20 px-3 py-1.5 text-sm font-semibold text-blue-300 transition-transform group-hover:scale-105">
                                    <Eye className="h-4 w-4" />
                                    {tr('Read', 'قراءة')}
                                  </span>
                                </button>
                              ))}
                            </aside>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-blue-400/20 flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:me-auto">
                            <div className="text-2xl font-bold text-white ltr">{fmtPrice(course.price)}</div>
                            {course.is_full && (
                              <div className="text-sm text-red-300">{tr('Course is full — join the waitlist', 'الدورة مكتملة — انضم إلى قائمة الانتظار')}</div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setInterestOf(course.id, { open: !state.open })}
                            className="inline-flex items-center justify-center gap-2 glass-effect text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/20"
                            aria-expanded={state.open}
                          >
                            <Heart className="h-5 w-5 text-blue-300" />
                            {tr("I'm Interested", 'أنا مهتم')}
                          </button>
                          <Link
                            to={`/register/${course.id}`}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                          >
                            {course.is_full ? tr('Join Waitlist', 'قائمة الانتظار') : tr('Register Now', 'سجّل الآن')}
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        </div>

                        {/* "I'm interested" quick form */}
                        {state.open && (
                          <div className="mt-5 glass-effect rounded-2xl p-5">
                            {state.done ? (
                              <div className="flex items-center gap-3 text-green-200">
                                <CheckCircle2 className="h-6 w-6 text-green-300 shrink-0" />
                                {tr('Thank you! Our team will contact you about this course soon.', 'شكراً لك! سيتواصل معك فريقنا قريباً بخصوص هذه الدورة.')}
                              </div>
                            ) : (
                              <form onSubmit={e => submitInterest(e, course)} className="space-y-3">
                                <p className="text-sm text-blue-200">
                                  {tr('Leave your details and we will send you more information about this course.', 'اترك بياناتك وسنرسل لك مزيداً من المعلومات حول هذه الدورة.')}
                                </p>
                                <div className="grid sm:grid-cols-3 gap-3">
                                  <input name="full_name" required maxLength={100} placeholder={tr('Full name *', 'الاسم الكامل *')} className={inputClass} />
                                  <input name="email" type="email" required placeholder={tr('Email *', 'البريد الإلكتروني *')} className={inputClass} />
                                  <input name="phone" type="tel" maxLength={20} placeholder={tr('Phone (optional)', 'الهاتف (اختياري)')} className={inputClass} />
                                </div>
                                <textarea name="message" rows={2} placeholder={tr('Message (optional)', 'رسالة (اختياري)')} className={inputClass} />
                                {state.error && <p className="text-sm text-red-300">{state.error}</p>}
                                <div className="flex justify-end">
                                  <button
                                    type="submit"
                                    disabled={state.sending}
                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-semibold"
                                  >
                                    {state.sending ? tr('Sending...', 'جارٍ الإرسال...') : tr('Send', 'إرسال')}
                                    <Send className="h-4 w-4" />
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="glass-effect-strong rounded-2xl p-10 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{tr('Ready to Start Learning?', 'هل أنت مستعد لبدء التعلّم؟')}</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            {tr('Join thousands of students who have advanced their careers with our expert-led courses. Get personalized support and hands-on experience.', 'انضم إلى آلاف الطلاب الذين طوّروا مسيرتهم المهنية عبر دوراتنا التي يقدّمها الخبراء، واحصل على دعم شخصي وخبرة عملية.')}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            {tr('Register for a Course', 'سجّل في دورة')}
          </Link>
        </div>
      </section>

      {/* Document reader */}
      {reader && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6" onClick={() => setReader(null)} role="dialog" aria-modal="true" aria-label={reader.title || reader.name}>
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <span className="w-9 h-9 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center"><FileText className="h-5 w-5 text-red-500" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-gray-900">{reader.title || reader.name}</span>
                <span className="block text-xs uppercase text-gray-500 ltr">{reader.name.split('.').pop()}</span>
              </span>
              <a
                href={mediaUrl(reader.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                <ExternalLink className="h-4 w-4" /> {tr('Full screen', 'ملء الشاشة')}
              </a>
              <button type="button" onClick={() => setReader(null)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-200" aria-label={tr('Close', 'إغلاق')}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe key={reader.id} src={readerUrl(reader)} title={reader.title || reader.name} className="h-full w-full flex-1 bg-gray-100" />
          </div>
        </div>
      )}

      {/* Image lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 end-4 bg-black/50 rounded-full p-2 on-media"
            aria-label={tr('Close', 'إغلاق')}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={mediaUrl(lightbox.url)}
            alt={lightbox.title || lightbox.name}
            className="max-w-full max-h-[85vh] rounded-xl bg-white"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Courses;
