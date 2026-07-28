import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BuildingModel, {
  FLOOR_COUNT,
  FLOOR_HEIGHT,
} from '../three/BuildingModel.jsx';
import ParticlesField from '../three/ParticlesField.jsx';
import LightingRig from '../three/LightingRig.jsx';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import './Centerpiece3D.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Driven wrapper — owns the group rotation, camera dolly, and explode
 * factor for the villa pieces, all updated from the parent ScrollTrigger.
 *
 * The per-frame lift computation now early-exits when progress is in the
 * "settled" range (< 0.1 or > 0.95), saving N trig+abs+multiply calls per
 * frame during the long stretches where the villa isn't animating.
 */
function DrivenScene({ floorRefs, groupRef, progressRef }) {
  useFrame((state) => {
    const p = progressRef.current ?? 0; // 0..1

    // Group rotation: a full 360° over progress 0..0.7, then settles.
    if (groupRef.current) {
      const rot = p < 0.7 ? (p / 0.7) * Math.PI * 2 : Math.PI * 2;
      groupRef.current.rotation.y = rot;
    }

    // Camera dolly: z 7 → 3.6 over progress 0..1
    const cam = state.camera;
    cam.position.z = 7 - p * 3.4;
    cam.position.y = 0.6 + Math.sin(p * Math.PI) * 0.4;
    cam.lookAt(0, 0, 0);

    // Skip the lift computation entirely when the lift is effectively 0.
    // The bell-curve envelope `sin(p * PI)` is ≈ 0 outside [0.1, 0.95].
    if (p < 0.1 || p > 0.95) return;

    // Villa piece explode: pieces drift up, with the outer ones lifting
    // more (like an exploded architectural section view).
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const piece = floorRefs.current[i];
      if (!piece) continue;
      const mid = (FLOOR_COUNT - 1) / 2;
      const dist = Math.abs(i - mid) / mid; // 0..1
      const env = Math.sin(p * Math.PI);
      const lift = env * dist * 0.7 * FLOOR_HEIGHT * 6;
      if (piece.userData.baseY === undefined) {
        piece.userData.baseY = piece.position.y;
      }
      piece.position.y = piece.userData.baseY + lift;
    }
  });

  return (
    <>
      <LightingRig progress={progressRef.current ?? 0} />
      <BuildingModel floorRefs={floorRefs} groupRef={groupRef} />
      <ParticlesField />
      {/*
        The Drei <Environment preset="city" /> cubemap was the single biggest
        mobile cost (6-face cubemap + IBL). Removed in the aggressive perf
        pass — the two point lights + the directional rig produce enough
        specular kick on the gold edges for the villa to still read.
      */}
    </>
  );
}

/**
 * Static fallback shown when reduced motion is preferred. Renders a
 * decorative gold-line architectural silhouette of the modern villa as
 * inline SVG.
 */
function StaticFallback() {
  return (
    <div className="centerpiece__fallback" aria-hidden="true">
      <svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D9B94A" />
            <stop offset="50%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#A6851B" />
          </linearGradient>
        </defs>
        {/* Ground line */}
        <line x1="40" y1="540" x2="360" y2="540" stroke="url(#gold)" strokeWidth="2" />
        {/* Pool deck */}
        <rect x="120" y="510" width="160" height="6" fill="none" stroke="url(#gold)" strokeWidth="1.5" />
        {/* Stepped villa slabs (6 pieces, narrowing as they rise) */}
        {Array.from({ length: 6 }).map((_, i) => {
          const w = 200 - i * 18;
          const x = (400 - w) / 2;
          const y = 480 - i * 64;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height="6"
                fill="none"
                stroke="url(#gold)"
                strokeWidth="1.2"
              />
              {/* Glass wall hint on ground floor only */}
              {i === 0 &&
                [0, 1, 2, 3].map((k) => (
                  <rect
                    key={k}
                    x={x + 24 + k * 38}
                    y={y - 32}
                    width="20"
                    height="32"
                    fill="none"
                    stroke="url(#gold)"
                    strokeWidth="0.8"
                    opacity="0.6"
                  />
                ))}
            </g>
          );
        })}
        {/* Cantilevered overhang */}
        <rect
          x="180"
          y="380"
          width="120"
          height="6"
          fill="none"
          stroke="url(#gold)"
          strokeWidth="1.2"
        />
        {/* Front corner posts */}
        <line x1="100" y1="120" x2="100" y2="480" stroke="url(#gold)" strokeWidth="2" />
        <line x1="300" y1="120" x2="300" y2="480" stroke="url(#gold)" strokeWidth="2" />
        {/* Roof slab */}
        <rect
          x="190"
          y="100"
          width="20"
          height="20"
          fill="none"
          stroke="url(#gold)"
          strokeWidth="1.5"
        />
        {/* Driveway lines */}
        <line x1="160" y1="520" x2="160" y2="595" stroke="url(#gold)" strokeWidth="1" opacity="0.5" />
        <line x1="240" y1="520" x2="240" y2="595" stroke="url(#gold)" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}

export default function Centerpiece3D() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const groupRef = useRef(null);
  const floorRefs = useRef(new Array(FLOOR_COUNT).fill(null));
  const reduced = useReducedMotion();
  const [hasInView, setHasInView] = useState(false);
  // Detect mobile at mount time so we can pick a cheaper Canvas config.
  // (Re-evaluated on resize via the listener below.)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 720px)').matches;
  });

  // Lazy mount: only render the Canvas when the user is near the section.
  // rootMargin shrunk from 200px to 50px as part of the perf pass — we
  // don't want the WebGL context instantiating 200px before the section
  // is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-evaluate mobile on resize so a desktop user shrinking the window
  // gets the cheaper config (and vice versa).
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 720px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      // Drive a single 0..1 progress from scroll.
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      // Caption reveal — fades in as the pin progresses
      gsap.from('.centerpiece__caption > *', {
        y: 24,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          once: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="centerpiece"
      ref={sectionRef}
      className="centerpiece section"
      aria-label="Architectural signature"
    >
      {reduced || !hasInView ? (
        <div className="centerpiece__canvas-wrap">
          <StaticFallback />
        </div>
      ) : (
        <div className="centerpiece__canvas-wrap" ref={canvasRef}>
          <Canvas
            // DPR cap dropped from [1, 1.75] to [1, 1.5] — visible 1080p/1440p
            // mobile looks identical at 1.5 vs 1.75, and the fillrate saving
            // is a real 5–10% on retina devices.
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.6, 7], fov: 38 }}
            gl={{
              // Antialiasing is the single largest fragment cost. The gold
              // edge lines are geometric and read fine without MSAA — turn
              // it off on mobile and keep it on desktop.
              antialias: !isMobile,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            frameloop="always"
          >
            <color attach="background" args={['#0F172A']} />
            <fog attach="fog" args={['#0F172A', 8, 14]} />
            <DrivenScene
              floorRefs={floorRefs}
              groupRef={groupRef}
              progressRef={progressRef}
            />
          </Canvas>
        </div>
      )}

      <div className="container">
        <div className="centerpiece__caption">
          <span className="eyebrow eyebrow--gold">{t('centerpiece.eyebrow')}</span>
          <h2>{t('centerpiece.title')}</h2>
          <p>{t('centerpiece.subtitle')}</p>
        </div>
      </div>
    </section>
  );
}
