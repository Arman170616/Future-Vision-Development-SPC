import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Lightbulb, Award, Handshake, Brain, Layers,
  GraduationCap, Package, Search, PenTool, Code, Rocket, Quote, Users, CalendarDays, Briefcase,
  ArrowRight, MapPin, Building2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import Brochure from '../components/Brochure';

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
    { value: '5+', label: tr('Projects Completed', 'مشاريع منجزة') },
    { value: '10+', label: tr('Team Members', 'أعضاء الفريق') },
    { value: '2+', label: tr('Years Experience', 'سنوات من الخبرة') },
    { value: '98%', label: tr('Client Satisfaction', 'رضا العملاء') },
  ];

  // Official values, from the company prospectus
  const values = [
    { icon: Lightbulb, title: tr('Creativity & Innovation', 'الإبداع والابتكار'), text: tr('Unique solutions.', 'حلول فريدة.') },
    { icon: Handshake, title: tr('Trust & Transparency', 'الثقة والشفافية'), text: tr('Partnerships built on results.', 'شراكات مبنية على النتائج.') },
    { icon: Award, title: tr('Quality & Excellence', 'الجودة والتميز'), text: tr('Advanced, well-engineered systems.', 'أنظمة متطورة.') },
    { icon: Rocket, title: tr('Smart Digital Transformation', 'التحول الرقمي الذكي'), text: tr('Turning ideas into successful digital reality.', 'تحويل الأفكار إلى واقع رقمي ناجح.') },
  ];

  const services = [
    { icon: Brain, title: tr('AI Solutions', 'حلول الذكاء الاصطناعي'), text: tr('Intelligent systems, automation and AI agents built around your business needs.', 'أنظمة ذكية وأتمتة ووكلاء ذكاء اصطناعي مصممة حول احتياجات عملك.'), href: '/projects' },
    { icon: Layers, title: tr('Digital Transformation', 'التحول الرقمي'), text: tr('Modern platforms and processes that make organizations faster and more efficient.', 'منصات وعمليات حديثة تجعل المؤسسات أسرع وأكثر كفاءة.'), href: '/projects' },
    { icon: GraduationCap, title: tr('Training & Courses', 'التدريب والدورات'), text: tr('Hands-on courses in AI and technology for individuals and teams.', 'دورات عملية في الذكاء الاصطناعي والتقنية للأفراد والفرق.'), href: '/courses' },
    { icon: Package, title: tr('In-House Products', 'منتجاتنا الداخلية'), text: tr('Products we design, build and run ourselves, ready for your business.', 'منتجات نصمّمها ونطوّرها ونشغّلها بأنفسنا، جاهزة لأعمالك.'), href: '/projects?type=in_house' },
  ];

  const approach = [
    { icon: Search, title: tr('Discover', 'الاكتشاف'), text: tr('We listen and understand your goals, challenges and data.', 'نستمع ونفهم أهدافك وتحدياتك وبياناتك.') },
    { icon: PenTool, title: tr('Design', 'التصميم'), text: tr('We shape the right solution and a clear plan to deliver it.', 'نصمّم الحل المناسب وخطة واضحة لتنفيذه.') },
    { icon: Code, title: tr('Build', 'التطوير'), text: tr('We develop, test and launch with quality at every step.', 'نطوّر ونختبر ونطلق الحل مع ضمان الجودة في كل خطوة.') },
    { icon: Rocket, title: tr('Empower', 'التمكين'), text: tr('We train your team and keep supporting you as you grow.', 'ندرّب فريقك ونواصل دعمك مع نموّك.') },
  ];

  const explore = [
    { icon: Quote, title: tr('CEO Message', 'كلمة الرئيس التنفيذي'), text: tr('A personal note from our leadership.', 'رسالة شخصية من قيادتنا.'), href: '/ceo-message' },
    { icon: Users, title: tr('Our Team', 'فريقنا'), text: tr('Meet the people behind our work.', 'تعرّف على فريق العمل.'), href: '/team' },
    { icon: CalendarDays, title: tr('Activities', 'الأنشطة'), text: tr('Events, programs and community work.', 'الفعاليات والبرامج والعمل المجتمعي.'), href: '/activities' },
    { icon: Briefcase, title: tr('Careers', 'الوظائف'), text: tr('Open positions — come build with us.', 'الوظائف المتاحة، انضم إلينا.'), href: '/jobs' },
  ];

  return (
    <div ref={pageRef} className="pb-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 grid lg:grid-cols-5 gap-10 items-center">
        <div className="lg:col-span-3 text-center lg:text-start">
          <div className="eyebrow glass-effect mb-6 animate-slide-in">
            <Building2 className="h-4 w-4" />
            {tr('About FutureInnvo', 'عن FutureInnvo')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight mb-6 animate-slide-in">
            {tr('Shaping the ', 'نصنع ')}<span className="text-gradient">{tr('Future of Innovation', 'مستقبل الابتكار')}</span>{tr(' in Oman', ' في عُمان')}
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed mb-8 animate-slide-in">
            {tr(
              'We are an Omani company specializing in artificial intelligence and digital transformation solutions. Our team of local and international experts empowers organizations and individuals with advanced technology solutions that support decision-making and comprehensively meet the needs of society — with a constant passion for development and innovation.',
              'نحن شركة عمانية متخصصة في تقديم حلول الذكاء الاصطناعي والتحول الرقمي، نمتلك فريقاً من الخبراء المحليين والدوليين يعملون على تمكين المؤسسات والأفراد عبر حلول تقنية متقدمة تدعم اتخاذ القرارات وتلبي احتياجات المجتمع بشكل شامل، مع شغف مستمر بالتطوير والابتكار.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-in">
            <Link to="/contact" className="btn-liquid justify-center">
              <span className="relative">{tr('Work With Us', 'اعمل معنا')}</span>
              <ArrowRight className="relative h-5 w-5" />
            </Link>
            <Link to="/projects" className="btn-glass glass-effect justify-center">
              {tr('See Our Work', 'شاهد أعمالنا')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 animate-slide-in">
          <div className="glass-effect-strong rounded-[2rem] p-8 text-center">
            <img src="/logo.svg" alt="FutureInnvo" className="h-20 w-auto mx-auto mb-6 logo-hover" />
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
              {tr('Salalah, Sultanate of Oman', 'صلالة، سلطنة عُمان')}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="glass-effect-strong card-lift rounded-3xl p-8 md:p-10 reveal">
            <div className="flex items-center gap-4 mb-5">
              <IconTile icon={Target} size="w-14 h-14" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{tr('Our Mission', 'رسالتنا')}</div>
                <h2 className="text-2xl font-bold text-fg">{tr('Why we exist', 'لماذا نعمل')}</h2>
              </div>
            </div>
            <p className="text-lg text-muted leading-relaxed">
              {tr(
                'We believe that artificial intelligence and digital transformation are the keys to a better future. That is why we create smart solutions that enhance everyday life and empower individuals and organizations to build a brighter, more sustainable future.',
                'نؤمن بأن الذكاء الاصطناعي والتحول الرقمي هما مفتاحان لصناعة مستقبل أفضل، لذا نبتكر حلولاً ذكية تعزز الحياة اليومية وتمكّن الأفراد والمؤسسات من بناء مستقبل أكثر إشراقاً واستدامة.'
              )}
            </p>
          </article>

          <article className="glass-effect-strong card-lift rounded-3xl p-8 md:p-10 reveal" style={delay(120)}>
            <div className="flex items-center gap-4 mb-5">
              <IconTile icon={Eye} size="w-14 h-14" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{tr('Our Vision', 'رؤيتنا')}</div>
                <h2 className="text-2xl font-bold text-fg">{tr('Where we are going', 'إلى أين نتجه')}</h2>
              </div>
            </div>
            <p className="text-lg text-muted leading-relaxed">
              {tr(
                'We strive to be the leading name in artificial intelligence, locally and regionally, through innovative solutions that support digital transformation and innovation for every segment of society and promote sustainable development.',
                'نسعى لأن نكون الاسم الرائد في مجال الذكاء الاصطناعي محلياً وإقليمياً من خلال حلول مبتكرة تدعم التحول الرقمي والابتكار لكافة فئات المجتمع وتعزز التنمية المستدامة.'
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
          sub={tr('Where artificial intelligence meets innovation.', 'حيث يندمج الذكاء الاصطناعي مع الابتكار.')}
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

      {/* Company prospectus (PDF) */}
      <Brochure />

      {/* What we do */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle
          eyebrow={tr('What We Do', 'ماذا نقدم')}
          title={tr('Four ways we help you grow', 'أربع طرق نساعدك بها على النمو')}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon, title, text, href }, i) => (
            <Link key={title} to={href} className="group glass-effect-strong card-lift rounded-3xl p-6 flex flex-col reveal" style={delay(i * 80)}>
              <IconTile icon={icon} />
              <h3 className="text-lg font-semibold text-fg mt-5 mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed flex-1">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                {tr('Learn more', 'اعرف المزيد')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-effect-strong rounded-[2rem] p-8 md:p-12 reveal">
          <div className="text-center mb-10">
            <div className="eyebrow glass-effect mb-4">{tr('Our Approach', 'منهجيتنا')}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-fg">{tr('How we work with you', 'كيف نعمل معك')}</h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map(({ icon, title, text }, i) => (
              <li key={title} className="relative text-center">
                <div className="relative inline-flex mb-4">
                  <IconTile icon={icon} size="w-16 h-16" />
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center ltr shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Explore the company */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <SectionTitle eyebrow={tr('Get to Know Us', 'تعرّف علينا')} title={tr('Explore FutureInnvo', 'استكشف FutureInnvo')} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {explore.map(({ icon, title, text, href }, i) => (
            <Link key={href} to={href} className="group glass-effect card-lift rounded-3xl p-6 flex items-center gap-4 reveal" style={delay(i * 80)}>
              <IconTile icon={icon} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-fg">{title}</span>
                <span className="block text-xs text-muted mt-0.5">{text}</span>
              </span>
              <ArrowRight className="h-5 w-5 text-accent shrink-0 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong rounded-[2rem] px-6 py-14 md:py-16 text-center reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr("Let's build the future together", 'لنصنع المستقبل معاً')}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            {tr('Have a project, a training need or an idea? We would love to hear from you.', 'لديك مشروع أو احتياج تدريبي أو فكرة؟ يسعدنا أن نسمع منك.')}
          </p>
          <Link to="/contact" className="btn-liquid">
            <span className="relative">{tr('Contact Us', 'تواصل معنا')}</span>
            <ArrowRight className="relative h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
