import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, FileText, Search, ClipboardList, Calculator, FileCheck2, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { CONTACT, REASONS, REPORT_STEPS, SERVICES } from '../data/company';

const delay = (ms: number) => ({ '--delay': `${ms}ms` } as CSSProperties);

const Services = () => {
  const { tr } = useLanguage();
  const pageRef = useReveal<HTMLDivElement>();

  const process = [
    { icon: Phone, title: tr('Instruction', 'التكليف'), text: tr('The insurer, broker or client instructs us; an adjuster is assigned as your single point of contact.', 'تكلّفنا شركة التأمين أو الوسيط أو العميل، ويُعيَّن مسوٍّ ليكون نقطة تواصلك الوحيدة.') },
    { icon: Search, title: tr('Inspection', 'المعاينة'), text: tr('Our engineers attend the site anywhere in the Sultanate to investigate the cause and extent of the loss.', 'يحضر مهندسونا إلى الموقع في أي مكان بالسلطنة للتحقيق في سبب الخسارة ومداها.') },
    { icon: ClipboardList, title: tr('Policy analysis', 'تحليل الوثيقة'), text: tr('We review the policy terms, coverage and conditions that apply to this specific claim.', 'نراجع شروط الوثيقة والتغطية والاستثناءات المطبّقة على هذه المطالبة تحديداً.') },
    { icon: Calculator, title: tr('Quantum & cost control', 'تقدير القيمة وضبط التكلفة'), text: tr('Repair estimates, valuations and budgets are assessed and monitored to keep costs fair.', 'نقيّم تقديرات الإصلاح والتقييمات والميزانيات ونتابعها لضمان تكاليف عادلة.') },
    { icon: FileCheck2, title: tr('Reporting & settlement', 'التقارير والتسوية'), text: tr('Primary, update and final reports lead the claim to a proper, dispute-free closure.', 'التقارير الأولية والمرحلية والنهائية تقود المطالبة إلى إغلاق سليم دون نزاعات.') },
  ];

  return (
    <div ref={pageRef} className="pb-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
        <div className="eyebrow glass-effect mb-6 animate-slide-in">
          <Layers className="h-4 w-4" />
          {tr('Our Services', 'خدماتنا')}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight mb-6 animate-slide-in">
          {tr('Complete claims support, ', 'دعم متكامل للمطالبات، ')}
          <span className="text-gradient">{tr('from inspection to settlement', 'من المعاينة حتى التسوية')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed animate-slide-in">
          {tr(
            'Loss adjusting, claim solving, marine cargo and transport assessments, motor vehicle claims and risk management — independent, full-fledged analysis reports tailored to the policy and to each claim.',
            'تسوية الخسائر وحل المطالبات وتقييم البضائع والنقل البحري ومطالبات المركبات وإدارة المخاطر — تقارير تحليل مستقلة وشاملة مصمّمة وفق الوثيقة ولكل مطالبة.',
          )}
        </p>
      </section>

      {/* Services grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <article key={s.title[0]} className="glass-effect-strong card-lift rounded-3xl p-7 flex flex-col reveal" style={delay((i % 3) * 100)}>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.25)]">
                    <Icon className="h-7 w-7 text-accent" />
                  </span>
                  <span className="text-xs font-mono text-muted opacity-60 ltr">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h2 className="text-xl font-semibold text-fg mb-2">{tr(...s.title)}</h2>
                <p className="text-muted leading-relaxed">{tr(...s.text)}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-effect-strong rounded-[2rem] p-8 md:p-12 reveal">
          <div className="text-center mb-10">
            <div className="eyebrow glass-effect mb-4">{tr('How we work', 'كيف نعمل')}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-fg">{tr('The life of a claim with us', 'رحلة المطالبة معنا')}</h2>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {process.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="text-center">
                <div className="relative inline-flex mb-4">
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.2)]">
                    <Icon className="h-7 w-7 text-accent" />
                  </span>
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center ltr shadow">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Reports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12 reveal">
          <div className="eyebrow glass-effect mb-4"><FileText className="h-4 w-4" />{tr('Reporting framework', 'إطار التقارير')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-3">{tr('Three reports, one clear timeline', 'ثلاثة تقارير وجدول زمني واضح')}</h2>
        </div>
        <ol className="relative grid md:grid-cols-3 gap-6">
          {REPORT_STEPS.map((step, i) => (
            <li key={step.title[0]} className="glass-effect-strong card-lift rounded-3xl p-7 reveal" style={delay(i * 120)}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-full bg-[var(--accent)] text-white font-bold flex items-center justify-center ltr shadow">{i + 1}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">{tr(...step.when)}</span>
              </div>
              <h3 className="text-lg font-semibold text-fg mb-2">{tr(...step.title)}</h3>
              <p className="text-sm text-muted leading-relaxed">{tr(...step.text)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12 reveal">
          <div className="eyebrow glass-effect mb-4">{tr('Why choose us', 'لماذا تختارنا')}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-fg">{tr('What you can expect', 'ما يمكنك توقّعه')}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={r.title[0]} className="glass-effect card-lift rounded-3xl p-6 reveal" style={delay((i % 3) * 100)}>
                <Icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-fg mb-2">{tr(...r.title)}</h3>
                <p className="text-sm text-muted leading-relaxed">{tr(...r.text)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong rounded-[2rem] px-6 py-14 md:py-16 text-center reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Need an adjuster on site?', 'تحتاج إلى مسوٍّ في الموقع؟')}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            {tr('Send us the claim details and we will assign an engineer right away.', 'أرسل لنا تفاصيل المطالبة وسنكلّف مهندساً على الفور.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-liquid justify-center">
              <span className="relative">{tr('Report a Claim', 'أبلغ عن مطالبة')}</span>
              <ArrowRight className="relative h-5 w-5" />
            </Link>
            <a href={CONTACT.phoneLinks[0]} className="btn-glass glass-effect justify-center">
              <Phone className="h-4 w-4 text-accent" />
              <span className="ltr">{CONTACT.phones[0]}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
