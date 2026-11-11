import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { EXPERIENCE, TOTAL_CASES } from '../data/company';

const delay = (ms: number) => ({ '--delay': `${ms}ms` } as CSSProperties);

const Experience = () => {
  const { tr } = useLanguage();
  const pageRef = useReveal<HTMLDivElement>();
  const max = Math.max(...EXPERIENCE.map(e => e.count));

  return (
    <div ref={pageRef} className="pb-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14 text-center">
        <div className="eyebrow glass-effect mb-6 animate-slide-in">
          <BarChart3 className="h-4 w-4" />
          {tr('Experience Note', 'مذكرة الخبرة')}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight mb-6 animate-slide-in">
          <span className="text-gradient ltr">{TOTAL_CASES}+</span> {tr('claims and cases handled', 'مطالبة وقضية تمت معالجتها')}
        </h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed animate-slide-in">
          {tr(
            'More than 7 years in insurance and loss adjusting, across marine, engineering, property, fire and motor — for some of the most prestigious clients in Oman.',
            'أكثر من 7 سنوات في التأمين وتسوية الخسائر في المجالات البحرية والهندسية والممتلكات والحريق والمركبات — لعدد من أبرز العملاء في عُمان.',
          )}
        </p>
      </section>

      {/* Overview bars */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="glass-effect-strong rounded-[2rem] p-6 md:p-10 reveal">
          <h2 className="text-xl font-bold text-fg mb-6">{tr('Cases by line of insurance', 'القضايا حسب فرع التأمين')}</h2>
          <ul className="space-y-4">
            {[...EXPERIENCE].sort((a, b) => b.count - a.count).map(e => (
              <li key={e.title[0]} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] sm:grid-cols-[14rem_1fr_auto] items-center gap-3">
                <span className="text-sm text-fg truncate">{tr(...e.title)}</span>
                <span className="h-3 rounded-full bg-[rgba(var(--accent-rgb),0.12)] overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] rtl:bg-gradient-to-l"
                    style={{ width: `${(e.count / max) * 100}%` }}
                  />
                </span>
                <span className="text-sm font-bold text-accent ltr w-10 text-end">{e.count}+</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Detail cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-5">
          {EXPERIENCE.map((e, i) => {
            const Icon = e.icon;
            return (
              <article key={e.title[0]} className="glass-effect-strong card-lift rounded-3xl p-7 reveal" style={delay((i % 2) * 120)}>
                <div className="flex items-start gap-4 mb-5">
                  <span className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.25)]">
                    <Icon className="h-7 w-7 text-accent" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-fg">{tr(...e.title)}</h2>
                    {e.detail && <p className="text-sm text-muted">{tr(...e.detail)}</p>}
                  </div>
                  <span className="text-3xl font-bold text-gradient ltr">{e.count}+</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {e.detail && e.title[0] === 'Vessel' ? tr('Locations & cases', 'المواقع والحالات') : tr('Prestigious clients', 'أبرز العملاء')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tr(...e.clients).split(/,\s*|،\s*/).map(client => (
                    <span key={client} className="glass-effect rounded-full px-3 py-1 text-sm text-fg">{client}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong rounded-[2rem] px-6 py-14 md:py-16 text-center reveal">
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Put our experience to work', 'استفد من خبرتنا')}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            {tr('Download the full experience note, or contact us to discuss your claim.', 'حمّل مذكرة الخبرة كاملة، أو تواصل معنا لمناقشة مطالبتك.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-liquid justify-center">
              <span className="relative">{tr('Contact Us', 'تواصل معنا')}</span>
              <ArrowRight className="relative h-5 w-5" />
            </Link>
            <a href="/brochure/future-vision-experience-note.pdf" download="Future-Vision-Experience-Note.pdf" className="btn-glass glass-effect justify-center">
              <Download className="h-5 w-5 text-accent" />
              {tr('Experience Note (PDF)', 'مذكرة الخبرة (PDF)')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Experience;
