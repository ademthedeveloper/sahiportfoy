import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Loader.css';

const TOTAL_DURATION = 2.0;

export default function Loader({ onComplete }) {
  const rootRef = useRef(null);
  const lineRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => onComplete?.(),
      });

      // 1. Gold line expands from center
      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
        0
      );

      // 2. Logo fades in
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.35
      );

      // 3. Logo scales subtly (slow, premium)
      tl.to(
        logoRef.current,
        { scale: 1.06, duration: 0.8, ease: 'power1.inOut' },
        0.85
      );

      // 4. Line retracts slightly while everything fades out
      tl.to(
        lineRef.current,
        { opacity: 0, duration: 0.45, ease: 'power2.in' },
        TOTAL_DURATION - 0.5
      );
      tl.to(
        logoRef.current,
        { opacity: 0, duration: 0.45, ease: 'power2.in' },
        TOTAL_DURATION - 0.5
      );

      // 5. Whole loader fades
      tl.to(
        rootRef.current,
        { opacity: 0, duration: 0.55, ease: 'power2.inOut' },
        TOTAL_DURATION - 0.5
      );
    });

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={rootRef} className="loader" aria-hidden="true">
      <div className="loader__inner">
        <div className="loader__line-wrap">
          <div ref={lineRef} className="loader__line" />
        </div>
        <div ref={logoRef} className="loader__logo">
          <span className="loader__brand">ŞAHİ</span>
          <span className="loader__brand loader__brand--accent">PORTFÖY</span>
        </div>
      </div>
    </div>
  );
}