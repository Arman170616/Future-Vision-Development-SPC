/**
 * Company content for Future Vision Development SPC, taken from the company
 * brochure and the experience note (public/brochure). Every text is bilingual:
 * [English, Arabic] — pages pass both to tr().
 */
import type { LucideIcon } from 'lucide-react';
import {
  CloudLightning, Ship, ClipboardCheck, Scale, Building2, ShieldAlert, Wrench, Gavel, Gauge,
  Truck, Anchor, HardHat, Factory, SearchCheck, Flame, Car,
  UserRound, Trophy, Users, Languages, HeartHandshake, Cog,
} from 'lucide-react';

export type Bi = [en: string, ar: string];

export const CONTACT = {
  phones: ['+968 9212 2631', '+968 9221 2195'],
  phoneLinks: ['tel:+96892122631', 'tel:+96892212195'],
  whatsapp: 'https://wa.me/96892122631',
  email: 'info.futurevisiondev@gmail.com',
  address: [
    'P.O. Box 111, Postal Code 112, Ruwi, MBD, Muscat, Sultanate of Oman',
    'ص.ب 111، الرمز البريدي 112، روي، منطقة مسقط التجارية، سلطنة عُمان',
  ] as Bi,
  crNo: '1406761',
};

export interface Service {
  icon: LucideIcon;
  title: Bi;
  text: Bi;
}

export const SERVICES: Service[] = [
  {
    icon: CloudLightning,
    title: ['Insurance Claims — Damage & Catastrophe', 'مطالبات التأمين — الأضرار والكوارث'],
    text: [
      'Investigation and assessment of property damage, floods, storms and catastrophe events, tailored to the terms of the policy.',
      'التحقيق في أضرار الممتلكات والفيضانات والعواصف والكوارث وتقييمها وفق شروط وثيقة التأمين.',
    ],
  },
  {
    icon: Ship,
    title: ["Marine Cargo & Haulier's Liability", 'البضائع البحرية ومسؤولية الناقل'],
    text: [
      "Cargo surveys by road and sea, and haulier's liability assessments for transport and logistics operators.",
      'معاينة البضائع المنقولة براً وبحراً وتقييم مسؤولية الناقل لشركات النقل والخدمات اللوجستية.',
    ],
  },
  {
    icon: ClipboardCheck,
    title: ['Marine Transport & Quality Assurance Reports', 'تقارير النقل البحري وضمان الجودة'],
    text: [
      'Quality assurance checks and condition reports for goods in transit, vessels, hull, machinery and tanks.',
      'فحوصات ضمان الجودة وتقارير الحالة للبضائع أثناء النقل والسفن وهياكلها وآلاتها وخزاناتها.',
    ],
  },
  {
    icon: Scale,
    title: ['Loss Adjusting for Claims', 'تسوية الخسائر للمطالبات'],
    text: [
      'Independent, full-fledged analysis reports that establish cause, coverage and quantum for every claim.',
      'تقارير تحليل مستقلة وشاملة تحدد سبب الخسارة والتغطية وقيمة التعويض لكل مطالبة.',
    ],
  },
  {
    icon: Building2,
    title: ['Valuation of Property', 'تقييم الممتلكات'],
    text: [
      'Valuations of buildings, contents, plant, machinery and motor vehicles for insurers, banks and owners.',
      'تقييم المباني والمحتويات والمعدات والآلات والمركبات لشركات التأمين والبنوك والملاك.',
    ],
  },
  {
    icon: ShieldAlert,
    title: ['Risk Management & Assessment', 'إدارة المخاطر وتقييمها'],
    text: [
      'Pre-risk inspections and risk surveys that help insurers underwrite with confidence and help clients reduce exposure.',
      'معاينات ما قبل التأمين ومسوحات المخاطر التي تساعد شركات التأمين على الاكتتاب بثقة وتساعد العملاء على تقليل المخاطر.',
    ],
  },
  {
    icon: Wrench,
    title: ['Repair Assessors — Agency & Non-Agency', 'تقييم الإصلاحات — الوكالة وغير الوكالة'],
    text: [
      'Technical assessment of repair estimates for motor and non-motor claims, at agency and non-agency workshops.',
      'تقييم فني لتقديرات الإصلاح لمطالبات المركبات وغير المركبات في ورش الوكالة وغير الوكالة.',
    ],
  },
  {
    icon: Gavel,
    title: ['Complex Cases & Dispute Handling', 'القضايا المعقدة وتسوية النزاعات'],
    text: [
      'Handling of complex and disputed claims between insurers and insured parties — without legal complications.',
      'معالجة المطالبات المعقدة والمتنازع عليها بين شركات التأمين والمؤمَّن لهم دون تعقيدات قانونية.',
    ],
  },
  {
    icon: Gauge,
    title: ['Agency Repair Monitoring & Cost Control', 'متابعة إصلاحات الوكالة وضبط التكاليف'],
    text: [
      'Monitoring of repairs from start to finish so that work stays within the agreed scope, quality and budget.',
      'متابعة أعمال الإصلاح من البداية حتى النهاية لضمان الالتزام بالنطاق والجودة والميزانية المتفق عليها.',
    ],
  },
];

