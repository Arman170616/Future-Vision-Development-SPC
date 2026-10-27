import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const SITE_URL = 'https://futureinnvo.com';
const DEFAULT_IMAGE = `${SITE_URL}/brand/og-image.jpg`;

export interface SeoInput {
  /** Page title without the brand suffix */
  title?: string;
  description?: string;
  /** Absolute or site-relative image for link previews */
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Extra schema.org data for this page (Article, Course list, …) */
  jsonLd?: Record<string, unknown> | null;
}

const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setLink = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
};

/** Plain-text summary for meta descriptions (strips HTML / markdown, ~160 characters). */
export const summary = (text?: string | null, max = 160) => {
  const plain = (text ?? '').replace(/<[^>]+>/g, ' ').replace(/[#*_>`[\]]/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > max ? `${plain.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : plain;
};

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`);

/** Writes title, description, canonical, hreflang, Open Graph / Twitter tags and page JSON-LD. */
export function applySeo(seo: SeoInput, path: string, lang: 'en' | 'ar') {
  const brand = lang === 'ar' ? 'مستقبل الابتكار | FutureInnvo' : 'FutureInnvo SPC';
  const title = seo.title ? `${seo.title} | ${brand}` : document.title;
  const url = `${SITE_URL}${path}`;
  const image = absolute(seo.image || DEFAULT_IMAGE);

  document.title = title;
  if (seo.description) {
    setMeta('name', 'description', seo.description);
    setMeta('property', 'og:description', seo.description);
    setMeta('name', 'twitter:description', seo.description);
  }
  setMeta('name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  setMeta('property', 'og:title', title);
  setMeta('name', 'twitter:title', title);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', seo.type ?? 'website');
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:image', image);
  setMeta('property', 'og:locale', lang === 'ar' ? 'ar_OM' : 'en_US');
  setMeta('property', 'og:locale:alternate', lang === 'ar' ? 'en_US' : 'ar_OM');
  setLink('canonical', url);
  setLink('alternate', `${url}?lang=en`, 'en');
  setLink('alternate', `${url}?lang=ar`, 'ar');
  setLink('alternate', url, 'x-default');

  let script = document.getElementById('page-jsonld');
  if (seo.jsonLd) {
    if (!script) {
      script = document.createElement('script');
      script.id = 'page-jsonld';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', ...seo.jsonLd });
  } else {
    script?.remove();
  }
}

type Tr = (en: string, ar: string) => string;

/** SEO for the fixed pages; detail pages (project, post, job) add their own with useSeo once data loads. */
const routeSeo = (path: string, tr: Tr): SeoInput => {
  const pages: Record<string, SeoInput> = {
    '/': {
      title: tr('AI Solutions, Software & Training in Oman', 'حلول الذكاء الاصطناعي والبرمجيات والتدريب في عُمان'),
      description: tr(
        'FutureInnvo SPC builds AI agents, web & mobile apps, smart city and IoT solutions in Salalah, Oman — and runs hands-on AI training courses.',
        'مستقبل الابتكار تبني وكلاء الذكاء الاصطناعي وتطبيقات الويب والجوال وحلول المدن الذكية وإنترنت الأشياء في صلالة، عُمان — وتقدم دورات تدريبية عملية في الذكاء الاصطناعي.',
      ),
    },
    '/about': {
      title: tr('About Us — Mission & Vision', 'من نحن — رسالتنا ورؤيتنا'),
      description: tr(
        'Who we are: an Omani technology company in Salalah delivering AI, software and digital transformation — our mission, vision and company prospectus.',
        'تعرّف على مستقبل الابتكار: شركة تقنية عُمانية في صلالة تقدم حلول الذكاء الاصطناعي والبرمجيات والتحول الرقمي — رسالتنا ورؤيتنا وملف الشركة.',
      ),
    },
    '/projects': {
      title: tr('Projects & In-House AI Products', 'المشاريع ومنتجاتنا للذكاء الاصطناعي'),
      description: tr(
        'Client projects and our own products: AI agents, smart city platforms, inventory systems with AI chatbots, CV analysis and more.',
        'مشاريع العملاء ومنتجاتنا الخاصة: وكلاء ذكاء اصطناعي، منصات المدن الذكية، أنظمة مخزون بروبوت محادثة، تحليل السير الذاتية والمزيد.',
      ),
    },
    '/courses': {
      title: tr('AI & Technology Training Courses in Oman', 'دورات تدريبية في الذكاء الاصطناعي والتقنية في عُمان'),
      description: tr(
        'Hands-on training courses in AI, programming, data science and design — for students and professionals in Salalah and online. Prices in OMR.',
        'دورات تدريبية عملية في الذكاء الاصطناعي والبرمجة وعلوم البيانات والتصميم — للطلاب والمهنيين في صلالة وعن بُعد. الأسعار بالريال العُماني.',
      ),
    },
    '/blog': {
      title: tr('Blog — AI & Technology Insights', 'المدونة — مقالات الذكاء الاصطناعي والتقنية'),
      description: tr('News, guides and insights on AI, software and digital transformation from the FutureInnvo team.', 'أخبار وأدلة ورؤى حول الذكاء الاصطناعي والبرمجيات والتحول الرقمي من فريق مستقبل الابتكار.'),
    },
    '/team': {
      title: tr('Our Team', 'فريقنا'),
      description: tr('Meet the engineers, researchers and leaders behind FutureInnvo SPC.', 'تعرّف على المهندسين والباحثين والقادة في مستقبل الابتكار.'),
    },
    '/ceo-message': {
      title: tr('Message from the CEO', 'كلمة الرئيس التنفيذي'),
      description: tr('A message from the CEO of FutureInnvo SPC on our vision for AI and innovation in Oman.', 'كلمة الرئيس التنفيذي لمستقبل الابتكار حول رؤيتنا للذكاء الاصطناعي والابتكار في عُمان.'),
    },
    '/activities': {
      title: tr('Activities & Events', 'الأنشطة والفعاليات'),
      description: tr('Workshops, events and community activities by FutureInnvo SPC.', 'ورش العمل والفعاليات والأنشطة المجتمعية لمستقبل الابتكار.'),
    },
    '/gallery': {
      title: tr('Gallery', 'معرض الصور'),
      description: tr('Photos from our projects, training courses and events.', 'صور من مشاريعنا ودوراتنا التدريبية وفعالياتنا.'),
    },
    '/jobs': {
      title: tr('Job Openings — Careers at FutureInnvo', 'الوظائف الشاغرة — انضم إلى مستقبل الابتكار'),
      description: tr('Open positions in AI, software engineering and more at FutureInnvo SPC in Oman.', 'الوظائف المتاحة في الذكاء الاصطناعي وهندسة البرمجيات وغيرها لدى مستقبل الابتكار في عُمان.'),
    },
    '/career': {
      title: tr('Careers', 'الوظائف'),
      description: tr('Build the future with us — careers and internships at FutureInnvo SPC.', 'اصنع المستقبل معنا — الوظائف والتدريب لدى مستقبل الابتكار.'),
    },
    '/contact': {
      title: tr('Contact Us — Salalah, Oman', 'تواصل معنا — صلالة، عُمان'),
      description: tr(
        'Talk to FutureInnvo SPC: info@futureinnvo.com · Al Shadaah City Mall, Salalah, Oman.',
        'تواصل مع مستقبل الابتكار: info@futureinnvo.com · مجمع الشدح سيتي مول، صلالة، عُمان.',
      ),
    },
    '/privacy': {
      title: tr('Privacy Policy', 'سياسة الخصوصية'),
      description: tr('How FutureInnvo SPC collects and protects your personal data.', 'كيف تجمع مستقبل الابتكار بياناتك الشخصية وتحميها.'),
    },
  };
  if (pages[path]) return pages[path];
  if (/^\/(register|apply)(\/|$)/.test(path)) return { title: tr('Registration', 'التسجيل'), noindex: true };
  if (/^\/(projects|blog|jobs|courses)\/[^/]+$/.test(path)) return { ...pages[`/${path.split('/')[1]}`] };
  return { title: tr('Page not found', 'الصفحة غير موجودة'), noindex: true };
};

/** Mounted once in App: resets SEO for every route before pages add their own details. */
export function SeoManager() {
  const { pathname } = useLocation();
  const { lang, tr } = useLanguage();
  // Layout effect: runs before the pages' (passive) useSeo effects, so detail pages always win
  useLayoutEffect(() => {
    applySeo(routeSeo(pathname.replace(/\/+$/, '') || '/', tr), pathname, lang);
  }, [pathname, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Page-specific SEO (project, blog post, job): call with data once it has loaded. */
export function useSeo(seo: SeoInput | null) {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  const key = JSON.stringify(seo);
  useEffect(() => {
    if (seo) applySeo(seo, pathname, lang);
  }, [key, pathname, lang]); // eslint-disable-line react-hooks/exhaustive-deps
}
