import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A modern luxury high-rise rendered as an architectural wireframe.
 * - 14 stacked floor slabs (box + EdgesGeometry overlay)
 * - 4 vertical corner mullions
 * - Crown geometry on top, plus an antenna line
 * - Material: subtle dark-navy slab + bright gold edge lines
 *
 * The floors are stored in a ref array so the parent can tween each
 * position.y for the "explode into layers" effect.
 */
const FLOOR_COUNT = 14;
const FLOOR_HEIGHT = 0.32;
const FLOOR_WIDTH = 1.8;
const FLOOR_DEPTH = 1.4;
const FLOOR_THICKNESS = 0.06;

export function useBuildingRefs() {
  // Returns a stable ref-array the parent can use to tween floor positions.
  const refs = useRef([]);
  refs.current = new Array(FLOOR_COUNT).fill(null);
  return refs;
}

export default function BuildingModel({ floorRefs, groupRef }) {
  const crownRef = useRef(null);
  const antennaRef = useRef(null);
  const solidRef = useRef(null);

  // Pre-compute the edge geometry for the building silhouette.
  const edges = useMemo(() => {
    const box = new THREE.BoxGeometry(
      FLOOR_WIDTH,
      FLOOR_THICKNESS,
      FLOOR_DEPTH
    );
    return new THREE.EdgesGeometry(box);
  }, []);

  // The body of the building — a near-invisible solid that helps the gold
  // edge lines read as a real object. Just a tall thin box, very transparent.
  const solidGeometry = useMemo(
    () => new THREE.BoxGeometry(FLOOR_WIDTH * 0.98, FLOOR_HEIGHT * FLOOR_COUNT, FLOOR_DEPTH * 0.98),
    []
  );

  // Mullion geometry (corners)
  const mullionGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.018, 0.018, FLOOR_HEIGHT * FLOOR_COUNT, 8),
    []
  );
  const mullionEdges = useMemo(
    () => new THREE.EdgesGeometry(mullionGeometry),
    []
  );

  // Crown geometry (a smaller box on top, plus a slab).
  const crownGeometry = useMemo(
    () => new THREE.BoxGeometry(FLOOR_WIDTH * 0.55, 0.18, FLOOR_DEPTH * 0.55),
    []
  );
  const crownEdges = useMemo(
    () => new THREE.EdgesGeometry(crownGeometry),
    []
  );

  useFrame((state) => {
    if (crownRef.current) {
      // Subtle ambient breathing on the crown so it doesn't feel frozen.
      crownRef.current.position.y =
        FLOOR_HEIGHT * (FLOOR_COUNT + 0.5) +
        Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
    }
    if (antennaRef.current) {
      antennaRef.current.position.y =
        FLOOR_HEIGHT * (FLOOR_COUNT + 1.1) +
        Math.sin(state.clock.elapsedTime * 0.9) * 0.025;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body — subtle dark navy solid */}
      <mesh geometry={solidGeometry} ref={solidRef}>
        <meshStandardMaterial
          color="#0F172A"
          transparent
          opacity={0.18}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Floor slabs — each in its own ref so the parent can explode them */}
      {Array.from({ length: FLOOR_COUNT }).map((_, i) => {
        const y = i * FLOOR_HEIGHT - (FLOOR_COUNT * FLOOR_HEIGHT) / 2 + FLOOR_HEIGHT / 2;
        return (
          <group key={i} ref={(el) => (floorRefs.current[i] = el)} position={[0, y, 0]}>
            {/* Subtle solid slab */}
            <mesh>
              <boxGeometry
                args={[FLOOR_WIDTH, FLOOR_THICKNESS, FLOOR_DEPTH]}
              />
              <meshStandardMaterial
                color="#0F172A"
                transparent
                opacity={0.22}
                metalness={0.6}
                roughness={0.35}
              />
            </mesh>
            {/* Gold edge lines */}
            <lineSegments geometry={edges}>
              <lineBasicMaterial color="#C9A227" transparent opacity={0.95} />
            </lineSegments>
          </group>
        );
      })}

      {/* Vertical corner mullions */}
      {[
        [+FLOOR_WIDTH / 2, +FLOOR_DEPTH / 2],
        [+FLOOR_WIDTH / 2, -FLOOR_DEPTH / 2],
        [-FLOOR_WIDTH / 2, +FLOOR_DEPTH / 2],
        [-FLOOR_WIDTH / 2, -FLOOR_DEPTH / 2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh geometry={mullionGeometry}>
            <meshStandardMaterial
              color="#C9A227"
              metalness={0.9}
              roughness={0.25}
              transparent
              opacity={0.85}
            />
          </mesh>
          <lineSegments geometry={mullionEdges}>
            <lineBasicMaterial color="#D9B94A" transparent opacity={0.6} />
          </lineSegments>
        </group>
      ))}

      {/* Crown */}
      <group ref={crownRef} position={[0, FLOOR_HEIGHT * (FLOOR_COUNT + 0.5), 0]}>
        <mesh geometry={crownGeometry}>
          <meshStandardMaterial
            color="#0F172A"
            transparent
            opacity={0.25}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <lineSegments geometry={crownEdges}>
          <lineBasicMaterial color="#C9A227" transparent opacity={0.95} />
        </lineSegments>
      </group>

      {/* Antenna — a single line from the crown */}
      <line ref={antennaRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              // y is in local space; we re-position the whole line in useFrame
              new Float32Array([0, 0, 0, 0, 0.4, 0])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#C9A227" transparent opacity={0.9} />
      </line>

      {/* Base — a thin disc on the floor */}
      <mesh
        position={[0, -FLOOR_HEIGHT * (FLOOR_COUNT / 2) - 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[FLOOR_WIDTH * 0.55, FLOOR_WIDTH * 0.62, 64]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export { FLOOR_COUNT, FLOOR_HEIGHT };
