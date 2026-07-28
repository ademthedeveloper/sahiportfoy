import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MessageCircle, Phone, Facebook, Instagram, Music2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Contact.css';

const WHATSAPP_URL =
  'https://wa.me/905418417985?text=Merhaba%20%C5%9EAH%C4%B0%20PORTF%C3%96Y%2C%20bilgi%20almak%20istiyorum.';
const PHONE_TEL = 'tel:+905418417985';
const MAP_SRC =
  'https://www.google.com/maps?q=Istanbul,+Turkey&output=embed';

export default function Contact() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact__header > *', {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__header', start: 'top 85%', once: true },
      });

      gsap.from('.contact__cta', {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__cta', start: 'top 85%', once: true },
      });

      // Sequential reveal of contact rows
      gsap.from('.contact__row', {
        x: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__rows', start: 'top 85%', once: true },
      });

      gsap.from('.contact__map', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contact__map', start: 'top 90%', once: true },
        onEnter: () => setMapReady(true),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="section section--dark contact">
      <div className="contact__glow" aria-hidden="true" />

      <div className="container">
        <div className="contact__header">
          <span className="eyebrow eyebrow--gold">{t('contact.eyebrow')}</span>
          <h2>{t('contact.title')}</h2>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact__layout">
          <div className="contact__cta">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp contact__whatsapp"
            >
              <MessageCircle size={18} />
              {t('contact.whatsapp.cta')}
            </a>

            <div className="contact__rows">
              <a href={PHONE_TEL} className="contact__row">
                <span className="contact__row-icon">
                  <Phone size={18} />
                </span>
                <div>
                  <span className="contact__row-label">{t('contact.phone.label')}</span>
                  <span className="contact__row-value">{t('contact.phone.value')}</span>
                </div>
              </a>

              <div className="contact__row contact__row--static">
                <span className="contact__row-icon">
                  <MessageCircle size={18} />
                </span>
                <div>
                  <span className="contact__row-label">{t('contact.socials')}</span>
                  <div className="contact__socials">
                    <a
                      href="https://www.facebook.com/share/1JuNS2Fd8E/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} />
                    </a>
                    <a
                      href="https://www.instagram.com/sahi_portfoy"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <Instagram size={18} />
                    </a>
                    <a
                      href="https://www.tiktok.com/@ysezgin34"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="TikTok"
                    >
                      <Music2 size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact__map-wrap">
            <div className="contact__map">
              <div className="contact__map-frame">
                {mapReady ? (
                  <iframe
                    title="ŞAHİ PORTFÖY location"
                    src={MAP_SRC}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="contact__map-placeholder">
                    <span>{t('contact.mapLabel')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}