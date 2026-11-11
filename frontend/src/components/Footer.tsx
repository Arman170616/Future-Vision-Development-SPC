import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CONTACT } from '../data/company';

const Footer = () => {
  const { t, tr } = useLanguage();

  const link = 'text-muted hover:text-accent transition-colors duration-200';

  const quickLinks: [string, string][] = [
    [t.nav.aboutUs,    '/about'],
    [t.nav.services,   '/services'],
    [t.nav.experience, '/experience'],
    [t.nav.team,       '/team'],
    [t.nav.blog,       '/blog'],
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
              <img src="/brand/logo-tile.svg" alt="Future Vision Development SPC logo" width="44" height="44" className="h-11 w-11 shrink-0 rounded-xl shadow-md ring-1 ring-black/5 logo-hover" />
              <div className="leading-tight">
                <div className="text-xl font-bold text-fg">{t.brand} <span className="text-accent">SPC</span></div>
                <div className="text-xs text-muted">{t.tagline}</div>
              </div>
            </div>
            <p className="text-muted max-w-md leading-relaxed">{t.footer.about}</p>
            <p className="text-xs text-muted mt-4 ltr">C.R. No. {CONTACT.crNo}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className={link}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-accent">{t.footer.contactInfo}</h3>
            <div className="space-y-3">
              {CONTACT.phones.map((phone, i) => (
                <div key={phone} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                  <a href={CONTACT.phoneLinks[i]} className={`ltr ${link}`}>{phone}</a>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href={`mailto:${CONTACT.email}`} className={`ltr text-sm [overflow-wrap:anywhere] ${link}`}>{CONTACT.email}</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-accent" />
                <span className="text-muted text-sm">{t.footer.location}</span>
              </div>
              <p className="text-xs text-muted">{tr('Divisions in Muscat and Salalah', 'فرعان في مسقط وصلالة')}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(var(--accent-rgb),0.15)] mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-muted text-center">© <span className="ltr">{new Date().getFullYear()}</span> Future Vision Development SPC. {t.footer.rights}</p>
            <div className="flex gap-5">
              <Link to="/privacy" className={`text-sm ${link}`}>{t.footer.privacy}</Link>
              <a href="/privacy#terms-of-service" className={`text-sm ${link}`}>{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
