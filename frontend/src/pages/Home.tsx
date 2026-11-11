import { useEffect, useRef, useState, CSSProperties } from 'react';
import { ArrowRight, Phone, ShieldCheck, FileText, MapPin, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { CONTACT, EXPERIENCE, FIELD_PHOTOS, REASONS, REPORT_STEPS, SERVICES, TEAM, TOTAL_CASES } from '../data/company';

/* Shows the real value ("7+") and replays a count-up from 0 once it scrolls into view,
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

const SectionHeading = ({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) => (
  <div className="text-center mb-14 reveal">
    {eyebrow && <div className="eyebrow glass-effect mb-5">{eyebrow}</div>}
    <h2 className="text-3xl md:text-5xl font-bold text-fg mb-4">{title}</h2>
    {sub && <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">{sub}</p>}
  </div>
);

const IconTile = ({ icon: Icon, size = 'w-12 h-12' }: { icon: typeof Phone; size?: string }) => (
  <span className={`${size} shrink-0 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.25)]`}>
    <Icon className="h-6 w-6 text-accent" />
  </span>
);

const Home = () => {
  const { tr } = useLanguage();
  const pageRef = useReveal<HTMLDivElement>();

  const stats = [
    { value: '7+', label: tr('Years in loss adjusting', 'سنوات في تسوية الخسائر') },
    { value: `${TOTAL_CASES}+`, label: tr('Claims & cases handled', 'مطالبة وقضية تمت معالجتها') },
    { value: `${EXPERIENCE.length}`, label: tr('Lines of insurance covered', 'فروع تأمين نغطيها') },
    { value: '3', label: tr('Days to first report', 'أيام حتى التقرير الأول') },
  ];

  const photoChips = [tr('Flood', 'فيضانات'), tr('Structural', 'إنشائي'), tr('Fire', 'حريق'), tr('Site incident', 'حوادث المواقع')];

  return (
    <div ref={pageRef}>
      {/* ───────────── Hero ───────────── */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-14 items-center w-full">
          <div className="text-center lg:text-start">
            <div className="eyebrow glass-effect mb-8 animate-slide-in">
              <span className="ping-dot" />
              {tr('Independent Loss Adjusters · Sultanate of Oman', 'مسوّو خسائر مستقلون · سلطنة عُمان')}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-6 text-fg animate-slide-in" style={{ animationDelay: '120ms' }}>
              {tr('Claims handled with ', 'مطالبات تُدار ')}
              <span className="text-gradient">{tr('technical excellence', 'بتميّز فني')}</span>
              {tr(', transparency and integrity', ' وشفافية ونزاهة')}
            </h1>

            <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 text-muted leading-relaxed animate-slide-in" style={{ animationDelay: '240ms' }}>
              {tr(
                'Loss adjusting, insurance claims investigation, risk management, valuation and marine analysis — independent, full-fledged reports tailored to each policy, for government and private firms.',
                'تسوية الخسائر والتحقيق في مطالبات التأمين وإدارة المخاطر والتقييم والتحليل البحري — تقارير مستقلة وشاملة مصمّمة لكل وثيقة تأمين، للجهات الحكومية والخاصة.',
              )}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center lg:justify-start animate-slide-in" style={{ animationDelay: '360ms' }}>
              <Link to="/services" className="btn-liquid justify-center">
                <span className="relative">{tr('Our Services', 'خدماتنا')}</span>
                <ArrowRight className="relative h-5 w-5 rtl:rotate-180" />
              </Link>
              <Link to="/contact" className="btn-glass glass-effect justify-center">
                {tr('Report a Claim', 'أبلغ عن مطالبة')}
              </Link>
              <a href={CONTACT.phoneLinks[0]} className="btn-glass glass-effect justify-center">
                <Phone className="h-4 w-4 text-accent" />
                <span className="ltr">{CONTACT.phones[0]}</span>
              </a>
            </div>
          </div>

          {/* Field photo mosaic — from the company brochure */}
          <div className="relative animate-slide-in" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-40 bg-[radial-gradient(circle,var(--accent),transparent_65%)] pointer-events-none" />
            <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
              {FIELD_PHOTOS.map((photo, i) => (
                <figure
                  key={photo.src}
                  className={`relative overflow-hidden rounded-3xl glass-effect-strong p-1.5 ${i % 2 === 1 ? 'translate-y-6' : ''}`}
                >
                  <img
                    src={photo.src}
                    alt={tr(...photo.alt)}
                    width={300}
                    height={180}
                    className="w-full aspect-[5/3] object-cover rounded-[1.25rem]"
                  />
                  <figcaption className="absolute bottom-3 start-3 text-xs font-semibold px-3 py-1 rounded-full bg-black/55 on-media backdrop-blur">
                    {photoChips[i]}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="relative mt-10 mx-auto w-fit glass-effect-strong rounded-2xl px-5 py-3 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <span className="text-sm font-semibold text-fg">{tr('This is where we step in.', 'هنا يأتي دورنا.')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong max-w-6xl mx-auto rounded-3xl py-10 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 reveal">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                <CountUp value={stat.value} />
              </div>
              <div className="text-sm md:text-base text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Who we are ───────────── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <h2 className="text-3xl md:text-5xl font-bold text-fg mb-6">{tr('Who We Are', 'من نحن')}</h2>
          <p className="text-lg md:text-xl text-muted leading-relaxed mb-6">
            <span className="text-accent font-semibold">{tr('Future Vision Development', 'تطوير الرؤية المستقبلية')}</span>
            {tr(
              ' is an organization dedicated to high-quality services in insurance liability claims investigation, risk management, valuation, marine services and motor / non-motor handling.',
              ' مؤسسة تكرّس جهودها لتقديم خدمات عالية الجودة في التحقيق في مطالبات المسؤولية التأمينية وإدارة المخاطر والتقييم والخدمات البحرية ومعالجة مطالبات المركبات وغيرها.',
            )}
          </p>
          <p className="text-lg text-muted leading-relaxed">
            {tr(
              'From investigation to analysis and reporting, loss adjusting is about understanding the relationship between insurance services and the nature of the loss — maintaining good faith between insurers, customers and the policy that binds them together.',
              'من التحقيق إلى التحليل وإعداد التقارير، تسوية الخسائر تعني فهم العلاقة بين خدمات التأمين وطبيعة الخسارة، مع الحفاظ على حسن النية بين شركات التأمين والعملاء ووثيقة التأمين التي تجمعهم.',
            )}
          </p>
        </div>
      </section>

      {/* ───────────── Services ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={tr('What we do', 'ماذا نقدم')}
            title={tr('Our Services', 'خدماتنا')}
            sub={tr(
              'Bespoke, cost-effective claims handling for insurers, brokers, government bodies and private firms.',
              'معالجة مطالبات مصمّمة لكل حالة وبتكلفة مناسبة لشركات التأمين والوسطاء والجهات الحكومية والشركات الخاصة.',
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
              <div key={s.title[0]} className="glass-effect-strong card-lift p-7 rounded-3xl reveal" style={delay((i % 3) * 100)}>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={s.icon} size="w-14 h-14" />
                  <span className="text-xs font-mono text-muted opacity-60 ltr">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-lg font-semibold text-fg mb-2">{tr(...s.title)}</h3>
                <p className="text-muted text-sm leading-relaxed">{tr(...s.text)}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 reveal">
            <Link to="/services" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              {tr('How we handle a claim', 'كيف نعالج المطالبة')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Reporting framework ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect-strong rounded-[2rem] p-6 md:p-12 reveal">
            <div className="text-center mb-10">
              <div className="eyebrow glass-effect mb-4"><FileText className="h-4 w-4" />{tr('Reporting framework', 'إطار التقارير')}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-fg mb-3">{tr('You always know where your claim stands', 'تعرف دائماً أين وصلت مطالبتك')}</h2>
              <p className="text-muted max-w-2xl mx-auto">
                {tr('Every claim follows a clear schedule of reports, from inception to settlement.', 'تتبع كل مطالبة جدولاً واضحاً من التقارير، من بدايتها حتى تسويتها.')}
              </p>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {REPORT_STEPS.map((step, i) => (
                <li key={step.title[0]} className="glass-effect rounded-3xl p-6 relative">
                  <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center ltr shadow mb-4">{i + 1}</span>
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">{tr(...step.when)}</div>
                  <h3 className="text-lg font-semibold text-fg mb-2">{tr(...step.title)}</h3>
                  <p className="text-sm text-muted leading-relaxed">{tr(...step.text)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────────── Experience ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={tr('Track record', 'سجل الأعمال')}
            title={tr('Experience Across Every Line', 'خبرة في كل فروع التأمين')}
            sub={tr(
              'A selection of the claims and cases our team has handled for leading clients across Oman.',
              'نماذج من المطالبات والقضايا التي عالجها فريقنا لعملاء رائدين في أنحاء عُمان.',
            )}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {EXPERIENCE.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={e.title[0]} className="glass-effect card-lift rounded-3xl p-6 reveal" style={delay((i % 4) * 80)}>
                  <Icon className="h-8 w-8 text-accent mb-4" />
                  <div className="text-3xl font-bold text-gradient mb-1"><CountUp value={`${e.count}+`} /></div>
                  <div className="text-sm font-semibold text-fg">{tr(...e.title)}</div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10 reveal">
            <Link to="/experience" className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all">
              {tr('See clients and cases', 'شاهد العملاء والقضايا')} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── Why choose us ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={tr('How we can help you', 'كيف نساعدك')}
            title={tr('Why Choose Us', 'لماذا تختارنا')}
            sub={tr(
              'With Future Vision Development on your side, your claim is in the hands of professional loss assessors.',
              'مع تطوير الرؤية المستقبلية إلى جانبك، تكون مطالبتك بين أيدي مقيّمي خسائر محترفين.',
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REASONS.map((r, i) => (
              <div key={r.title[0]} className="glass-effect card-lift p-7 rounded-3xl flex gap-4 reveal" style={delay((i % 3) * 100)}>
                <IconTile icon={r.icon} />
                <div>
                  <h3 className="text-lg font-semibold text-fg mb-2">{tr(...r.title)}</h3>
                  <p className="text-muted text-sm leading-relaxed">{tr(...r.text)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Team teaser ───────────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect-strong rounded-[2rem] p-6 md:p-12 grid lg:grid-cols-5 gap-10 items-center reveal">
            <div className="lg:col-span-2">
              <div className="eyebrow glass-effect mb-5"><Users className="h-4 w-4" />{tr('Our team', 'فريقنا')}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Engineers ready to travel anywhere in the Sultanate', 'مهندسون جاهزون للانتقال إلى أي مكان في السلطنة')}</h2>
              <p className="text-muted leading-relaxed mb-6">
                {tr(
                  'Our Muscat and Salalah divisions bring together qualified engineers and trainees who are ready to attend any inspection, anywhere in Oman, as per instruction.',
                  'يضم فرعانا في مسقط وصلالة مهندسين مؤهلين ومتدربين جاهزين لحضور أي معاينة في أي مكان في عُمان حسب التكليف.',
                )}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {[tr('Muscat division', 'فرع مسقط'), tr('Salalah division', 'فرع صلالة')].map(d => (
                  <span key={d} className="glass-effect rounded-full px-4 py-1.5 text-sm text-fg inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-accent" />{d}
                  </span>
                ))}
              </div>
              <Link to="/team" className="btn-liquid">
                <span className="relative">{tr('Meet the team', 'تعرّف على الفريق')}</span>
                <ArrowRight className="relative h-5 w-5 rtl:rotate-180" />
              </Link>
            </div>
            <div className="lg:col-span-3 grid gap-4">
              {TEAM.map(m => (
                <Link key={m.name[0]} to="/team" className="glass-effect card-lift rounded-2xl p-5 flex items-center gap-4">
                  <span className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-white font-bold flex items-center justify-center ltr">
                    {m.name[0].replace('Engr. ', '').split(' ').slice(0, 2).map(p => p[0]).join('')}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-fg">{tr(...m.name)}</div>
                    <div className="text-sm text-muted">{tr(...m.role)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="glass-effect-strong relative overflow-hidden max-w-6xl mx-auto rounded-[2rem] px-6 py-16 md:py-20 text-center reveal">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40 bg-[radial-gradient(circle,var(--accent),transparent_65%)] pointer-events-none" />
          <Sparkles className="relative h-10 w-10 text-accent mx-auto mb-6" />
          <h2 className="relative text-3xl md:text-5xl font-bold text-fg mb-4">{tr('Have a claim to assess?', 'لديك مطالبة تحتاج إلى تقييم؟')}</h2>
          <p className="relative text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto">
            {tr(
              'We work on your behalf and make sure you receive the right response, in the best possible manner, based on the terms of your policy.',
              'نعمل نيابةً عنك ونضمن حصولك على الاستجابة المناسبة بأفضل طريقة ممكنة وفق شروط وثيقتك.',
            )}
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-liquid justify-center">
              <span className="relative">{tr('Contact Us', 'تواصل معنا')}</span>
              <ArrowRight className="relative h-5 w-5 rtl:rotate-180" />
            </Link>
            <a href={CONTACT.phoneLinks[1]} className="btn-glass glass-effect justify-center">
              <Phone className="h-4 w-4 text-accent" />
              <span className="ltr">{CONTACT.phones[1]}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
