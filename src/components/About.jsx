import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Compass, Eye, Heart } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './About.css';

const ABOUT_IMG =
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80';

export default function About() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from('.about__media', {
        x: -60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about__media', start: 'top 80%', once: true },
      });

      gsap.from('.about__title', {
        x: 60,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about__title', start: 'top 85%', once: true },
      });

      gsap.from('.about__body', {
        x: 60,
        opacity: 0,
        duration: 1.0,
        delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about__body', start: 'top 85%', once: true },
      });

      gsap.from('.about__card', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about__cards', start: 'top 85%', once: true },
      });

      // Vertical gold line grows while scrolling through the section
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.5,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="section about">
      <div className="container about__container">
        <div className="about__media">
          <div className="about__media-frame">
            <img src={ABOUT_IMG} alt="ŞAHİ PORTFÖY team meeting" loading="lazy" decoding="async" />
          </div>
          <div className="about__media-badge">
            <span className="about__media-badge-num">10+</span>
            <span className="about__media-badge-label">{t('stats.years')}</span>
          </div>
          <div className="about__line" ref={lineRef} aria-hidden="true" />
        </div>

        <div className="about__copy">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h2 className="about__title">{t('about.title')}</h2>
          <p className="about__body">{t('about.body')}</p>

          <div className="about__cards">
            <div className="about__card card">
              <Compass size={22} className="about__card-icon" />
              <h3 className="about__card-title">{t('about.mission.title')}</h3>
              <p className="about__card-body">{t('about.mission.body')}</p>
            </div>
            <div className="about__card card">
              <Eye size={22} className="about__card-icon" />
              <h3 className="about__card-title">{t('about.vision.title')}</h3>
              <p className="about__card-body">{t('about.vision.body')}</p>
            </div>
            <div className="about__card card about__card--values">
              <Heart size={22} className="about__card-icon" />
              <h3 className="about__card-title">{t('about.values.title')}</h3>
              <p className="about__card-body">{t('about.values.body')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}