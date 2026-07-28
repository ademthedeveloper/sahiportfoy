import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Testimonials.css';

const ITEMS = ['1', '2', '3', '4', '5'];

export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonials__header > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonials__header', start: 'top 85%', once: true },
      });

      gsap.from('.testimonials__card', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonials__viewport', start: 'top 85%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % ITEMS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const go = (dir) => {
    setActive((prev) => (prev + dir + ITEMS.length) % ITEMS.length);
  };

  return (
    <section ref={sectionRef} className="section testimonials">
      <div className="testimonials__glow testimonials__glow--a" aria-hidden="true" />
      <div className="testimonials__glow testimonials__glow--b" aria-hidden="true" />

      <div className="container">
        <div className="testimonials__header">
          <span className="eyebrow">{t('testimonials.eyebrow')}</span>
          <h2>{t('testimonials.title')}</h2>
        </div>

        <div className="testimonials__viewport">
          <button
            className="testimonials__nav testimonials__nav--prev"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="testimonials__track" ref={trackRef}>
            {ITEMS.map((id, i) => {
              const isActive = i === active;
              return (
                <article
                  key={id}
                  className={`testimonials__card ${isActive ? 'is-active' : ''}`}
                  aria-hidden={!isActive}
                >
                  <Quote className="testimonials__quote-icon" size={36} />
                  <p className="testimonials__quote">
                    {t(`testimonials.items.${id}.quote`)}
                  </p>
                  <div className="testimonials__person">
                    <div className="testimonials__avatar">
                      {t(`testimonials.items.${id}.name`).charAt(0)}
                    </div>
                    <div>
                      <div className="testimonials__name">
                        {t(`testimonials.items.${id}.name`)}
                      </div>
                      <div className="testimonials__role">
                        {t(`testimonials.items.${id}.role`)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            className="testimonials__nav testimonials__nav--next"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            type="button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="testimonials__dots">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}