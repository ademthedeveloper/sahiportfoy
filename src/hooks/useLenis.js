import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './useReducedMotion.js';

/**
 * Boots a single Lenis instance, wires it to GSAP's ticker, and forwards
 * scroll events to ScrollTrigger. If the user prefers reduced motion we
 * skip Lenis entirely so native scrolling is preserved.
 */
export function useLenis() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      lerp: 0.1,
    });

    document.documentElement.classList.add('lenis');

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // Drive Lenis from GSAP's ticker — the canonical sync pattern.
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor links — Lenis-aware
    const handleAnchor = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    };
    document.addEventListener('click', handleAnchor);

    return () => {
      document.removeEventListener('click', handleAnchor);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, [reduced]);
}