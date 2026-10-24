import { useEffect, useRef, useState, CSSProperties } from 'react';
import { ArrowRight, Target, Users, Award, TrendingUp, Brain, Layers, Rocket, Quote, Sparkles, GraduationCap, FlaskConical, BadgeCheck, Clock, ExternalLink, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { coursesApi, projectsApi, Course, Project } from '../services/api';

/* Shows the real value ("98%", "5+") and replays a count-up from 0 once it scrolls into view,
   so crawlers and no-animation environments never see a 0. */
const CountUp = ({ value }: { value: string }) => {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;
  const [n, setN] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        // rAF timestamps can precede performance.now(); clamp so the value never goes negative
        const p = Math.min(1, Math.max(0, (now - start) / 1400));
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref} className="ltr">{match ? n : ''}{suffix}</span>;
};

const delay = (ms: number) => ({ '--delay': `${ms}ms` } as CSSProperties);

const SectionHeading = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="text-center mb-14 reveal">
    <h2 className="text-3xl md:text-5xl font-bold text-fg mb-4">{title}</h2>
    {sub && <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">{sub}</p>}
  </div>
);

const clientLogos = [
  { src: '/logos/micit-logo.png',           alt: 'Ministry of Transport, Communications & IT logo', fallback: 'MTCIT' },
  { src: '/logos/moe-logo.png',             alt: 'Ministry of Education logo',                      fallback: 'MOE' },
  { src: '/logos/dunan-institute-logo.jpg', alt: 'Dunan Institute logo',                            fallback: 'Dunan' },
];

const partners = [
  { logo: '/logos/partners/microsoft.svg',    name: 'Microsoft' },
  { logo: '/logos/partners/aws.svg',          name: 'Amazon Web Services' },
  { logo: '/logos/partners/google-cloud.svg', name: 'Google Cloud' },
  { logo: '/logos/partners/salesforce.svg',   name: 'Salesforce' },
  { logo: '/logos/partners/oracle.svg',       name: 'Oracle' },
  { logo: '/logos/partners/ibm.svg',          name: 'IBM' },
];

const testimonialBadges = ['MICIT', 'PORT', 'AI'];