export interface ExperienceArea {
  icon: LucideIcon;
  count: number;
  title: Bi;
  detail?: Bi;
  clients: Bi;
}

export const EXPERIENCE: ExperienceArea[] = [
  {
    icon: Truck,
    count: 25,
    title: ["Haulier's Liability", 'مسؤولية الناقل'],
    clients: ['TruckOman, Moosa Abdul Rehman, Salalah Logistics', 'تراك عُمان، موسى عبد الرحمن، صلالة للخدمات اللوجستية'],
  },
  {
    icon: Ship,
    count: 20,
    title: ['Marine Open', 'التأمين البحري المفتوح'],
    detail: ['Road & seaway cargo', 'بضائع منقولة براً وبحراً'],
    clients: ['Salalah Mills, Oman Flour Mills, Genserve', 'مطاحن صلالة، مطاحن عُمان، جنسيرف'],
  },
  {
    icon: Anchor,
    count: 10,
    title: ['Vessel', 'السفن والقوارب'],
    detail: ['Damage to boats and yachts', 'أضرار القوارب واليخوت'],
    clients: [
      'Sifah, Bandar Khairan, Vessels off the Salalah coast, Grounding damage',
      'السيفة، بندر الخيران، سفن قبالة ساحل صلالة، أضرار الجنوح',
    ],
  },
  {
    icon: HardHat,
    count: 20,
    title: ["Contractor's Risk", 'مخاطر المقاولين'],
    clients: [
      'Petrojet Loopline, Sultans School, Daud Contracting, Galfar, Muscat Bay, Ministry of Defence – Sohar',
      'بتروجت لوب لاين، مدرسة السلطان، داود للمقاولات، جلفار، خليج مسقط، وزارة الدفاع – صحار',
    ],
  },
  {
    icon: Factory,
    count: 20,
    title: ['Engineering / Plant & Machinery', 'الهندسة / المعدات والآلات'],
    clients: ['Salem Mohiyuddin, Al Rawasi Crushers, Atlantic Readymix', 'سالم محي الدين، كسارات الرواسي، أتلانتيك للخرسانة الجاهزة'],
  },
  {
    icon: SearchCheck,
    count: 20,
    title: ['Pre-Risk Inspections', 'معاينات ما قبل التأمين'],
    clients: [
      'Nakheel Date Plant, Wyndham Resort, Nesto Group, College of Banking & Finance, Madayn Investment Projects, Bank Muscat, Sur Freezone projects',
      'مصنع نخيل للتمور، منتجع ويندهام، مجموعة نستو، كلية الدراسات المصرفية والمالية، مشاريع مدائن الاستثمارية، بنك مسقط، مشاريع المنطقة الحرة بصور',
    ],
  },
  {
    icon: Flame,
    count: 25,
    title: ['Fire & Perils', 'الحريق والأخطار'],
    clients: [
      'Private residences, Housing sections in Salalah / Muscat / Sohar / Sur',
      'مساكن خاصة، وحدات سكنية في صلالة / مسقط / صحار / صور',
    ],
  },
  {
    icon: Car,
    count: 50,
    title: ['Motor Valuation & Third Party', 'تقييم المركبات والطرف الثالث'],
    clients: [
      'Oasis Trading, Muscat Bay, Oman International Airport, Several valuations at yards',
      'الواحة للتجارة، خليج مسقط، مطار عُمان الدولي، تقييمات متعددة في الساحات',
    ],
  },
];

export const TOTAL_CASES = EXPERIENCE.reduce((sum, e) => sum + e.count, 0);

export interface Reason {
  icon: LucideIcon;
  title: Bi;
  text: Bi;
}

