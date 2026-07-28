import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EASE = {
  soft: 'power2.out',
  inOut: 'power3.inOut',
  expo: 'expo.out',
};

const defaultFrom = {
  opacity: 0,
  y: 40,
};

/**
 * One-shot fade-up reveal. Plays exactly once when the element enters viewport.
 * Wraps the targets with `from(...)` so the initial DOM state stays visible
 * if JS hasn't loaded yet.
 */
export function revealUp(targets, options = {}) {
  if (!targets) return null;
  const {
    delay = 0,
    duration = 1.1,
    stagger = 0.1,
    ease = EASE.soft,
    y = 40,
    start = 'top 85%',
  } = options;
  return gsap.from(targets, {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function revealFade(targets, options = {}) {
  if (!targets) return null;
  const { delay = 0, duration = 1.2, start = 'top 90%' } = options;
  return gsap.from(targets, {
    opacity: 0,
    duration,
    delay,
    ease: EASE.soft,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function revealMask(targets, options = {}) {
  if (!targets) return null;
  const { delay = 0, duration = 1.2, stagger = 0.08, start = 'top 85%' } = options;
  return gsap.from(targets, {
    clipPath: 'inset(0 100% 0 0)',
    duration,
    delay,
    stagger,
    ease: EASE.expo,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function revealSlideLeft(targets, options = {}) {
  if (!targets) return null;
  const { delay = 0, duration = 1.2, start = 'top 85%' } = options;
  return gsap.from(targets, {
    x: -60,
    opacity: 0,
    duration,
    delay,
    ease: EASE.soft,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function revealSlideRight(targets, options = {}) {
  if (!targets) return null;
  const { delay = 0, duration = 1.2, start = 'top 85%' } = options;
  return gsap.from(targets, {
    x: 60,
    opacity: 0,
    duration,
    delay,
    ease: EASE.soft,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function revealScale(targets, options = {}) {
  if (!targets) return null;
  const { delay = 0, duration = 1.1, stagger = 0.08, start = 'top 85%' } = options;
  return gsap.from(targets, {
    opacity: 0,
    scale: 0.94,
    duration,
    delay,
    stagger,
    ease: EASE.soft,
    scrollTrigger: {
      trigger: targets,
      start,
      once: true,
    },
  });
}

export function growLine(target, options = {}) {
  if (!target) return null;
  const { start = 'top 80%', end = 'bottom 70%' } = options;
  return gsap.fromTo(
    target,
    { scaleY: 0, transformOrigin: 'top center' },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: target,
        start,
        end,
        scrub: 0.5,
      },
    }
  );
}

export function drawPath(target, options = {}) {
  if (!target) return null;
  const length = target.getTotalLength?.() ?? 1000;
  target.style.strokeDasharray = length;
  target.style.strokeDashoffset = length;
  return gsap.to(target, {
    strokeDashoffset: 0,
    duration: 1.6,
    ease: EASE.soft,
    scrollTrigger: {
      trigger: target,
      start: 'top 85%',
      once: true,
    },
  });
}

export function parallaxOnScroll(targets, options = {}) {
  if (!targets) return null;
  const { yPercent = -20 } = options;
  return gsap.to(targets, {
    yPercent,
    ease: 'none',
    scrollTrigger: {
      trigger: targets,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}

export { defaultFrom };