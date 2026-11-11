/**
 * Arabic labels for enum-like values that arrive from the API in English
 * (course levels, job types, statuses, categories …). Unknown values fall
 * back to the original text, so new backend values never break the page.
 */
const terms: Record<string, string> = {
  // levels
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  expert: 'خبير',
  'all levels': 'جميع المستويات',

  // course / delivery types
  online: 'عن بُعد',
  offline: 'حضوري',
  'in-person': 'حضوري',
  in_person: 'حضوري',
  hybrid: 'مدمج',
  workshop: 'ورشة عمل',
  bootcamp: 'معسكر تدريبي',
  certification: 'شهادة احترافية',
  course: 'دورة',

  // job types
  'full-time': 'دوام كامل',
  full_time: 'دوام كامل',
  'full time': 'دوام كامل',
  'part-time': 'دوام جزئي',
  part_time: 'دوام جزئي',
  'part time': 'دوام جزئي',
  contract: 'عقد',
  internship: 'تدريب',
  remote: 'عن بُعد',
  freelance: 'عمل حر',
  temporary: 'مؤقت',
  entry: 'مبتدئ',
  junior: 'مبتدئ',
  mid: 'متوسط',
  senior: 'خبير',
  lead: 'قائد فريق',

  // statuses
  active: 'نشط',
  completed: 'مكتمل',
  ongoing: 'قيد التنفيذ',
  'in progress': 'قيد التنفيذ',
  in_progress: 'قيد التنفيذ',
  planning: 'قيد التخطيط',
  planned: 'مخطط',
  upcoming: 'قادم',
  open: 'مفتوح',
  closed: 'مغلق',
  draft: 'مسودة',
  published: 'منشور',
  featured: 'مميز',
  pending: 'قيد المراجعة',

  // common categories
  all: 'الكل',
  technology: 'التقنية',
  'artificial intelligence': 'الذكاء الاصطناعي',
  ai: 'الذكاء الاصطناعي',
  'web development': 'تطوير الويب',
  'mobile development': 'تطوير التطبيقات',
  'data science': 'علم البيانات',
  design: 'التصميم',
  marketing: 'التسويق',
  business: 'الأعمال',
  engineering: 'الهندسة',
  development: 'التطوير',
  innovation: 'الابتكار',
  research: 'البحث',
  events: 'الفعاليات',
  event: 'فعالية',
  training: 'التدريب',
  conference: 'مؤتمر',
  seminar: 'ندوة',
  meetup: 'لقاء',
  hackathon: 'هاكاثون',
  webinar: 'ندوة إلكترونية',
  team: 'الفريق',
  office: 'المكتب',
  projects: 'المشاريع',
  management: 'الإدارة',
  operations: 'العمليات',
  sales: 'المبيعات',
  'human resources': 'الموارد البشرية',
  hr: 'الموارد البشرية',
  finance: 'المالية',
  leadership: 'القيادة',
  security: 'الأمن السيبراني',
  product: 'المنتجات',
  analytics: 'التحليلات',
  education: 'التعليم',
  sustainability: 'الاستدامة',
  'community outreach': 'خدمة المجتمع',
  community: 'المجتمع',
  competition: 'مسابقة',
  facility: 'منشأة',
  networking: 'تواصل مهني',
  privacy: 'الخصوصية',
  photo: 'صورة',
  video: 'فيديو',
  web: 'الويب',
  mobile: 'الجوال',
  iot: 'إنترنت الأشياء',
  data: 'البيانات',
  'digital transformation': 'التحول الرقمي',
  'ai & iot solutions': 'حلول الذكاء الاصطناعي وإنترنت الأشياء',
  'ai & mobile solutions': 'حلول الذكاء الاصطناعي والجوال',
  'salalah, oman': 'صلالة، سلطنة عُمان',
  'muscat, oman': 'مسقط، سلطنة عُمان',
  salalah: 'صلالة',
  muscat: 'مسقط',
  oman: 'سلطنة عُمان',
  competitive: 'تنافسي',
  general: 'عام',
  other: 'أخرى',
};

const units: Record<string, [string, string]> = {
  // unit: [plural used for 3–10, singular accusative used for 11+]
  hour: ['ساعات', 'ساعة'],
  day: ['أيام', 'يوماً'],
  week: ['أسابيع', 'أسبوعاً'],
  month: ['أشهر', 'شهراً'],
  year: ['سنوات', 'سنة'],
};
const singular: Record<string, string> = { hour: 'ساعة واحدة', day: 'يوم واحد', week: 'أسبوع واحد', month: 'شهر واحد', year: 'سنة واحدة' };
const dual: Record<string, string> = { hour: 'ساعتان', day: 'يومان', week: 'أسبوعان', month: 'شهران', year: 'سنتان' };

/** "10 weeks" → "10 أسابيع", "3 months" → "3 أشهر"; returns null when the text is not a duration. */
const duration = (value: string): string | null => {
  const m = value.trim().match(/^(\d+)(\+)?\s*(hour|day|week|month|year)s?$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[3].toLowerCase();
  // "5+ years" → "+5 سنوات"
  if (m[2]) return `+${n} ${n <= 10 ? units[unit][0] : units[unit][1]}`;
  if (n === 1) return singular[unit];
  if (n === 2) return dual[unit];
  return n <= 10 ? `${n} ${units[unit][0]}` : `${n} ${units[unit][1]}`;
};

/** "8 min read" → "قراءة 8 دقائق" */
const readTime = (value: string): string | null => {
  const m = value.trim().match(/^(\d+)\s*min(?:ute)?s?(?:\s*read)?$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (n === 1) return 'قراءة دقيقة واحدة';
  if (n === 2) return 'قراءة دقيقتين';
  return `قراءة ${n} ${n <= 10 ? 'دقائق' : 'دقيقة'}`;
};

/** "3-5 Years" → "3-5 سنوات" */
const range = (value: string): string | null => {
  const m = value.trim().match(/^(\d+)\s*[-–]\s*(\d+)\s*(hour|day|week|month|year)s?$/i);
  if (!m) return null;
  return `${m[1]}-${m[2]} ${units[m[3].toLowerCase()][0]}`;
};

export const term = (value: string | undefined | null, lang: 'en' | 'ar'): string => {
  if (!value) return '';
  if (lang !== 'ar') return value;
  return terms[value.trim().toLowerCase()] ?? duration(value) ?? range(value) ?? readTime(value) ?? value;
};
