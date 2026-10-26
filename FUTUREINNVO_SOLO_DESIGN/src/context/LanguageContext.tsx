import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Lang, Translation } from '../i18n/translations';
import { term } from '../i18n/terms';

interface LanguageContextType {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  t: Translation;
  toggleLang: () => void;
  /** Inline bilingual string: tr('Apply now', 'قدّم الآن') */
  tr: (en: string, ar: string) => string;
  /** Translate an API enum value (level, job type, status …); unknown values pass through. */
  tt: (value: string | number | undefined | null) => string;
  /** Locale-aware date formatting (Arabic uses Gregorian calendar, Latin digits). */
  fmtDate: (value: string | number | Date | undefined | null, options?: Intl.DateTimeFormatOptions) => string;
  /** Course prices in Omani rial: 3 decimals (baisa) — "OMR 449.000" / "449.000 ر.ع." */
  fmtPrice: (value: number | string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const readSaved = (): Lang => {
  // ?lang=ar / ?lang=en wins, so language-specific links can be shared
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'ar' || fromUrl === 'en') return fromUrl;
  try {
    const saved = localStorage.getItem('fi-lang');
    return saved === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(readSaved);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', dir);
    try {
      localStorage.setItem('fi-lang', lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir]);

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  const tr = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const tt = (value: string | number | undefined | null) => term(value == null ? value : String(value), lang);
  const fmtDate = (value: string | number | Date | undefined | null, options?: Intl.DateTimeFormatOptions) => {
    if (value === undefined || value === null || value === '') return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US', options ?? { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtPrice = (value: number | string | undefined | null) => {
    const amount = Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    // The Arabic symbol is isolated (RLI…PDI) so it keeps its own right-to-left order inside LTR price boxes
    return lang === 'ar' ? `${amount} \u2067ر.ع.\u2069` : `OMR ${amount}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, isRTL: dir === 'rtl', t: translations[lang], toggleLang, tr, tt, fmtDate, fmtPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
