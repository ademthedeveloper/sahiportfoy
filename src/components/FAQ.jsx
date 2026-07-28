import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './FAQ.css';

const QUESTIONS = [
  { qKey: 'q1', aKey: 'a1' },
  { qKey: 'q2', aKey: 'a2' },
  { qKey: 'q3', aKey: 'a3' },
  { qKey: 'q4', aKey: 'a4' },
  { qKey: 'q5', aKey: 'a5' },
];

export default function FAQ() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.faq__header > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.faq__header', start: 'top 85%', once: true },
      });

      gsap.from('.faq__item', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.faq__list', start: 'top 85%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggle = (i) => setOpen((prev) => (prev === i ? -1 : i));

  return (
    <section id="faq" ref={sectionRef} className="section faq">
      <div className="container container--narrow">
        <div className="faq__header">
          <span className="eyebrow">{t('faq.eyebrow')}</span>
          <h2>{t('faq.title')}</h2>
        </div>

        <div className="faq__list">
          {QUESTIONS.map((q, i) => {
            const isOpen = open === i;
            return (
              <div key={q.qKey} className={`faq__item ${isOpen ? 'is-open' : ''}`}>
                <button
                  className="faq__trigger"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  type="button"
                >
                  <span className="faq__question">{t(`faq.${q.qKey}`)}</span>
                  <ChevronDown size={18} className="faq__chevron" />
                </button>
                <div className="faq__panel-wrap">
                  <div className="faq__panel">
                    <p>{t(`faq.${q.aKey}`)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}