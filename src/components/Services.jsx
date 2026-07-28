import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Briefcase,
  ShoppingBag,
  Tag,
  TrendingUp,
  Calculator,
  Users,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Services.css';

const ICONS = {
  brokerage: Briefcase,
  buying: ShoppingBag,
  selling: Tag,
  investment: TrendingUp,
  valuation: Calculator,
  consultation: Users,
};

const ITEMS = [
  'brokerage',
  'buying',
  'selling',
  'investment',
  'valuation',
  'consultation',
];

export default function Services() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.services__header > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.services__header', start: 'top 85%', once: true },
      });

      gsap.from('.services__card', {
        y: 50,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.services__grid', start: 'top 80%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="section services">
      <div className="container">
        <div className="services__header">
          <span className="eyebrow">{t('services.eyebrow')}</span>
          <h2>{t('services.title')}</h2>
          <p>{t('services.subtitle')}</p>
        </div>

        <div className="services__grid">
          {ITEMS.map((id) => {
            const Icon = ICONS[id];
            return (
              <article key={id} className="services__card">
                <div className="services__icon-wrap">
                  <Icon size={22} className="services__icon" />
                </div>
                <h3 className="services__card-title">{t(`services.items.${id}.title`)}</h3>
                <p className="services__card-body">{t(`services.items.${id}.body`)}</p>
                <span className="services__card-arrow" aria-hidden="true">→</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}