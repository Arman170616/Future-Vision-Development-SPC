import { useEffect, useRef, useState } from 'react';
import { BookOpenText, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/** Company prospectus (public/brochure): the PDF plus one JPG per page, rendered from the PDF. */
const PDF_URL = '/brochure/futureinnvo-programs.pdf';
const PAGE_COUNT = 10;
const pageUrl = (n: number) => `/brochure/page-${String(n).padStart(2, '0')}.jpg`;

const Brochure = () => {
  const { tr, isRTL } = useLanguage();
  const [page, setPage] = useState<number | null>(null); // open page (1-based), null = closed
  const touchX = useRef<number | null>(null);

  // What's inside: page numbers as laid out in the PDF
  const contents = [
    { page: 2, title: tr('About us, vision, mission & values', 'من نحن، الرؤية، الرسالة والقيم') },
    { page: 3, title: tr('AI for Senior Leadership', 'الذكاء الاصطناعي للقيادات العليا') },
    { page: 4, title: tr('AI in the Workplace', 'الذكاء الاصطناعي في بيئة العمل') },
    { page: 5, title: tr('AI in Scientific Research', 'الذكاء الاصطناعي في البحث العلمي') },
    { page: 6, title: tr('AI Foundations Program', 'البرنامج التأسيسي في الذكاء الاصطناعي') },
    { page: 7, title: tr('AI for Organizations & Entrepreneurs', 'الذكاء الاصطناعي لخدمة المؤسسات ورواد الأعمال') },
    { page: 8, title: tr('AI in Customer Service', 'الذكاء الاصطناعي في خدمة العملاء') },
    { page: 9, title: tr('AI in Administrative Coordination', 'الذكاء الاصطناعي في التنسيق والمتابعة الإدارية') },
    { page: 10, title: tr('Training methods, benefits & contact', 'أساليب التدريب والمزايا والتواصل') },
  ];

  const go = (delta: number) => setPage(p => (p === null ? p : Math.min(PAGE_COUNT, Math.max(1, p + delta))));

  useEffect(() => {
    if (page === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPage(null);
      // Arrow keys follow reading direction
      if (e.key === 'ArrowRight') go(isRTL ? -1 : 1);
      if (e.key === 'ArrowLeft') go(isRTL ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [page, isRTL]);

  // Preload neighbours so page turns feel instant
  useEffect(() => {
    if (page === null) return;
    [page - 1, page + 1].filter(n => n >= 1 && n <= PAGE_COUNT).forEach(n => {
      const img = new Image();
      img.src = pageUrl(n);
    });
  }, [page]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="glass-effect-strong rounded-[2rem] p-6 md:p-10 grid lg:grid-cols-5 gap-10 items-center reveal">
        {/* Cover */}
        <button
          type="button"
          onClick={() => setPage(1)}
          className="lg:col-span-2 group relative mx-auto w-full max-w-xs [perspective:1200px]"
          aria-label={tr('Open the company prospectus', 'فتح الملف التعريفي للشركة')}
        >
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-[rgba(var(--accent-rgb),0.18)]" aria-hidden />
          <img
            src={pageUrl(1)}
            alt={tr('FutureInnvo company prospectus — cover', 'الملف التعريفي لشركة FutureInnvo — الغلاف')}
            loading="lazy"
            className="relative w-full rounded-xl shadow-2xl ring-1 ring-black/5 transition-transform duration-500 group-hover:[transform:rotateY(-8deg)_scale(1.02)]"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold on-media backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
            <BookOpenText className="h-4 w-4" />
            {tr('Read', 'تصفّح')}
          </span>
        </button>

        {/* Description + contents */}
        <div className="lg:col-span-3">
          <div className="eyebrow glass-effect mb-4">
            <FileText className="h-4 w-4" />
            {tr('Company Prospectus', 'الملف التعريفي')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-3">
            {tr('Our AI Training Programs Guide', 'دليل البرامج التدريبية في الذكاء الاصطناعي')}
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            {tr(
              'Discover who we are and explore our accredited AI training programs — objectives, topics, audience and duration for each program. The prospectus is in Arabic.',
              'تعرّف على شركتنا واستكشف برامجنا التدريبية المعتمدة في الذكاء الاصطناعي، مع أهداف كل برنامج ومحاوره والفئة المستهدفة ومدته.'
            )}
          </p>

          <ol className="grid sm:grid-cols-2 gap-2 mb-8">
            {contents.map(item => (
              <li key={item.page}>
                <button
                  type="button"
                  onClick={() => setPage(item.page)}
                  className="w-full text-start flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[rgba(var(--accent-rgb),0.08)] transition-colors"
                >
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-[rgba(var(--accent-rgb),0.12)] text-accent text-xs font-bold flex items-center justify-center ltr">
                    {item.page}
                  </span>
                  <span className="text-sm text-fg">{item.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => setPage(1)} className="btn-liquid justify-center">
              <BookOpenText className="relative h-5 w-5" />
              <span className="relative">{tr('View Prospectus', 'تصفّح الملف التعريفي')}</span>
            </button>
            <a href={PDF_URL} download="FutureInnvo-Programs.pdf" className="btn-glass glass-effect justify-center">
              <Download className="h-5 w-5 text-accent" />
              {tr('Download PDF', 'تحميل PDF')}
              <span className="text-xs text-muted ltr">4 MB</span>
            </a>
          </div>
        </div>
      </div>

      {/* Page viewer */}
      {page !== null && (
        <div
          className="fixed inset-0 z-[70] flex flex-col bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={tr('Company prospectus', 'الملف التعريفي')}
          onClick={() => setPage(null)}
        >
          <div className="flex items-center gap-3 px-4 py-3 on-media" onClick={e => e.stopPropagation()}>
            <span className="text-sm font-semibold ltr">{page} / {PAGE_COUNT}</span>
            <div className="ms-auto flex items-center gap-2">
              <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 hover:bg-white/20 p-2.5" title={tr('Open PDF', 'فتح PDF')}>
                <ExternalLink className="h-5 w-5" />
              </a>
              <a href={PDF_URL} download="FutureInnvo-Programs.pdf" className="rounded-full bg-white/10 hover:bg-white/20 p-2.5" title={tr('Download PDF', 'تحميل PDF')}>
                <Download className="h-5 w-5" />
              </a>
              <button type="button" onClick={() => setPage(null)} className="rounded-full bg-white/10 hover:bg-white/20 p-2.5" aria-label={tr('Close', 'إغلاق')}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 min-h-0 flex items-center justify-center px-14 pb-4"
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go((dx < 0) !== isRTL ? 1 : -1);
              touchX.current = null;
            }}
          >
            <img
              key={page}
              src={pageUrl(page)}
              alt={tr(`Prospectus page ${page}`, `الصفحة ${page} من الملف التعريفي`)}
              onClick={e => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg bg-white shadow-2xl animate-slide-in"
            />
            {/* Previous / next — chevrons are mirrored in RTL by the global icon rule */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); go(-1); }}
              disabled={page <= 1}
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-30 p-3 on-media"
              aria-label={tr('Previous page', 'الصفحة السابقة')}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); go(1); }}
              disabled={page >= PAGE_COUNT}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/25 disabled:opacity-30 p-3 on-media"
              aria-label={tr('Next page', 'الصفحة التالية')}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Page dots */}
          <div className="flex justify-center gap-1.5 pb-5" onClick={e => e.stopPropagation()}>
            {Array.from({ length: PAGE_COUNT }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-2 rounded-full transition-all ${n === page ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                aria-label={tr(`Go to page ${n}`, `الانتقال إلى الصفحة ${n}`)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Brochure;
