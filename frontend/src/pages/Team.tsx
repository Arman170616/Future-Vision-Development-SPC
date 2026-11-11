import { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, GraduationCap, BadgeCheck, CheckCircle2, MapPin, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';
import { TEAM } from '../data/company';

const delay = (ms: number) => ({ '--delay': `${ms}ms` } as CSSProperties);

const initials = (name: string) =>
  name.replace(/^Engr\.\s+/, '').split(/\s+/).slice(0, 2).map(p => p[0]).join('');

const Team = () => {
  const { tr } = useLanguage();
  const pageRef = useReveal<HTMLDivElement>();

  return (
    <div ref={pageRef} className="pb-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14 text-center">
        <div className="eyebrow glass-effect mb-6 animate-slide-in">
          <Users className="h-4 w-4" />
          {tr('Our Team', 'فريقنا')}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-fg leading-tight mb-6 animate-slide-in">
          {tr('A fully qualified team of ', 'فريق مؤهل بالكامل من ')}
          <span className="text-gradient">{tr('engineers & adjusters', 'المهندسين والمسوّين')}</span>
        </h1>
        <p className="text-lg md:text-xl text-muted leading-relaxed animate-slide-in">
          {tr(
            'Diverse in their fields, our people bring scientific knowledge and sound assessment to every job, whatever the challenge — from our Muscat and Salalah divisions to any site in the Sultanate.',
            'يتنوّع أعضاء فريقنا في تخصصاتهم، ويقدّمون المعرفة العلمية والتقييم الدقيق في كل مهمة مهما كانت التحديات — من فرعَي مسقط وصلالة إلى أي موقع في السلطنة.',
          )}
        </p>
      </section>

      {/* Members */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-6">
          {TEAM.map((m, i) => (
            <article key={m.name[0]} className="glass-effect-strong card-lift rounded-3xl p-7 flex flex-col reveal" style={delay(i * 120)}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 shrink-0 rounded-full p-1 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-lg">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-[color:var(--bg)] text-2xl font-bold ltr">
                    <span className="text-gradient">{initials(m.name[0])}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-fg">{tr(...m.name)}</h2>
                  <p className="text-sm text-accent font-medium">{tr(...m.role)}</p>
                </div>
              </div>

              <div className="space-y-5 text-sm flex-1">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-fg mb-1.5"><GraduationCap className="h-4 w-4 text-accent" />{tr('Academic qualification', 'المؤهل الأكاديمي')}</h3>
                  <p className="text-muted leading-relaxed">{tr(...m.education)}</p>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-fg mb-1.5"><BadgeCheck className="h-4 w-4 text-accent" />{tr('Professional qualification', 'المؤهل المهني')}</h3>
                  <ul className="text-muted space-y-1 leading-relaxed">
                    {m.qualifications.map(q => <li key={q[0]}>{tr(...q)}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-fg mb-1.5"><Briefcase className="h-4 w-4 text-accent" />{tr('Work experience', 'الخبرة العملية')}</h3>
                  <ul className="text-muted space-y-1 leading-relaxed">
                    {m.work.map(w => <li key={w[0]}>{tr(...w)}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-fg mb-2">{tr('Areas of experience', 'مجالات الخبرة')}</h3>
                  <ul className="space-y-1.5">
                    {m.areas.map(a => (
                      <li key={a[0]} className="flex items-start gap-2 text-muted">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span>{tr(...a)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Divisions + CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-effect-strong rounded-[2rem] px-6 py-14 md:py-16 text-center reveal">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[tr('Muscat division', 'فرع مسقط'), tr('Salalah division', 'فرع صلالة')].map(d => (
              <span key={d} className="glass-effect rounded-full px-4 py-1.5 text-sm text-fg inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" />{d}
              </span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">{tr('Want to join the team?', 'هل تريد الانضمام إلى الفريق؟')}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            {tr('We welcome engineers and trainees interested in loss adjusting and claims analysis.', 'نرحّب بالمهندسين والمتدربين المهتمين بتسوية الخسائر وتحليل المطالبات.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="btn-liquid justify-center">
              <span className="relative">{tr('Open Positions', 'الوظائف المتاحة')}</span>
              <ArrowRight className="relative h-5 w-5" />
            </Link>
            <Link to="/contact" className="btn-glass glass-effect justify-center">{tr('Contact Us', 'تواصل معنا')}</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;
