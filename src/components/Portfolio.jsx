import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Portfolio.css';

const ITEMS = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    img: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function Portfolio() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.portfolio__header > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portfolio__header', start: 'top 85%', once: true },
      });

      // Mask reveal — clip-path animates from inset(0 100% 0 0) to inset(0 0 0 0)
      gsap.from('.portfolio__media', {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1.4,
        stagger: 0.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.portfolio__grid', start: 'top 80%', once: true },
      });

      // Image scale-down inside the mask
      gsap.from('.portfolio__img', {
        scale: 1.15,
        duration: 1.4,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portfolio__grid', start: 'top 80%', once: true },
      });

      // Tags + titles fade after mask
      gsap.from('.portfolio__meta', {
        opacity: 0,
        y: 18,
        duration: 1,
        stagger: 0.05,
        delay: 0.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.portfolio__grid', start: 'top 80%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="portfolio" ref={sectionRef} className="section portfolio">
      <div className="container">
        <div className="portfolio__header">
          <span className="eyebrow">{t('portfolio.eyebrow')}</span>
          <h2>{t('portfolio.title')}</h2>
          <p>{t('portfolio.subtitle')}</p>
        </div>

        <div className="portfolio__grid">
          {ITEMS.map((item, i) => (
            <article key={item.id} className={`portfolio__card ${i === 0 || i === 5 ? 'portfolio__card--wide' : ''}`}>
              <div className="portfolio__media">
                <img
                  src={item.img}
                  alt={t(`portfolio.item.${item.id}.title`)}
                  className="portfolio__img"
                  loading="lazy"
                  decoding="async"
                />
                <span className="portfolio__sweep" aria-hidden="true" />
              </div>
              <div className="portfolio__meta">
                <span className="portfolio__tag">{t(`portfolio.item.${item.id}.tag`)}</span>
                <h3 className="portfolio__card-title">{t(`portfolio.item.${item.id}.title`)}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}