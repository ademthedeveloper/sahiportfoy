import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Drifting gold particles around the building. Each particle orbits the
 * origin at a different speed, with subtle vertical motion. Uses raw
 * THREE.Points so we can hand-author the geometry / shader uniforms.
 */
const COUNT = 80;

export default function ParticlesField() {
  const ref = useRef(null);

  const { positions, speeds, basePositions } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const basePositions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
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
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
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
          count={COUNT}
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