export const REASONS: Reason[] = [
  {
    icon: UserRound,
    title: ['A single point of contact', 'نقطة تواصل واحدة'],
    text: [
      'You never go through a call center. You get the direct contact details of your adjusters and can reach us instantly for claim details, follow-up and feedback.',
      'لن تمر عبر مركز اتصال أبداً. تحصل على أرقام المسوّين المباشرة ويمكنك التواصل معنا فوراً لمعرفة تفاصيل مطالبتك ومتابعتها.',
    ],
  },
  {
    icon: Trophy,
    title: ['Claims resolved quickly', 'حل المطالبات بسرعة'],
    text: [
      'A coordinated team led by us keeps your claim running smoothly and efficiently, on a clear reporting schedule.',
      'فريق منسّق بقيادتنا يضمن سير مطالبتك بسلاسة وكفاءة وفق جدول تقارير واضح.',
    ],
  },
  {
    icon: Cog,
    title: ['Experience that counts', 'خبرة تصنع الفرق'],
    text: [
      'Years of work with eminent teams guide us to the safest, most economic route to proper claim closure and professional reports.',
      'سنوات من العمل مع فرق متميزة ترشدنا إلى الطريق الأكثر أماناً واقتصاداً لإغلاق المطالبات بشكل سليم وإعداد تقارير احترافية.',
    ],
  },
  {
    icon: Users,
    title: ['Being equally represented', 'تمثيل متوازن للجميع'],
    text: [
      'Your feedback, requirements and comments shape how a claim is standardized and negotiated, so the result is delivered smoothly without legal complications.',
      'ملاحظاتك ومتطلباتك وتعليقاتك هي أساس توحيد المطالبة والتفاوض عليها، لتسليم النتيجة بسلاسة ودون تعقيدات قانونية.',
    ],
  },
  {
    icon: Languages,
    title: ['Keeping you in control', 'أنت صاحب القرار'],
    text: [
      'Staff support in Arabic, English, Hindi and Urdu. Manage each step with your adjusters, or let them take the reins completely — the choice is yours.',
      'دعم بالعربية والإنجليزية والهندية والأردية. تابع كل خطوة مع المسوّين أو اترك لهم إدارة المطالبة بالكامل — القرار لك.',
    ],
  },
  {
    icon: HeartHandshake,
    title: ['Significant reduction in stress', 'تخفيف كبير للضغط'],
    text: [
      'Running a claim takes real time and energy. An expert guiding you and your client through the process lets you focus on your day-to-day work.',
      'إدارة المطالبة تستهلك الكثير من الوقت والجهد. وجود خبير يرشدك ويرشد عميلك خلال العملية يتيح لك التركيز على عملك اليومي.',
    ],
  },
];

export interface ReportStep {
  title: Bi;
  when: Bi;
  text: Bi;
}

export const REPORT_STEPS: ReportStep[] = [
  {
    title: ['First Analysis — Primary Report', 'التحليل الأول — التقرير الأولي'],
    when: ['Within 3 working days', 'خلال 3 أيام عمل'],
    text: [
      'Issued within the first three working days of claim inception: initial findings, cause of loss and next steps.',
      'يصدر خلال أول ثلاثة أيام عمل من بدء المطالبة: النتائج الأولية وسبب الخسارة والخطوات التالية.',
    ],
  },
  {
    title: ['Update & Budgetary Assessment Reports', 'تقارير المتابعة والتقييم المالي'],
    when: ['Over the course of the claim', 'خلال مراحل المطالبة'],
    text: [
      'Second update report and budgetary assessments, issued as required while the claim progresses.',
      'تقرير المتابعة الثاني وتقديرات الميزانية، تصدر حسب الحاجة مع تقدّم المطالبة.',
    ],
  },
  {
    title: ['Final Claim Analysis Report', 'تقرير التحليل النهائي للمطالبة'],
    when: ['The moment the claim is settled', 'فور تسوية المطالبة'],
    text: [
      'The complete, independent analysis — issued the instant the purported claim has been dealt with.',
      'التحليل المستقل الكامل — يصدر فور الانتهاء من معالجة المطالبة.',
    ],
  },
];

export interface TeamMember {
  name: Bi;
  role: Bi;
  education: Bi;
  qualifications: Bi[];
  work: Bi[];
  areas: Bi[];
}

