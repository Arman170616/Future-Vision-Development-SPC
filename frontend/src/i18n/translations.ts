const en = {
  brand: 'Future Vision Development',
  brandShort: 'Future Vision',
  tagline: 'Loss Adjusting · Insurance Claims · Risk Management · Evaluation & Marine Analysis',
  nav: {
    home: 'Home',
    about: 'About',
    aboutUs: 'About Us',
    services: 'Services',
    experience: 'Experience',
    team: 'Our Team',
    activities: 'Activities',
    blog: 'Insights',
    jobs: 'Jobs',
    career: 'Careers',
    contact: 'Contact',
    switchLang: 'العربية',
    switchLangShort: 'ع',
    lightMode: 'Switch to light mode',
    darkMode: 'Switch to dark mode',
  },
  footer: {
    about:
      'Independent loss adjusters and claims analysts in the Sultanate of Oman. Bespoke, cost-effective claims handling with technical excellence, transparency and integrity at the core.',
    quickLinks: 'Quick Links',
    contactInfo: 'Contact Info',
    location: 'P.O. Box 111, PC 112, Ruwi, MBD, Muscat, Sultanate of Oman',
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
  },
};

export type Translation = typeof en;

const ar: Translation = {
  brand: 'تطوير الرؤية المستقبلية',
  brandShort: 'الرؤية المستقبلية',
  tagline: 'تسوية الخسائر · مطالبات التأمين · إدارة المخاطر · التقييم والتحليل البحري',
  nav: {
    home: 'الرئيسية',
    about: 'من نحن',
    aboutUs: 'عن الشركة',
    services: 'خدماتنا',
    experience: 'خبراتنا',
    team: 'فريقنا',
    activities: 'الأنشطة',
    blog: 'مقالات',
    jobs: 'الوظائف',
    career: 'التوظيف',
    contact: 'تواصل معنا',
    switchLang: 'English',
    switchLangShort: 'EN',
    lightMode: 'التبديل إلى الوضع الفاتح',
    darkMode: 'التبديل إلى الوضع الداكن',
  },
  footer: {
    about:
      'مسوّو خسائر ومحللو مطالبات مستقلون في سلطنة عُمان. نقدّم خدمات معالجة مطالبات مصمّمة لكل حالة وبتكلفة مناسبة، أساسها التميّز الفني والشفافية والنزاهة.',
    quickLinks: 'روابط سريعة',
    contactInfo: 'معلومات التواصل',
    location: 'ص.ب 111، الرمز البريدي 112، روي، منطقة مسقط التجارية، سلطنة عُمان',
    rights: 'جميع الحقوق محفوظة.',
    privacy: 'سياسة الخصوصية',
    terms: 'شروط الخدمة',
  },
};

export type Lang = 'en' | 'ar';

export const translations: Record<Lang, Translation> = { en, ar };
