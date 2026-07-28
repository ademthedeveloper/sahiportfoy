import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * A modern 2-level villa with a pitched gable roof — a recognisable
 * "house" silhouette (not a stepped-slab tower).
 *
 * Composition:
 *   - 2 horizontal floor bodies (FLOOR_COUNT = 2): wider ground floor and a
 *     setback upper floor. Each exposes a ref via the `floorRefs` array so
 *     the parent's scroll-explode loop still works.
 *   - Pitched gable roof (triangular prism, 2 sloped rectangles + 2 triangle
 *     ends) sitting on top of the upper floor.
 *   - Chimney: small box on the rear slope of the roof.
 *   - Balcony railing: thin posts + top rail across the front of the
 *     upper-floor cantilever.
 *   - Front door: tall panel on the front face of the ground floor.
 *   - 3 ground-floor window panels (was 4; one slot is now the door).
 *   - 2 vertical front-corner posts.
 *   - Pool deck in front of the building.
 *   - 2 parallel driveway lines approaching from the foreground.
 *   - Tree to the right: stacked cone canopy + cylinder trunk.
 *
 * Performance: every repeated geometry is `useMemo`d once. All edge
 * materials are shared. No per-frame work in this file. Mobile budget
 * preserved (DPR/AA/cubemap/particle-cap concerns live in Centerpiece3D).
 */
const FLOOR_COUNT = 2;
const FLOOR_HEIGHT = 0.85;

// 2 floor bodies — ground floor is wider; upper floor is set back and narrower.
const FLOOR_WIDTHS = [3.8, 2.9];
const FLOOR_DEPTHS = [2.4, 2.0];
const FLOOR_FRONT_OFFSETS = [0, 0.25]; // upper floor steps back
const FLOOR_THICKNESS = 0.1;

const POST_HEIGHT = FLOOR_HEIGHT * FLOOR_COUNT + 0.05;
const POST_RADIUS = 0.025;

// Front-face openings: 3 windows + 1 door (left → right). Door is the
// rightmost slot, slightly wider.
const WINDOW_COUNT = 3;
const WINDOW_WIDTH = 0.5;
const WINDOW_HEIGHT = 0.95;
const WINDOW_SPACING = 0.18;
const DOOR_WIDTH = 0.7;
const DOOR_HEIGHT = 1.05;

// Pool deck in front.
const POOL_WIDTH = 3.4;
const POOL_DEPTH = 1.2;
const POOL_THICKNESS = 0.04;

// Pitched gable roof — built from a triangular prism.
const ROOF_WIDTH = 3.0; // matches upper floor + small overhang
const ROOF_DEPTH = 2.2;
const ROOF_HEIGHT = 1.1;
const ROOF_OVERHANG = 0.15;

// Balcony railing.
const RAIL_POST_COUNT = 7;
const RAIL_RAIL_THICKNESS = 0.012;

// Tree (to the right of the villa).
const TREE_X = 2.4;
const TREE_TRUNK_HEIGHT = 0.5;
const TREE_TRUNK_RADIUS = 0.06;
const TREE_CANOPY_RADIUS = 0.55;

