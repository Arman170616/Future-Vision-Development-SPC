import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const link = 'text-muted hover:text-accent transition-colors duration-200';

  const quickLinks: [string, string][] = [
    [t.nav.aboutUs,    '/about'],
    [t.nav.projects,   '/projects'],
    [t.nav.team,       '/team'],
    [t.nav.activities, '/activities'],
    [t.nav.blog,       '/blog'],
    [t.nav.ceoMessage, '/ceo-message'],
    [t.nav.career,     '/career'],
    [t.nav.contact,    '/contact'],
  ];

  return (
    <footer className="px-3 sm:px-6 pb-6 mt-10">
      <div className="glass-effect-strong max-w-7xl mx-auto rounded-3xl px-6 sm:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.svg" alt="FUTUREINNVO Logo" className="h-8 w-auto logo-hover" />
              <span className="text-xl font-bold text-fg">{t.brand}</span>
            </div>
            <p className="text-muted max-w-md leading-relaxed">{t.footer.about}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className={link}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t.footer.contactInfo}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-muted ltr">+968 7111 1040</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="mailto:info@futureinnvo.com" className={`ltr ${link}`}>info@futureinnvo.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-muted">{t.footer.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(var(--accent-rgb),0.15)] mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-muted">{t.footer.rights}</p>
            <div className="flex gap-5">
              <a href="/privacy" className={`text-sm ${link}`}>{t.footer.privacy}</a>
              <a href="/privacy#terms-of-service" className={`text-sm ${link}`}>{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
