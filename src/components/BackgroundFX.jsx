import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BackgroundFX.css';

/**
 * Ambient background FX: subtle floating particles, large blurred gradient
 * blobs, and occasional gold light streaks. Pure CSS-driven for performance,
 * with one light GSAP loop for the slow drifting motion.
 */
export default function BackgroundFX() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slow drift on the gradient blobs
      gsap.to('.bgfx__blob--a', {
        yPercent: 20,
        xPercent: 12,
        duration: 18,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.bgfx__blob--b', {
        yPercent: -16,
        xPercent: -10,
        duration: 22,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      gsap.to('.bgfx__blob--c', {
        yPercent: 10,
        xPercent: -14,
        duration: 26,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });

      // Slow drift on the gold streak
      gsap.to('.bgfx__streak', {
        yPercent: -40,
        duration: 12,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3,
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Particle dots (static positions; the slow drift on blobs carries them visually)
  const particles = Array.from({ length: 18 });

  return (
    <div ref={rootRef} className="bgfx" aria-hidden="true">
      <div className="bgfx__blob bgfx__blob--a" />
      <div className="bgfx__blob bgfx__blob--b" />
      <div className="bgfx__blob bgfx__blob--c" />

      <div className="bgfx__streak bgfx__streak--1" />
      <div className="bgfx__streak bgfx__streak--2" />

      <div className="bgfx__particles">
        {particles.map((_, i) => (
          <span
            key={i}
            className="bgfx__particle"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 73) % 100}%`,
              animationDelay: `${(i % 9) * 0.6}s`,
              opacity: 0.18 + ((i * 17) % 8) * 0.06,
            }}
          />
        ))}
      </div>
    </div>
  );
}