export default function BuildingModel({ floorRefs, groupRef }) {
  // Shared edge geometries -----------------------------------------------
  const slabEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1, FLOOR_THICKNESS, 1)),
    []
  );

  const postEdges = useMemo(
    () => new THREE.EdgesGeometry(
      new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, 1, 8)
    ),
    []
  );

  const windowEdges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)),
    []
  );

  const poolEdges = useMemo(
    () => new THREE.EdgesGeometry(
      new THREE.BoxGeometry(POOL_WIDTH, POOL_THICKNESS, POOL_DEPTH)
    ),
    []
  );

  // Roof as a triangular prism: 6 vertices (2 ridge, 4 base corners).
  // We use LineSegments built from a custom BufferGeometry to outline it.
  const roofLineGeom = useMemo(() => {
    const w = ROOF_WIDTH / 2;
    const d = ROOF_DEPTH / 2;
    const h = ROOF_HEIGHT;
    // Base 4 corners (CCW when viewed from +X looking down the roof slope)
    const p0 = [-w, 0, -d]; // back-left base
    const p1 = [w, 0, -d];  // back-right base
    const p2 = [w, 0, d];   // front-right base
    const p3 = [-w, 0, d];  // front-left base
    // Ridge endpoints
    const p4 = [-w, h, 0];  // left ridge
    const p5 = [w, h, 0];   // right ridge
    // Edges: 2 sloped top edges (p4-p5 back, p4-p5 front), 4 base edges,
    // 4 rafter edges (base corner → ridge end).
    const verts = new Float32Array([
      ...p0, ...p1, // back base
      ...p1, ...p2, // right base
      ...p2, ...p3, // front base
      ...p3, ...p0, // left base
      ...p0, ...p4, // back-left rafter
      ...p1, ...p5, // back-right rafter
      ...p2, ...p5, // front-right rafter
      ...p3, ...p4, // front-left rafter
      ...p4, ...p5, // ridge
    ]);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geom;
  }, []);

  // Triangular gable end (the visible end-cap of the roof). Used twice
  // (front + back gable triangles).
  const gableTriangleGeom = useMemo(() => {
    const w = ROOF_WIDTH / 2;
    const h = ROOF_HEIGHT;
    const verts = new Float32Array([
      -w, 0, 0,   w, 0, 0,
      w, 0, 0,    0, h, 0,
      0, h, 0,   -w, 0, 0,
    ]);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return geom;
  }, []);

  // Shared materials — keep the existing gold vocabulary.
  const goldEdgeMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#C9A227', transparent: true, opacity: 0.95 }),
    []
  );
  const goldEdgeSoftMat = useMemo(
    () => new THREE.LineBasicMaterial({ color: '#D9B94A', transparent: true, opacity: 0.75 }),
    []
  );
  const glassMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#0F172A',
      transparent: true,
      opacity: 0.32,
      metalness: 0.4,
      roughness: 0.25,
    }),
    []
  );
  const slabSolidMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#0F172A',
      transparent: true,
      opacity: 0.22,
      metalness: 0.5,
      roughness: 0.4,
    }),
    []
  );
  const roofFillMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#1A1410',
      transparent: true,
      opacity: 0.35,
      metalness: 0.3,
      roughness: 0.5,
    }),
    []
  );
  const doorMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#3A2710',
      transparent: true,
      opacity: 0.55,
      metalness: 0.2,
      roughness: 0.6,
    }),
    []
  );
  const trunkMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#5C3A1E',
      transparent: true,
      opacity: 0.7,
      metalness: 0.1,
      roughness: 0.8,
    }),
    []
  );

  // Pre-compute floor y-positions: ground floor centered at -POST_HEIGHT/2 +
  // FLOOR_HEIGHT/2; upper floor stacked above.
  const floorY = useMemo(() => {
    const out = [];
    for (let i = 0; i < FLOOR_COUNT; i++) {
      out.push(i * FLOOR_HEIGHT - POST_HEIGHT / 2 + FLOOR_HEIGHT / 2);
    }
    return out;
  }, []);

  // Compute the 4 front-opening x positions (3 windows + 1 door).
  // Total span uses WINDOW widths for windows and DOOR width for the door.
  const openingX = useMemo(() => {
    const widths = [WINDOW_WIDTH, WINDOW_WIDTH, WINDOW_WIDTH, DOOR_WIDTH];
    const totalSpan =
      widths.reduce((a, b) => a + b, 0) + (widths.length - 1) * WINDOW_SPACING;
    const startX = -totalSpan / 2;
    const out = [];
    let cursor = startX;
    for (const w of widths) {
      out.push(cursor + w / 2);
      cursor += w + WINDOW_SPACING;
    }
    return out;
  }, []);

  return (
    <group ref={groupRef}>
      {/* === 2 floor bodies === */}
      {Array.from({ length: FLOOR_COUNT }).map((_, i) => {
        const w = FLOOR_WIDTHS[i];
        const d = FLOOR_DEPTHS[i];
        const z = -FLOOR_FRONT_OFFSETS[i];
        const isUpper = i === 1;
        return (
          <group
            key={i}
            ref={(el) => (floorRefs.current[i] = el)}
            position={[0, floorY[i], z]}
          >
            {/* Solid slab */}
            <mesh material={slabSolidMat} scale={[w, 1, d]}>
              <boxGeometry args={[1, FLOOR_THICKNESS, 1]} />
            </mesh>
            {/* Gold edges */}
            <lineSegments geometry={slabEdges} material={goldEdgeMat} scale={[w, 1, d]} />

            {/* Cantilevered balcony on the upper floor: thin slab sticking
                out of the front face. */}
            {isUpper && (
              <group
                position={[
                  0,
                  -FLOOR_HEIGHT * 0.45,
                  FLOOR_DEPTHS[1] / 2 + 0.3,
                ]}
              >
                <mesh material={slabSolidMat}>
                  <boxGeometry args={[2.6, FLOOR_THICKNESS * 0.8, 0.6]} />
                </mesh>
                <lineSegments
                  material={goldEdgeMat}
                >
                  <edgesGeometry args={[new THREE.BoxGeometry(2.6, FLOOR_THICKNESS * 0.8, 0.6)]} />
                </lineSegments>

                {/* Balcony railing: posts + top rail */}
                {Array.from({ length: RAIL_POST_COUNT }).map((__, k) => {
                  const x = -1.2 + (k * 2.4) / (RAIL_POST_COUNT - 1);
                  return (
                    <mesh
                      key={k}
                      position={[x, 0.22, 0.3]}
                      scale={[1, 0.42, 1]}
                      material={goldEdgeSoftMat}
                    >
                      <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
                    </mesh>
                  );
                })}
                {/* Top rail */}
                <mesh
                  position={[0, 0.42, 0.3]}
                  scale={[2.4, 1, 1]}
                  material={goldEdgeMat}
                >
                  <boxGeometry args={[1, RAIL_RAIL_THICKNESS, RAIL_RAIL_THICKNESS]} />
                </mesh>
                {/* Bottom rail */}
                <mesh
                  position={[0, 0.05, 0.3]}
                  scale={[2.4, 1, 1]}
                  material={goldEdgeSoftMat}
                >
                  <boxGeometry args={[1, RAIL_RAIL_THICKNESS, RAIL_RAIL_THICKNESS]} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* === Pitched gable roof === */}
      <group
        position={[
          0,
          floorY[FLOOR_COUNT - 1] + FLOOR_HEIGHT / 2 + ROOF_HEIGHT / 2,
          -FLOOR_FRONT_OFFSETS[FLOOR_COUNT - 1],
        ]}
      >
        {/* Fill mesh for the roof (triangular prism) — gives the roof a
            solid backing that catches the directional light. */}
        <mesh material={roofFillMat}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={18}
              array={new Float32Array([
                // back triangle (z = -ROOF_DEPTH/2)
                -ROOF_WIDTH/2, 0, -ROOF_DEPTH/2,
                ROOF_WIDTH/2, 0, -ROOF_DEPTH/2,
                0, ROOF_HEIGHT, -ROOF_DEPTH/2,
                // front triangle (z = +ROOF_DEPTH/2)
                -ROOF_WIDTH/2, 0, ROOF_DEPTH/2,
                0, ROOF_HEIGHT, ROOF_DEPTH/2,
                ROOF_WIDTH/2, 0, ROOF_DEPTH/2,
                // back slope (bottom edge back, then triangles up to ridge)
                -ROOF_WIDTH/2, 0, -ROOF_DEPTH/2,
                ROOF_WIDTH/2, 0, -ROOF_DEPTH/2,
                0, ROOF_HEIGHT, 0,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
        </mesh>
        {/* Wireframe lines: prism edges + gable triangles */}
        <lineSegments geometry={roofLineGeom} material={goldEdgeMat} />
        <lineSegments
          geometry={gableTriangleGeom}
          material={goldEdgeMat}
          position={[0, 0, ROOF_DEPTH / 2 - 0.001]}
        />
        <lineSegments
          geometry={gableTriangleGeom}
          material={goldEdgeMat}
          position={[0, 0, -ROOF_DEPTH / 2 + 0.001]}
        />

        {/* Chimney on the rear slope */}
        <group position={[-ROOF_WIDTH * 0.28, ROOF_HEIGHT * 0.15, -ROOF_DEPTH * 0.25]}>
          <mesh material={slabSolidMat}>
            <boxGeometry args={[0.18, 0.45, 0.18]} />
          </mesh>
          <lineSegments
            material={goldEdgeMat}
          >
            <edgesGeometry args={[new THREE.BoxGeometry(0.18, 0.45, 0.18)]} />
          </lineSegments>
        </group>
      </group>

      {/* === 2 vertical front-corner posts === */}
      {[
        [-FLOOR_WIDTHS[0] / 2 + 0.05, -FLOOR_DEPTHS[0] / 2 + 0.05],
        [+FLOOR_WIDTHS[0] / 2 - 0.05, -FLOOR_DEPTHS[0] / 2 + 0.05],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} scale={[1, POST_HEIGHT, 1]}>
          <mesh>
            <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, 1, 8]} />
            <meshStandardMaterial
              color="#C9A227"
              metalness={0.9}
              roughness={0.25}
              transparent
              opacity={0.85}
            />
          </mesh>
          <lineSegments geometry={postEdges} material={goldEdgeSoftMat} />
        </group>
      ))}

      {/* === Front face: 3 windows + 1 door (rightmost) === */}
      <group
        position={[
          0,
          floorY[0] - 0.05,
          -FLOOR_DEPTHS[0] / 2 + 0.001,
        ]}
      >
        {[WINDOW_WIDTH, WINDOW_WIDTH, WINDOW_WIDTH, DOOR_WIDTH].map((w, i) => {
          const isDoor = i === 3;
          const h = isDoor ? DOOR_HEIGHT : WINDOW_HEIGHT;
          const x = openingX[i];
          return (
            <group key={i} position={[x, 0, 0]}>
              {/* Fill */}
              <mesh material={isDoor ? doorMat : glassMat}>
                <planeGeometry args={[w, h]} />
              </mesh>
              {/* Gold frame outline — reuses the unit windowEdges geometry
                  and scales it to match each opening's size. */}
              <lineSegments
                geometry={windowEdges}
                material={goldEdgeMat}
                scale={[w, h, 1]}
              />
              {/* Door handle */}
              {isDoor && (
                <mesh position={[w * 0.35, 0, 0.01]} material={goldEdgeMat}>
                  <boxGeometry args={[0.04, 0.12, 0.02]} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* === Pool deck in front of the building === */}
      <group
        position={[
          0,
          -POST_HEIGHT / 2 + 0.001,
          -FLOOR_DEPTHS[0] / 2 - POOL_DEPTH / 2 - 0.05,
        ]}
      >
        <mesh material={slabSolidMat}>
          <boxGeometry args={[POOL_WIDTH, POOL_THICKNESS, POOL_DEPTH]} />
        </mesh>
        <lineSegments geometry={poolEdges} material={goldEdgeSoftMat} />
      </group>

      {/* === Driveway: 2 parallel gold lines approaching the pool === */}
      <group
        position={[
          0,
          -POST_HEIGHT / 2 + 0.002,
          -FLOOR_DEPTHS[0] / 2 - POOL_DEPTH - 0.5,
        ]}
      >
        {[-0.7, +0.7].map((x, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([x, 0, 0, x, 0, 1.0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#C9A227" transparent opacity={0.55} />
          </line>
        ))}
      </group>

      {/* === Tree to the right of the villa === */}
      <group position={[TREE_X, -POST_HEIGHT / 2, 0]}>
        {/* Trunk */}
        <mesh position={[0, TREE_TRUNK_HEIGHT / 2, 0]} material={trunkMat}>
          <cylinderGeometry args={[TREE_TRUNK_RADIUS, TREE_TRUNK_RADIUS, TREE_TRUNK_HEIGHT, 6]} />
        </mesh>
        {/* Canopy: 3 stacked cones for a tiered look */}
        {[0, 0.25, 0.5].map((yOff, i) => (
          <mesh
            key={i}
            position={[0, TREE_TRUNK_HEIGHT + 0.2 + yOff, 0]}
          >
            <coneGeometry args={[TREE_CANOPY_RADIUS * (1 - i * 0.18), 0.45, 8]} />
            <meshStandardMaterial
              color="#0F2A1A"
              transparent
              opacity={0.45}
              metalness={0.2}
              roughness={0.6}
            />
          </mesh>
        ))}
        {/* Canopy edges — wireframe cone outlines using a single cone geom */}
        {useMemo(() => null, []) /* no-op for hook-order stability */}
        {[0, 0.25, 0.5].map((yOff, i) => {
          const r = TREE_CANOPY_RADIUS * (1 - i * 0.18);
          return (
            <lineSegments
              key={`e-${i}`}
              position={[0, TREE_TRUNK_HEIGHT + 0.2 + yOff, 0]}
              material={goldEdgeSoftMat}
            >
              <edgesGeometry args={[new THREE.ConeGeometry(r, 0.45, 8)]} />
            </lineSegments>
          );
        })}
      </group>

      {/* === Base ring on the floor === */}
      <mesh
        position={[0, -POST_HEIGHT / 2 - 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.4, 2.5, 64]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export { FLOOR_COUNT, FLOOR_HEIGHT };