const Home = () => {
  const { t, tr, tt, lang } = useLanguage();
  const h = t.home;
  const pageRef = useReveal<HTMLDivElement>();
  const [products, setProducts] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Both sections are optional extras: on failure they simply don't render
    projectsApi.getProducts().then(r => setProducts(r.results.slice(0, 3))).catch(() => setProducts([]));
    coursesApi
      .getCourses()
      .then(r => setCourses([...r.results].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 3)))
      .catch(() => setCourses([]));
  }, []);

  const productTitle = (p: Project) => (lang === 'ar' && p.title_ar) || p.title;
  const productTagline = (p: Project) => (lang === 'ar' && (p.tagline_ar || p.description_ar)) || p.tagline || p.description;

  const stats = ['5+', '10+', '2', '98%'];
  const partnershipStats = ['5+', '2+', '5+', '99%'];
  const pillarIcons = [Brain, Layers, Rocket];
  const reasonIcons = [Target, Users, Award, TrendingUp];

  return (
    <div ref={pageRef}>
      {/* ───────────── Hero ───────────── */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-14 items-center w-full">
          <div className="text-center lg:text-start">
            <div className="eyebrow glass-effect mb-8 animate-slide-in">
              <span className="ping-dot" />
              {h.badge}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 text-fg animate-slide-in" style={{ animationDelay: '120ms' }}>
              {h.heroBefore}
              <span className="text-gradient">{h.heroHighlight}</span>
              {h.heroAfter}
            </h1>

            <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 text-muted leading-relaxed animate-slide-in" style={{ animationDelay: '240ms' }}>
              {h.heroSub}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-in" style={{ animationDelay: '360ms' }}>
              <Link to="/projects" className="btn-liquid justify-center">
                <span className="relative">{h.viewProjects}</span>
                <ArrowRight className="relative h-5 w-5" />
              </Link>
              <Link to="/contact" className="btn-glass glass-effect justify-center">
                {h.getInTouch}
              </Link>
            </div>
          </div>

          {/* Liquid orb */}
          <div className="relative flex justify-center animate-slide-in" style={{ animationDelay: '200ms' }}>
            <div className="orb">
              <div className="orb-ring"><i /></div>
              <div className="orb-ring orb-ring--2"><i /></div>
              <div className="orb-core" />
              <div className="orb-glass" />
              <div className="orb-chip glass-effect-strong" style={{ top: '8%', insetInlineStart: '-4%' }}>
                <span className="text-accent">◆</span> AI
              </div>
              <div className="orb-chip glass-effect-strong" style={{ top: '46%', insetInlineEnd: '-10%', animationDelay: '-1.5s' }}>
                <span className="text-accent">◆</span> Cloud
              </div>
              <div className="orb-chip glass-effect-strong" style={{ bottom: '6%', insetInlineStart: '8%', animationDelay: '-3s' }}>
                <span className="text-accent">◆</span> Data
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 inset-x-0 hidden md:flex flex-col items-center gap-2 text-xs text-muted">
          <div className="scroll-hint"><span /></div>
          {h.scroll}
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong max-w-6xl mx-auto rounded-3xl py-10 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 reveal">
          {stats.map((value, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                <CountUp value={value} />
              </div>
              <div className="text-sm md:text-base text-muted">{h.stats[i]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Who are we ───────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-fg mb-6">{h.whoTitle}</h2>
            <p className="text-lg md:text-xl text-muted max-w-4xl mx-auto leading-relaxed">
              {h.whoBefore}
              <span className="text-accent font-semibold">{h.whoAI}</span>
              {h.whoAnd}
              <span className="text-accent font-semibold">{h.whoDT}</span>
              {h.whoAfter}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {h.pillars.map((p, i) => {
              const Icon = pillarIcons[i];
              return (
                <div key={i} className="glass-effect-strong card-lift p-8 rounded-3xl reveal" style={delay(i * 120)}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-[rgba(var(--accent-rgb),0.14)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.3)]">
                    <Icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-fg mb-3">{p.title}</h3>
                  <p className="text-muted leading-relaxed">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Our products (in-house) ───────────── */}
      {products.length > 0 && (
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 reveal">
              <div className="eyebrow glass-effect mb-5"><Package className="h-4 w-4" />{tr('Built in-house', 'من تطويرنا')}</div>
              <h2 className="text-3xl md:text-5xl font-bold text-fg mb-4">{tr('Showcase of Our Products', 'منتجاتنا')}</h2>
              <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
                {tr('Products we design, build and run ourselves — powered by AI and ready for your business.', 'منتجات نصمّمها ونطوّرها ونشغّلها بأنفسنا، مدعومة بالذكاء الاصطناعي وجاهزة لأعمالك.')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <article key={p.id} className="glass-effect-strong card-lift rounded-3xl overflow-hidden flex flex-col reveal" style={delay(i * 120)}>
                  <div className="relative h-48">
                    <img src={p.image} alt={productTitle(p)} loading="lazy" className="w-full h-full object-cover" />
                    <span className="absolute top-3 start-3 text-xs font-semibold px-3 py-1 rounded-full bg-black/50 on-media backdrop-blur capitalize">
                      {tt(p.status)}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-fg mb-2">{productTitle(p)}</h3>
                    <p className="text-muted text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{productTagline(p)}</p>
                    <div className="flex flex-wrap gap-3">
                      {p.product_url && (
                        <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="btn-liquid !py-2.5 !px-5 text-sm">
                          <span className="relative">{tr('Visit product', 'زيارة المنتج')}</span>
                          <ExternalLink className="relative h-4 w-4" />
                        </a>
                      )}
                      <Link to={`/projects/${p.slug}`} className="btn-glass glass-effect !py-2.5 !px-5 text-sm">
                        {tr('Details', 'التفاصيل')}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-10 reveal">
              <Link to="/projects?type=in_house" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
                {tr('View all products', 'عرض جميع المنتجات')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ───────────── AI training ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect-strong rounded-[2rem] p-6 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center reveal">
            <div className="lg:col-span-2 min-w-0">
              <div className="eyebrow glass-effect mb-5"><GraduationCap className="h-4 w-4" />{tr('Training', 'التدريب')}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('AI Training Courses', 'دورات تدريبية في الذكاء الاصطناعي')}</h2>
              <p className="text-muted leading-relaxed mb-6">
                {tr(
                  'We train individuals and teams to use AI with confidence — from the fundamentals to building real AI solutions.',
                  'ندرّب الأفراد والفرق على استخدام الذكاء الاصطناعي بثقة، من الأساسيات وصولاً إلى بناء حلول ذكاء اصطناعي حقيقية.'
                )}
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { icon: FlaskConical, text: tr('Hands-on, project-based learning', 'تعلّم عملي قائم على المشاريع') },
                  { icon: Users, text: tr('Led by industry experts', 'يقدّمها خبراء من القطاع') },
                  { icon: BadgeCheck, text: tr('Professional certification', 'شهادات احترافية معتمدة') },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-fg">
                    <span className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.14)]">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <Link to="/courses" className="btn-liquid">
                <span className="relative">{tr('Browse all courses', 'تصفّح جميع الدورات')}</span>
                <ArrowRight className="relative h-5 w-5" />
              </Link>
            </div>

            <div className="lg:col-span-3 min-w-0 grid grid-cols-1 gap-4">
              {courses.map(c => (
                <Link
                  key={c.id}
                  to={`/courses?course=${c.slug}`}
                  className="glass-effect card-lift rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.14)]">
                    <GraduationCap className="h-6 w-6 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-fg truncate">{c.name}</div>
                    <div className="text-sm text-muted flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span>{tt(c.level)}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{tt(c.duration)}</span>
                    </div>
                  </div>
                  <div className="font-bold text-accent ltr shrink-0">${c.price}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Why choose us ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title={h.whyTitle} sub={h.whySub} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {h.reasons.map((r, i) => {
              const Icon = reasonIcons[i];
              return (
                <div key={i} className="glass-effect card-lift p-7 rounded-3xl reveal" style={delay(i * 100)}>
                  <div className="flex items-center justify-between mb-6">
                    <Icon className="h-9 w-9 text-accent" />
                    <span className="text-xs font-mono text-muted opacity-60 ltr">0{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-fg mb-2">{r.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Clients ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title={h.clientsTitle} sub={h.clientsSub} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {clientLogos.map((logo, i) => (
              <div key={logo.src} className="group glass-effect-strong card-lift p-4 rounded-3xl text-center reveal" style={delay(i * 100)}>
                <div className="h-48 rounded-2xl flex items-center justify-center mb-5 bg-white p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <span className="text-gray-800 font-bold text-sm hidden">{logo.fallback}</span>
                </div>
                <div className="text-fg text-sm font-semibold">{h.clients[i].name}</div>
                <div className="text-accent text-xs mt-1">{h.clients[i].sub}</div>
              </div>
            ))}
          </div>

          {/* Technology partners */}
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent text-center mb-8 reveal">
            {h.partnersTitle}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
            {partners.map((p, i) => (
              <div key={p.name} className="glass-effect card-lift p-3 rounded-2xl text-center reveal" style={delay(i * 70)}>
                <div className="h-20 rounded-xl bg-white flex items-center justify-center mb-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
                  <img src={p.logo} alt={`${p.name} logo`} loading="lazy" className="h-10 w-10 object-contain" />
                </div>
                <div className="text-fg text-sm font-semibold ltr">{p.name}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {h.testimonials.map((tm, i) => (
              <figure key={i} className="glass-effect-strong card-lift p-8 rounded-3xl flex flex-col reveal" style={delay(i * 120)}>
                <Quote className="h-8 w-8 text-accent opacity-60 mb-4" />
                <blockquote className="text-muted leading-relaxed mb-6 flex-1">"{tm.quote}"</blockquote>
                <figcaption className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[rgba(var(--accent-rgb),0.14)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.35)]">
                    <span className="text-accent font-bold text-[10px] ltr">{testimonialBadges[i]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-fg font-semibold text-sm">{tm.name}</div>
                    <div className="text-muted text-xs">{tm.sub}</div>
                  </div>
                  <div className="ms-auto text-accent text-sm tracking-widest">★★★★★</div>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Partnership stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {partnershipStats.map((value, i) => (
              <div key={i} className="glass-effect p-6 rounded-3xl text-center reveal" style={delay(i * 80)}>
                <div className="text-3xl font-bold text-gradient mb-2"><CountUp value={value} /></div>
                <div className="text-muted text-sm">{h.partnershipStats[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="glass-effect-strong relative overflow-hidden max-w-6xl mx-auto rounded-[2rem] px-6 py-16 md:py-20 text-center reveal">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40 bg-[radial-gradient(circle,var(--accent),transparent_65%)] pointer-events-none" />
          <Sparkles className="relative h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="relative text-3xl md:text-5xl font-bold text-fg mb-4">{h.ctaTitle}</h2>
          <p className="relative text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto">{h.ctaSub}</p>
          <Link to="/contact" className="btn-liquid relative">
            <span className="relative">{h.ctaButton}</span>
            <ArrowRight className="relative h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
