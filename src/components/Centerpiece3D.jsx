import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
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
 * Driven wrapper — owns the group rotation, camera dolly, explode factor,
 * and lighting progress, all updated from the parent ScrollTrigger.
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

    // Floor explode: middle floors drift up at 0.55, top floors a bit more.
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const floor = floorRefs.current[i];
      if (!floor) continue;
      // Distance from center
      const mid = (FLOOR_COUNT - 1) / 2;
      const dist = Math.abs(i - mid) / mid; // 0..1
      // Bell-shaped curve peaking at p=0.75
      const env = Math.sin(p * Math.PI);
      const lift = env * dist * 0.7 * FLOOR_HEIGHT * 6;
      // Animate from baseY: store baseY on first frame
      if (floor.userData.baseY === undefined) {
        floor.userData.baseY = floor.position.y;
      }
      floor.position.y = floor.userData.baseY + lift;
    }
  });

  return (
    <>
      <LightingRig progress={progressRef.current ?? 0} />
      <BuildingModel floorRefs={floorRefs} groupRef={groupRef} />
      <ParticlesField />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

/**
 * Static fallback shown when reduced motion is preferred. Renders a
 * decorative gold-line architectural silhouette as inline SVG.
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
        {/* Base */}
        <line x1="80" y1="540" x2="320" y2="540" stroke="url(#gold)" strokeWidth="2" />
        <line x1="100" y1="560" x2="300" y2="560" stroke="url(#gold)" strokeWidth="1.5" opacity="0.6" />
        {/* Building floors */}
        {Array.from({ length: 14 }).map((_, i) => {
          const y = 60 + i * 32;
          return (
            <g key={i}>
              <rect
                x="100"
                y={y}
                width="200"
                height="4"
                fill="none"
                stroke="url(#gold)"
                strokeWidth="1.2"
              />
              <line
                x1="100"
                y1={y + 2}
                x2="300"
                y2={y + 2}
                stroke="url(#gold)"
                strokeWidth="0.5"
                opacity="0.4"
              />
            </g>
          );
        })}
        {/* Corner mullions */}
        <line x1="100" y1="60" x2="100" y2="540" stroke="url(#gold)" strokeWidth="2" />
        <line x1="300" y1="60" x2="300" y2="540" stroke="url(#gold)" strokeWidth="2" />
        {/* Crown */}
        <rect
          x="160"
          y="40"
          width="80"
          height="20"
          fill="none"
          stroke="url(#gold)"
          strokeWidth="1.5"
        />
        {/* Antenna */}
        <line x1="200" y1="40" x2="200" y2="10" stroke="url(#gold)" strokeWidth="1.2" />
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

  // Lazy mount: only render the Canvas when the user is near the section.
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
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.6, 7], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
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
