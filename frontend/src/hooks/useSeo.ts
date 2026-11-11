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
  const brand = lang === 'ar' ? 'تطوير الرؤية المستقبلية' : 'Future Vision Development SPC';
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

/** SEO for the fixed pages; detail pages (post, job) add their own with useSeo once data loads. */
const routeSeo = (path: string, tr: Tr): SeoInput => {
  const pages: Record<string, SeoInput> = {
    '/': {
      title: tr('Loss Adjusters & Insurance Claims in Oman', 'تسوية الخسائر ومطالبات التأمين في عُمان'),
      description: tr(
        'Future Vision Development SPC: independent loss adjusting, insurance claims investigation, risk management, valuation and marine cargo surveys in Muscat, Salalah and across Oman.',
        'تطوير الرؤية المستقبلية: تسوية خسائر مستقلة، تحقيق في مطالبات التأمين، إدارة المخاطر، التقييم ومعاينة البضائع البحرية في مسقط وصلالة وجميع أنحاء عُمان.',
      ),
    },
    '/about': {
      title: tr('About Us — Mission & Values', 'من نحن — رسالتنا وقيمنا'),
      description: tr(
        'Independent loss adjusters with 7+ years of experience in Oman. Our mission, values and company profile.',
        'مسوّو خسائر مستقلون بخبرة تتجاوز 7 سنوات في عُمان. رسالتنا وقيمنا وملفنا التعريفي.',
      ),
    },
    '/services': {
      title: tr('Services — Loss Adjusting, Marine, Valuation & Risk', 'الخدمات — تسوية الخسائر والبحري والتقييم والمخاطر'),
      description: tr(
        "Insurance claims, marine cargo and haulier's liability, quality assurance reports, loss adjusting, property valuation, risk assessment, repair assessment and dispute handling.",
        'مطالبات التأمين، البضائع البحرية ومسؤولية الناقل، تقارير ضمان الجودة، تسوية الخسائر، تقييم الممتلكات، تقييم المخاطر، تقييم الإصلاحات وتسوية النزاعات.',
      ),
    },
    '/experience': {
      title: tr('Experience — Claims & Clients', 'خبراتنا — المطالبات والعملاء'),
      description: tr(
        "190+ claims handled: haulier's liability, marine, vessels, contractor's risk, engineering, pre-risk inspections, fire & perils and motor valuation.",
        'أكثر من 190 مطالبة: مسؤولية الناقل، البحري، السفن، مخاطر المقاولين، الهندسة، معاينات ما قبل التأمين، الحريق والأخطار وتقييم المركبات.',
      ),
    },
    '/blog': {
      title: tr('Insights — Claims & Risk', 'مقالات — المطالبات والمخاطر'),
      description: tr('News and insights on insurance claims, loss adjusting and risk management in Oman.', 'أخبار ورؤى حول مطالبات التأمين وتسوية الخسائر وإدارة المخاطر في عُمان.'),
    },
    '/team': {
      title: tr('Our Team', 'فريقنا'),
      description: tr('Meet the engineers and loss adjusters of Future Vision Development SPC.', 'تعرّف على مهندسي ومسوّي الخسائر في تطوير الرؤية المستقبلية.'),
    },
    '/activities': {
      title: tr('Activities & Events', 'الأنشطة والفعاليات'),
      description: tr('News, site visits and events from Future Vision Development SPC.', 'أخبار وزيارات ميدانية وفعاليات من تطوير الرؤية المستقبلية.'),
    },
    '/gallery': {
      title: tr('Gallery', 'معرض الصور'),
      description: tr('Photos from our inspections, surveys and events.', 'صور من معايناتنا ومسوحاتنا وفعالياتنا.'),
    },
    '/jobs': {
      title: tr('Job Openings', 'الوظائف الشاغرة'),
      description: tr('Open positions for engineers, loss adjusters and trainees in Oman.', 'وظائف متاحة للمهندسين ومسوّي الخسائر والمتدربين في عُمان.'),
    },
    '/career': {
      title: tr('Careers', 'الوظائف'),
      description: tr('Build your career in loss adjusting and claims analysis with Future Vision Development SPC.', 'ابنِ مسيرتك في تسوية الخسائر وتحليل المطالبات مع تطوير الرؤية المستقبلية.'),
    },
    '/contact': {
      title: tr('Contact Us — Report a Claim', 'تواصل معنا — أبلغ عن مطالبة'),
      description: tr(
        'Call +968 9212 2631 / +968 9221 2195 or email info.futurevisiondev@gmail.com. P.O. Box 111, PC 112, Ruwi, Muscat.',
        'اتصل على ‎+968 9212 2631 / +968 9221 2195 أو راسلنا على info.futurevisiondev@gmail.com. ص.ب 111، الرمز البريدي 112، روي، مسقط.',
      ),
    },
    '/privacy': {
      title: tr('Privacy Policy', 'سياسة الخصوصية'),
      description: tr('How Future Vision Development SPC collects and protects your personal data.', 'كيف تجمع تطوير الرؤية المستقبلية بياناتك الشخصية وتحميها.'),
    },
  };
  if (pages[path]) return pages[path];
  if (/^\/apply(\/|$)/.test(path)) return { title: tr('Application', 'التقديم'), noindex: true };
  if (/^\/(blog|jobs)\/[^/]+$/.test(path)) return { ...pages[`/${path.split('/')[1]}`] };
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
