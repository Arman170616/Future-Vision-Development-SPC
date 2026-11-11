import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Handshake, Award, Eye, ShieldCheck, Users, CalendarDays, Briefcase, Layers,
  ArrowRight, MapPin, Building2, CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import Brochure from '../components/Brochure';
import { EXPERIENCE, SERVICES, TOTAL_CASES } from '../data/company';

const delay = (ms: number) => ({ '--delay': `${ms}ms` } as CSSProperties);

const IconTile = ({ icon: Icon, size = 'w-12 h-12' }: { icon: typeof Target; size?: string }) => (
  <span className={`${size} shrink-0 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.2)]`}>
    <Icon className="h-6 w-6 text-accent" />
  </span>
);

const SectionTitle = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => (
  <div className="text-center mb-12 reveal">
    <div className="eyebrow glass-effect mb-4">{eyebrow}</div>
    <h2 className="text-3xl md:text-4xl font-bold text-fg mb-3">{title}</h2>
    {sub && <p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed">{sub}</p>}
  </div>
);

const About = () => {
  const { tr } = useLanguage();
  const pageRef = useReveal<HTMLDivElement>();

  const stats = [
    { value: '7+', label: tr('Years of experience', 'سنوات من الخبرة') },
    { value: `${TOTAL_CASES}+`, label: tr('Claims & cases', 'مطالبة وقضية') },
    { value: `${SERVICES.length}`, label: tr('Core services', 'خدمات رئيسية') },
    { value: '2', label: tr('Divisions', 'فرعان') },
  ];

  const values = [
    { icon: Award, title: tr('Technical Excellence', 'التميّز الفني'), text: tr('Engineers and certified adjusters behind every report.', 'مهندسون ومسوّون معتمدون وراء كل تقرير.') },
    { icon: Eye, title: tr('Transparency', 'الشفافية'), text: tr('Clear findings and a clear reporting schedule.', 'نتائج واضحة وجدول تقارير واضح.') },
    { icon: ShieldCheck, title: tr('Integrity', 'النزاهة'), text: tr('Independent analysis, faithful to the policy.', 'تحليل مستقل وأمين لشروط الوثيقة.') },
    { icon: Handshake, title: tr('Good Faith', 'حسن النية'), text: tr('Fair to insurers, customers and the legal documents that bind them.', 'إنصاف لشركات التأمين والعملاء والوثائق القانونية التي تجمعهم.') },
  ];

  const explore = [
    { icon: Layers, title: tr('Our Services', 'خدماتنا'), text: tr('Nine ways we support your claims.', 'تسع خدمات لدعم مطالباتك.'), href: '/services' },
    { icon: Users, title: tr('Our Team', 'فريقنا'), text: tr('Meet our engineers and adjusters.', 'تعرّف على مهندسينا ومسوّينا.'), href: '/team' },
    { icon: CalendarDays, title: tr('Activities', 'الأنشطة'), text: tr('News, events and gallery.', 'الأخبار والفعاليات والمعرض.'), href: '/activities' },
    { icon: Briefcase, title: tr('Careers', 'الوظائف'), text: tr('Open positions — join us.', 'الوظائف المتاحة، انضم إلينا.'), href: '/jobs' },
  ];

  return (
    <div ref={pageRef} className="pb-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-3 text-center lg:text-start">
          <div className="eyebrow glass-effect mb-6 animate-slide-in">
            <Building2 className="h-4 w-4" />
            {tr('About Future Vision Development', 'عن تطوير الرؤية المستقبلية')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight mb-6 animate-slide-in">
            {tr('Professional ', 'مسوّو خسائر ')}<span className="text-gradient">{tr('independent loss adjusters', 'مستقلون ومحترفون')}</span>{tr(' you can rely on', ' يمكنك الاعتماد عليهم')}
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed mb-8 animate-slide-in">
            {tr(
              'Insurance is complex, and every service needs a specific analysis to tailor the assessment. Our independent loss adjusters offer a completely comprehensive service according to the requirements of insurance companies — adjusting and assessing the losses of customers and clients against the specific policy.',
              'التأمين معقّد، وكل خدمة تحتاج إلى تحليل خاص لتكييف التقييم. يقدّم مسوّو الخسائر المستقلون لدينا خدمة شاملة وفق متطلبات شركات التأمين، فيسوّون خسائر العملاء ويقيّمونها وفق وثيقة التأمين المحددة.',
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-in">
            <Link to="/contact" className="btn-liquid justify-center">
              <span className="relative">{tr('Work With Us', 'اعمل معنا')}</span>
              <ArrowRight className="relative h-5 w-5 rtl:rotate-180" />
            </Link>
            <Link to="/experience" className="btn-glass glass-effect justify-center">
              {tr('See Our Experience', 'شاهد خبراتنا')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 animate-slide-in">
          <div className="glass-effect-strong rounded-[2rem] p-8 text-center">
            <img src="/brand/logo-tile.svg" alt="Future Vision Development SPC" className="h-24 w-24 mx-auto mb-4 rounded-2xl shadow-lg logo-hover" />
            <div className="font-bold text-fg text-lg ltr">FUTURE VISION DEVELOPMENT SPC</div>
            <div className="text-xs text-muted mb-6">{tr('Loss Adjusting, Insurance Claims, Risk Management, Evaluation & Marine Analysis', 'تسوية الخسائر، مطالبات التأمين، إدارة المخاطر، التقييم والتحليل البحري')}</div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(stat => (
                <div key={stat.label} className="glass-effect rounded-2xl p-4">
                  <div className="text-3xl font-bold text-gradient ltr">{stat.value}</div>
                  <div className="text-xs text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-4 w-4 text-accent" />
              {tr('Muscat & Salalah, Sultanate of Oman', 'مسقط وصلالة، سلطنة عُمان')}
            </div>
          </div>
        </div>
      </section>

      {/* Who we are & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="glass-effect-strong card-lift rounded-3xl p-8 md:p-10 reveal">
            <div className="flex items-center gap-4 mb-5">
              <IconTile icon={Building2} size="w-14 h-14" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{tr('Who We Are', 'من نحن')}</div>
                <h2 className="text-2xl font-bold text-fg">{tr('Dedicated to quality', 'ملتزمون بالجودة')}</h2>
              </div>
            </div>
            <p className="text-lg text-muted leading-relaxed">
              {tr(
                'Future Vision Development is dedicated to providing high-quality services and a desire to streak ahead in all its missions: insurance liability claims investigation, risk management, valuation, marine services and motor / non-motor handling.',
                'تلتزم تطوير الرؤية المستقبلية بتقديم خدمات عالية الجودة والتفوق في جميع مهامها: التحقيق في مطالبات المسؤولية التأمينية، وإدارة المخاطر، والتقييم، والخدمات البحرية، ومعالجة مطالبات المركبات وغيرها.',
              )}
            </p>
          </article>

          <article className="glass-effect-strong card-lift rounded-3xl p-8 md:p-10 reveal" style={delay(120)}>
            <div className="flex items-center gap-4 mb-5">
              <IconTile icon={Target} size="w-14 h-14" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{tr('Our Mission', 'رسالتنا')}</div>
                <h2 className="text-2xl font-bold text-fg">{tr('Why we exist', 'لماذا نعمل')}</h2>
              </div>
            </div>
            <p className="text-lg text-muted leading-relaxed">
              {tr(
                'A core unit with more than 7 years of experience in the insurance and loss adjusting industry, formed as Future Vision Development SPC to handle loss adjusting, claim solving, marine cargo and transport assessments and motor vehicle claims — providing independent, full-fledged analysis reports based on the specific policy, for government and private firms, and managing disputes.',
                'فريق أساسي يمتلك أكثر من 7 سنوات من الخبرة في قطاع التأمين وتسوية الخسائر، تأسس باسم تطوير الرؤية المستقبلية ش.ش.و لمعالجة تسوية الخسائر وحل المطالبات وتقييم البضائع والنقل البحري ومطالبات المركبات — مع تقديم تقارير تحليل مستقلة وشاملة وفق الوثيقة المحددة للجهات الحكومية والخاصة، وإدارة النزاعات.',
              )}
            </p>
          </article>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          eyebrow={tr('Our Values', 'قيمنا')}
          title={tr('What we stand for', 'ما نؤمن به')}
          sub={tr('Bespoke, cost-effective claims handling with technical excellence, transparency and integrity at the core.', 'معالجة مطالبات مصمّمة لكل حالة وبتكلفة مناسبة، أساسها التميّز الفني والشفافية والنزاهة.')}
        />
        <div className="grid sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {values.map(({ icon, title, text }, i) => (
            <div key={title} className="glass-effect card-lift rounded-3xl p-6 flex gap-4 reveal" style={delay(i * 80)}>
              <IconTile icon={icon} />
              <div>
                <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-effect-strong rounded-[2rem] p-8 md:p-12 grid lg:grid-cols-2 gap-10 items-center reveal">
          <div>
            <div className="eyebrow glass-effect mb-4"><MapPin className="h-4 w-4" />{tr('Coverage', 'نطاق العمل')}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Anywhere in the Sultanate', 'في أي مكان في السلطنة')}</h2>
            <p className="text-muted leading-relaxed">
              {tr(
                'Our Muscat and Salalah divisions include engineers and trainees ready to travel for any inspection, anywhere in Oman, as per instruction — with experience in Muscat, Salalah, Sohar, Sur, Sifah, Bandar Khairan and beyond.',
                'يضم فرعانا في مسقط وصلالة مهندسين ومتدربين جاهزين للانتقال لأي معاينة في أي مكان في عُمان حسب التكليف — مع خبرة في مسقط وصلالة وصحار وصور والسيفة وبندر الخيران وغيرها.',
              )}
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {EXPERIENCE.map(e => (
              <li key={e.title[0]} className="glass-effect rounded-2xl px-4 py-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                <span className="text-sm text-fg">{tr(...e.title)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Company documents (PDF) */}
      <Brochure />

      {/* Explore the company */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle eyebrow={tr('Get to Know Us', 'تعرّف علينا')} title={tr('Explore Future Vision', 'استكشف الرؤية المستقبلية')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {explore.map(({ icon, title, text, href }, i) => (
            <Link key={href} to={href} className="group glass-effect card-lift rounded-3xl p-6 flex items-center gap-4 reveal" style={delay(i * 80)}>
              <IconTile icon={icon} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fg">{title}</span>
                <span className="block text-xs text-muted mt-0.5">{text}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-accent shrink-0 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong rounded-[2rem] px-6 py-14 md:py-16 text-center reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Let us handle your next claim', 'دعنا نتولى مطالبتك القادمة')}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            {tr('Insurers, brokers and businesses across Oman trust us with their claims. Talk to an adjuster today.', 'تثق بنا شركات التأمين والوسطاء والشركات في أنحاء عُمان لمعالجة مطالباتهم. تحدّث مع أحد المسوّين اليوم.')}
          </p>
          <Link to="/contact" className="btn-liquid">
            <span className="relative">{tr('Contact Us', 'تواصل معنا')}</span>
            <ArrowRight className="relative h-5 w-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
