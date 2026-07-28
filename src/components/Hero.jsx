import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Hero.css';

const HERO_BG =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80';

export default function Hero() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!section || !bg || !content) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero__eyebrow', { opacity: 0, y: 24, duration: 0.9 }, 0.1)
        .from('.hero__headline span', { opacity: 0, y: 60, duration: 1.2, stagger: 0.08 }, 0.2)
        .from('.hero__subtitle', { opacity: 0, y: 30, duration: 1.0 }, 0.6)
        .from('.hero__cta', { opacity: 0, y: 24, duration: 0.9, stagger: 0.12 }, 0.8)
        .from('.hero__meta', { opacity: 0, y: 24, duration: 0.9 }, 1.0);

      // Scroll-driven parallax: background zooms slowly, content moves up faster
      gsap.to(bg, {
        scale: 1.12,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      gsap.to(content, {
        yPercent: -20,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, section);

    // Mouse parallax
    const handleMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(bg, {
        x: x * 20,
        y: y * 14,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
      gsap.to(content, {
        x: x * -10,
        y: y * -8,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };
    section.addEventListener('mousemove', handleMove);

    return () => {
      section.removeEventListener('mousemove', handleMove);
      ctx.revert();
    };
  }, []);

  const headline = t('hero.headline');

  return (
    <section id="home" ref={sectionRef} className="hero">
      <div className="hero__bg" ref={bgRef} aria-hidden="true">
        <img src={HERO_BG} alt="" loading="eager" decoding="async" />
        <div className="hero__overlay" />
      </div>

      <div className="hero__content" ref={contentRef}>
        <div className="container hero__container">
          <span className="eyebrow hero__eyebrow">{t('hero.eyebrow')}</span>

          <h1 className="hero__headline">
            {headline.split(' ').map((word, i) => (
              <span key={i} className="hero__word">
                {word}{' '}
              </span>
            ))}
          </h1>

          <p className="hero__subtitle">{t('hero.subtitle')}</p>

          <div className="hero__cta-row">
            <a href="#contact" className="btn btn--primary hero__cta">
              <Phone size={16} />
              {t('hero.cta.contact')}
            </a>
            <a
              href="https://wa.me/905418417985?text=Merhaba%20%C5%9EAH%C4%B0%20PORTF%C3%96Y%2C%20bir%20m%C3%BClk%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp hero__cta"
            >
              <MessageCircle size={16} />
              {t('hero.cta.whatsapp')}
            </a>
          </div>

          <div className="hero__meta">
            <div className="hero__meta-item">
              <span className="hero__meta-num">2014</span>
              <span className="hero__meta-label">{t('stats.years')}</span>
            </div>
            <span className="hero__meta-divider" />
            <div className="hero__meta-item">
              <span className="hero__meta-num">500+</span>
              <span className="hero__meta-label">{t('stats.clients')}</span>
            </div>
            <span className="hero__meta-divider" />
            <div className="hero__meta-item">
              <span className="hero__meta-num">%98</span>
              <span className="hero__meta-label">{t('stats.satisfaction')}</span>
            </div>
          </div>
        </div>

        <a href="#centerpiece" className="hero__scroll" aria-label={t('hero.scroll')}>
          <span>{t('hero.scroll')}</span>
          <ArrowDown size={16} className="hero__scroll-icon" />
        </a>
      </div>
    </section>
  );
}