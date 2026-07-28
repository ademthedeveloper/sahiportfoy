import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Statistics.css';

const STATS = [
  { id: 'years', target: 10, suffix: '+' },
  { id: 'clients', target: 500, suffix: '+' },
  { id: 'transactions', target: 350, suffix: '+' },
  { id: 'satisfaction', target: 98, suffix: '%' },
];

export default function Statistics() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.stats__card', {
        y: 40,
        opacity: 0,
        scale: 0.94,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.stats__grid', start: 'top 80%', once: true },
      });

      // Counter tween + ring progress for each stat
      const cards = gsap.utils.toArray('.stats__card');
      cards.forEach((card) => {
        const number = card.querySelector('.stats__num');
        const ring = card.querySelector('.stats__ring-progress');
        const target = parseInt(card.dataset.target, 10);
        const max = parseInt(card.dataset.max, 10);
        const circumference = 2 * Math.PI * 56; // r=56
        ring.style.strokeDasharray = `${circumference}`;
        ring.style.strokeDashoffset = `${circumference}`;

        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(ring, {
              strokeDashoffset: circumference - (target / max) * circumference,
              duration: 1.6,
              ease: 'power3.out',
            });
            gsap.fromTo(
              number,
              { innerText: 0 },
              {
                innerText: target,
                duration: 1.6,
                ease: 'power3.out',
                snap: { innerText: 1 },
              }
            );
            gsap.fromTo(
              card,
              { scale: 0.96 },
              { scale: 1, duration: 1.2, ease: 'power3.out' }
            );
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section stats">
      <div className="container">
        <div className="stats__grid">
          {STATS.map((s) => (
            <article
              key={s.id}
              className="stats__card"
              data-target={s.target}
              data-max={s.max > 100 ? s.max : 100}
            >
              <svg className="stats__ring" viewBox="0 0 140 140" aria-hidden="true">
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  className="stats__ring-track"
                  fill="none"
                  strokeWidth="2"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="56"
                  className="stats__ring-progress"
                  fill="none"
                  strokeWidth="2"
                  transform="rotate(-90 70 70)"
                  strokeLinecap="round"
                />
              </svg>
              <div className="stats__center">
                <span className="stats__num">0</span>
                <span className="stats__suffix">{s.suffix}</span>
              </div>
              <span className="stats__label">{t(`stats.${s.id}`)}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}