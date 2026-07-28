import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Award,
  ShieldCheck,
  Eye,
  MessageSquare,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './WhyChooseUs.css';

const ICONS = {
  professional: Award,
  trust: ShieldCheck,
  transparency: Eye,
  communication: MessageSquare,
  personalized: Sparkles,
  satisfaction: Heart,
};

const ITEMS = [
  'professional',
  'trust',
  'transparency',
  'communication',
  'personalized',
  'satisfaction',
];

export default function WhyChooseUs() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.why__header > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.why__header', start: 'top 85%', once: true },
      });

      gsap.from('.why__card', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.why__grid', start: 'top 80%', once: true },
      });

      // Background blobs drift
      gsap.to('.why__blob--a', {
        yPercent: -30,
        xPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
      gsap.to('.why__blob--b', {
        yPercent: 40,
        xPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section section--dark why">
      <div className="why__blob why__blob--a" aria-hidden="true" />
      <div className="why__blob why__blob--b" aria-hidden="true" />

      <div className="container">
        <div className="why__header">
          <span className="eyebrow eyebrow--gold">{t('why.eyebrow')}</span>
          <h2>{t('why.title')}</h2>
          <p>{t('why.subtitle')}</p>
        </div>

        <div className="why__grid">
          {ITEMS.map((id) => {
            const Icon = ICONS[id];
            return (
              <article key={id} className="why__card">
                <div className="why__icon-wrap">
                  <Icon size={22} className="why__icon" />
                </div>
                <h3 className="why__card-title">{t(`why.items.${id}.title`)}</h3>
                <p className="why__card-body">{t(`why.items.${id}.body`)}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}