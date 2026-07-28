import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Facebook, Instagram, Music2, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Footer.css';

const NAV = [
  { id: 'home' },
  { id: 'about' },
  { id: 'services' },
  { id: 'portfolio' },
  { id: 'faq' },
  { id: 'contact' },
];

export default function Footer() {
  const { t, locale, toggleLocale } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer__inner > *', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 90%', once: true },
      });

      // Gentle floating social icons
      gsap.to('.footer__social', {
        yPercent: -8,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.15,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={sectionRef} className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand-col">
            <a href="#home" className="footer__brand">
              <span className="footer__brand-mark">Ş</span>
              <span>
                <span className="footer__brand-line1">ŞAHİ</span>
                <span className="footer__brand-line2">PORTFÖY</span>
              </span>
            </a>
            <p className="footer__tagline">{t('footer.tagline')}</p>
            <button
              className="footer__lang"
              onClick={toggleLocale}
              aria-label="Switch language"
              type="button"
            >
              <span className={`footer__lang-opt ${locale === 'tr' ? 'is-active' : ''}`}>TR</span>
              <span className="footer__lang-divider" />
              <span className={`footer__lang-opt ${locale === 'en' ? 'is-active' : ''}`}>EN</span>
            </button>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t('footer.navigation')}</h4>
            <ul className="footer__nav">
              {NAV.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`}>{t(`nav.${link.id}`)}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t('footer.contact')}</h4>
            <a href="tel:+905418417985" className="footer__phone">
              <Phone size={16} />
              +90 541 841 79 85
            </a>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">{t('footer.social')}</h4>
            <div className="footer__socials">
              <a
                href="https://www.facebook.com/share/1JuNS2Fd8E/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer__social"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/sahi_portfoy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer__social"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.tiktok.com/@ysezgin34"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="footer__social"
              >
                <Music2 size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} ŞAHİ PORTFÖY. {t('footer.legal')}</span>
        </div>
      </div>
    </footer>
  );
}