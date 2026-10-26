import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Languages, ChevronDown, Building2, Quote, Users, CalendarDays, Briefcase, type LucideIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type NavLink = { name: string; href: string };
type GroupLink = NavLink & { description: string; icon: LucideIcon };

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { t, tr, toggleLang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setAboutOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close the dropdown on outside click / Escape
  useEffect(() => {
    if (!aboutOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!aboutRef.current?.contains(e.target as Node)) setAboutOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAboutOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [aboutOpen]);

  const aboutLinks: GroupLink[] = [
    { name: t.nav.aboutUs,    href: '/about',       icon: Building2,    description: tr('Who we are, our mission and vision', 'من نحن، رسالتنا ورؤيتنا') },
    { name: t.nav.ceoMessage, href: '/ceo-message', icon: Quote,        description: tr('A word from our leadership', 'كلمة من قيادتنا') },
    { name: t.nav.team,       href: '/team',        icon: Users,        description: tr('Meet the people behind our work', 'تعرّف على فريق العمل') },
    { name: t.nav.activities, href: '/activities',  icon: CalendarDays, description: tr('Events, programs and gallery', 'الفعاليات والبرامج والمعرض') },
    { name: t.nav.jobs,       href: '/jobs',        icon: Briefcase,    description: tr('Open positions — join our team', 'الوظائف المتاحة، انضم إلى فريقنا') },
  ];

  const before: NavLink[] = [{ name: t.nav.home, href: '/' }];
  const after: NavLink[] = [
    { name: t.nav.projects, href: '/projects' },
    { name: t.nav.courses,  href: '/courses' },
    { name: t.nav.blog,     href: '/blog' },
    { name: t.nav.contact,  href: '/contact' },
  ];

  const isActive = (path: string) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
  const aboutActive = aboutLinks.some(link => isActive(link.href));

  const linkBase = 'relative px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap';
  const linkActive = 'text-accent bg-[rgba(var(--accent-rgb),0.12)] shadow-[inset_0_0_0_1px_rgba(var(--accent-rgb),0.3)]';
  const linkIdle = 'text-muted hover:text-accent hover:bg-[rgba(var(--accent-rgb),0.08)]';

  const iconBtn = 'glass-effect p-2 sm:p-2.5 rounded-full transition-transform duration-300 hover:scale-110';

  // Hover opens on pointer devices; a short delay lets the cursor cross the gap to the panel
  const openAbout = () => {
    window.clearTimeout(closeTimer.current);
    setAboutOpen(true);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setAboutOpen(false), 150);
  };

  const controls = (
    <>
      <button onClick={toggleLang} aria-label={t.nav.switchLang} title={t.nav.switchLang} className={`${iconBtn} flex items-center gap-1.5 !px-2.5 sm:!px-3`}>
        <Languages className="hidden sm:block h-4 w-4 text-accent" />
        <span className="text-xs font-bold text-fg" style={{ fontFamily: t.nav.switchLangShort === 'ع' ? 'Cairo' : 'Inter' }}>
          {t.nav.switchLangShort}
        </span>
      </button>
      <button onClick={toggleTheme} aria-label={isDark ? t.nav.lightMode : t.nav.darkMode} className={iconBtn}>
        {isDark ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4 text-accent" />}
      </button>
    </>
  );

  const renderLink = (item: NavLink) => (
    <Link key={item.href} to={item.href} className={`${linkBase} ${isActive(item.href) ? linkActive : linkIdle}`}>
      {item.name}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 px-3 sm:px-6 pt-3">
      <div
        className={`glass-effect-strong max-w-7xl mx-auto rounded-2xl transition-all duration-500 ${
          scrolled ? 'shadow-2xl' : ''
        }`}
      >
        <div className="flex justify-between items-center gap-2 h-16 px-3 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/brand/logo-tile.svg" alt="FutureInnvo SPC logo" width="40" height="40" className="h-10 w-10 shrink-0 rounded-xl shadow-md ring-1 ring-black/5 logo-hover" />
            <span className="text-base sm:text-lg font-bold text-fg truncate">{t.brand}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {before.map(renderLink)}

            {/* About dropdown */}
            <div ref={aboutRef} className="relative" onMouseEnter={openAbout} onMouseLeave={scheduleClose}>
              <button
                type="button"
                onClick={() => setAboutOpen(open => !open)}
                aria-haspopup="true"
                aria-expanded={aboutOpen}
                aria-controls="about-menu"
                className={`${linkBase} inline-flex items-center gap-1 ${aboutActive ? linkActive : linkIdle}`}
              >
                {t.nav.about}
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${aboutOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                id="about-menu"
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[22rem] transition-all duration-200 ${
                  aboutOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                }`}
              >
                <div className="glass-effect-strong menu-surface rounded-2xl p-2 shadow-2xl">
                  {aboutLinks.map(({ name, href, description, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                        isActive(href) ? 'bg-[rgba(var(--accent-rgb),0.12)]' : 'hover:bg-[rgba(var(--accent-rgb),0.08)]'
                      }`}
                    >
                      <span className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)]">
                        <Icon className="h-5 w-5 text-accent" />
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-semibold ${isActive(href) ? 'text-accent' : 'text-fg'}`}>{name}</span>
                        <span className="block text-xs text-muted truncate">{description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {after.map(renderLink)}
            <div className="flex items-center gap-2 ms-3">{controls}</div>
          </div>

          {/* Mobile: controls + hamburger */}
          <div className="lg:hidden flex shrink-0 items-center gap-1.5 sm:gap-2">
            {controls}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              aria-expanded={isMenuOpen}
              className="inline-flex items-center justify-center p-2 rounded-full text-fg"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
            isMenuOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-4 pt-1 space-y-3">
            <div className="grid grid-cols-2 gap-1.5">
              {[...before, ...after].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href) ? linkActive : linkIdle
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div>
              <div className="px-4 pb-1.5 text-xs font-semibold uppercase tracking-wider text-accent">{t.nav.about}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {aboutLinks.map(({ name, href, icon: Icon }) => (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      isActive(href) ? linkActive : linkIdle
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
