import { useEffect, useRef } from 'react';

/**
 * Three-point lighting tuned for a gold wireframe villa on a deep navy backdrop.
 *
 * The previous version drove `keyRef`/`fillRef`/`rimRef` intensity per-frame
 * via `useFrame` so the lights "shifted" as the user scrolled. That cost a
 * handful of writes per frame for a visual effect the user never consciously
 * notices — and on the aggressive-mobile-perf pass, it has to go. The
 * light setup is now static; the *visual* feel of the rig still reads as
 * warm-front + cool-back because of the color choices, not the animation.
 *
 * The Drei `<Environment preset="city">` cubemap was removed entirely in the
 * parent (Centerpiece3D.jsx) — it was the single biggest mobile cost. The
 * gold edges pick up their specular kick from the directional lights +
 * ambient below.
 */
export default function LightingRig({ progress = 0 }) {
  const keyRef = useRef(null);
  const fillRef = useRef(null);
  const rimRef = useRef(null);

  // Write the initial intensities once. `progress` is now only used to set
  // a baseline; we don't animate per frame anymore.
  useEffect(() => {
    if (keyRef.current) keyRef.current.intensity = 1.4 + progress * 0.6;
    if (fillRef.current) fillRef.current.intensity = 0.6 + progress * 0.3;
    if (rimRef.current) rimRef.current.intensity = 1.1 - progress * 0.3;
  }, [progress]);

  return (
    <>
      <ambientLight intensity={0.35} color="#f5e9c8" />

      <directionalLight
        ref={keyRef}
        position={[5, 6, 4]}
        intensity={1.4}
        color="#fff4d6"
      />

      <directionalLight
        ref={fillRef}
        position={[-4, 3, 2]}
        intensity={0.6}
        color="#ffd680"
      />

      <directionalLight
        ref={rimRef}
        position={[0, 2, -6]}
        intensity={1.1}
        color="#7da3ff"
      />

      {/* Front warm point — was already here; raised intensity slightly to
          compensate for the dropped Environment cubemap. */}
      <pointLight
        position={[0, 0, 4]}
        intensity={1.1}
        color="#C9A227"
        distance={8}
        decay={2}
      />
    </>
  );
}

// Note: `useFrame` was intentionally removed. The rig now sets its
// intensities once on mount via the `useEffect` above. This was a deliberate
// part of the aggressive mobile perf pass — per-frame writes to three light
// intensities per frame for a barely-perceptible effect was wasted work.
