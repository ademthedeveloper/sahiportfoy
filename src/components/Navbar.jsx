import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Navbar.css';

// FAQ link removed in the redesign — there is no FAQ section anymore.
const NAV_LINKS = [
  { id: 'home', href: '#home' },
  { id: 'about', href: '#about' },
  { id: 'services', href: '#services' },
  { id: 'portfolio', href: '#portfolio' },
  { id: 'contact', href: '#contact' },
];

export default function Navbar() {
  const { t, locale, toggleLocale } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const underlineRef = useRef(null);
  const linkRefs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // 'faq' dropped from the observer set since the section no longer exists.
    const ids = ['home', 'about', 'services', 'portfolio', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const link = linkRefs.current[active];
    const underline = underlineRef.current;
    if (!link || !underline) return;
    const rect = link.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    underline.style.width = `${rect.width}px`;
    underline.style.transform = `translateX(${rect.left - navRect.left}px)`;
    underline.style.opacity = '1';
  }, [active, locale]);

  return (
    <header
      ref={navRef}
      className={`nav ${scrolled ? 'nav--scrolled' : ''}`}
    >
      <div className="nav__inner">
        <a href="#home" className="nav__brand" aria-label="ŞAHİ PORTFÖY home">
          <span className="nav__brand-mark">Ş</span>
          <span className="nav__brand-text">
            <span className="nav__brand-line1">ŞAHİ</span>
            <span className="nav__brand-line2">PORTFÖY</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              ref={(el) => (linkRefs.current[link.id] = el)}
              className={`nav__link ${active === link.id ? 'is-active' : ''}`}
            >
              {t(`nav.${link.id}`)}
            </a>
          ))}
          <span ref={underlineRef} className="nav__underline" aria-hidden="true" />
        </nav>

        <div className="nav__actions">
          <button
            className="nav__lang"
            onClick={toggleLocale}
            aria-label="Switch language"
            type="button"
          >
            <span className={`nav__lang-opt ${locale === 'tr' ? 'is-active' : ''}`}>TR</span>
            <span className="nav__lang-divider" />
            <span className={`nav__lang-opt ${locale === 'en' ? 'is-active' : ''}`}>EN</span>
          </button>

          <a href="#contact" className="btn btn--primary nav__cta">
            {t('nav.cta')}
          </a>

          <button
            className={`nav__burger ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`nav__mobile ${mobileOpen ? 'is-open' : ''}`}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${link.id}`)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
