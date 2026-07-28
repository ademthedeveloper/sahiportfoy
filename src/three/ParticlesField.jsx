import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Drifting gold particles around the villa. Each particle orbits the
 * origin at a different speed, with subtle vertical motion. Uses raw
 * THREE.Points so we can hand-author the geometry / shader uniforms.
 *
 * On mobile the particle count is halved (40 vs 80) as part of the
 * aggressive mobile perf pass. 40 particles in the villa's 14-unit
 * cubed volume still reads as ambient haze, not as "a few dots".
 */
const DESKTOP_COUNT = 80;
const MOBILE_COUNT = 40;

export default function ParticlesField() {
  const ref = useRef(null);
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return DESKTOP_COUNT;
    return window.matchMedia('(max-width: 720px)').matches
      ? MOBILE_COUNT
      : DESKTOP_COUNT;
  });

  // Re-evaluate on viewport changes so a user who resizes the window gets
  // the right count without remounting the whole scene.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 720px)');
    const onChange = (e) => setCount(e.matches ? MOBILE_COUNT : DESKTOP_COUNT);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const { positions, speeds, basePositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.6;
      const y = (Math.random() - 0.5) * 4;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      basePositions[i * 3 + 0] = positions[i * 3 + 0];
      basePositions[i * 3 + 1] = positions[i * 3 + 1];
      basePositions[i * 3 + 2] = positions[i * 3 + 2];
      speeds[i] = 0.15 + Math.random() * 0.35;
    }
    return { positions, basePositions, speeds };
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const angle = t * speeds[i] * 0.4;
      const baseX = basePositions[i * 3 + 0];
      const baseZ = basePositions[i * 3 + 2];
      const baseY = basePositions[i * 3 + 1];
      pos[i * 3 + 0] = Math.cos(angle) * baseX - Math.sin(angle) * baseZ;
      pos[i * 3 + 1] = baseY + Math.sin(t * speeds[i] + i) * 0.18;
      pos[i * 3 + 2] = Math.sin(angle) * baseX + Math.cos(angle) * baseZ;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#C9A227"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