export const TEAM: TeamMember[] = [
  {
    name: ['Engr. Richin Joe Cherian', 'م. ريتشن جو شيريان'],
    role: ['Senior Loss Adjuster — Marine & Property', 'كبير مسوّي الخسائر — البحري والممتلكات'],
    education: [
      'Bachelor of Engineering & Technology in Electronics & Communication Engineering, CUSAT',
      'بكالوريوس الهندسة والتكنولوجيا في هندسة الإلكترونيات والاتصالات، جامعة كوشين (CUSAT)',
    ],
    qualifications: [
      ['6+ years in claim management / loss adjusting, CII cert.', 'أكثر من 6 سنوات في إدارة المطالبات وتسوية الخسائر، شهادة CII'],
      ['2 years in business analysis and insurance charting for overseas marine clients', 'سنتان في تحليل الأعمال والتخطيط التأميني لعملاء بحريين في الخارج'],
    ],
    work: [['Arab Loss Adjusters International LLC — Surveyor, 2015–2021', 'الشركة العربية الدولية لتسوية الخسائر — مسّاح، 2015–2021']],
    areas: [
      ['Property risk evaluation', 'تقييم مخاطر الممتلكات'],
      ['Hull, machinery & tank condition surveys', 'مسوحات حالة الهياكل والآلات والخزانات'],
      ['PAR, flood & perils, fire claims', 'مطالبات PAR والفيضانات والأخطار والحريق'],
      ['Electronic & electrical damage analysis', 'تحليل الأضرار الإلكترونية والكهربائية'],
      ['Cargo marine surveys, quality assurance checks', 'معاينة البضائع البحرية وفحوصات ضمان الجودة'],
      ['Calamity / catastrophe response', 'الاستجابة للكوارث'],
    ],
  },
  {
    name: ['Engr. Waleed Al Dini', 'م. وليد الديني'],
    role: ['Loss Adjuster — Civil & Structural', 'مسوّي خسائر — المدني والإنشائي'],
    education: ['Bachelor of Civil Engineering, Sultan Qaboos University (SQU)', 'بكالوريوس الهندسة المدنية، جامعة السلطان قابوس'],
    qualifications: [
      ['3+ years in claim management / loss adjusting, CII cert.', 'أكثر من 3 سنوات في إدارة المطالبات وتسوية الخسائر، شهادة CII'],
      ['3 years in civil construction, structural, housing and planning', '3 سنوات في الإنشاءات المدنية والهياكل والإسكان والتخطيط'],
    ],
    work: [['Arab Loss Adjusters International LLC — Surveyor, 2018–2021', 'الشركة العربية الدولية لتسوية الخسائر — مسّاح، 2018–2021']],
    areas: [
      ['Civil housing claims', 'مطالبات المساكن المدنية'],
      ['PAR, CAR, EAR, third-party motor insurance claims', 'مطالبات PAR وCAR وEAR وتأمين المركبات ضد الغير'],
      ['Fire, flood peril and calamity damage surveys', 'مسوحات أضرار الحريق والفيضانات والكوارث'],
      ['Structural damage & evaluation', 'الأضرار الإنشائية وتقييمها'],
      ['Damage control analysis', 'تحليل الحد من الأضرار'],
      ['Planning, repairs, discharge reporting', 'التخطيط والإصلاحات وتقارير الإخلاء'],
      ['Assessment & analysis for conditional surveys', 'التقييم والتحليل لمسوحات الحالة'],
    ],
  },
  {
    name: ['Engr. Waseem Khalid', 'م. وسيم خالد'],
    role: ['Engineer — Damage Control', 'مهندس — الحد من الأضرار'],
    education: ["Bachelor's Degree in Civil / Structural Engineering, ASU", 'بكالوريوس الهندسة المدنية / الإنشائية، ASU'],
    qualifications: [
      ['Certification in analysis, evaluation and safety protocols, CII cert.', 'شهادة في التحليل والتقييم وبروتوكولات السلامة، شهادة CII'],
      ['Certificate in Risk Management — Insuring against Risk (Revised)', 'شهادة في إدارة المخاطر — التأمين ضد المخاطر (منقّحة)'],
    ],
    work: [
      ['Trainee, Al Manarah Engineering Consultancy — reporting & analysis (2020)', 'متدرب، المنارة للاستشارات الهندسية — التقارير والتحليل (2020)'],
      ['Site Engineer, safety / construction — Al Jusoor Trading & Cont. (2020–Apr 2021)', 'مهندس موقع، السلامة / الإنشاءات — الجسور للتجارة والمقاولات (2020–أبريل 2021)'],
      ['Engineer — Damage Control, joined 2021', 'مهندس — الحد من الأضرار، انضم عام 2021'],
    ],
    areas: [
      ['Analysis, repairs, third-party motor vehicle claims', 'التحليل والإصلاحات ومطالبات المركبات ضد الغير'],
      ['CAR, EAR, CPM, fire & perils surveys', 'مسوحات CAR وEAR وCPM والحريق والأخطار'],
      ['Risk management analysis & reporting', 'تحليل إدارة المخاطر وإعداد التقارير'],
      ['Assessment & analysis for calamity response', 'التقييم والتحليل للاستجابة للكوارث'],
    ],
  },
];

/** Photos from the company brochure ("This is where we step in"). */
export const FIELD_PHOTOS: { src: string; alt: Bi }[] = [
  { src: '/images/flood.jpg', alt: ['Flooded streets after a storm', 'شوارع غمرتها مياه الأمطار بعد عاصفة'] },
  { src: '/images/structural-damage.jpg', alt: ['Building collapsed by coastal erosion', 'مبنى منهار بسبب تآكل الساحل'] },
  { src: '/images/fire.jpg', alt: ['Firefighters at a vehicle and building fire', 'رجال الإطفاء في حريق مركبات ومبنى'] },
  { src: '/images/site-incident.jpg', alt: ['Rescue team at a construction site incident', 'فريق إنقاذ في حادث بموقع إنشاءات'] },
];
