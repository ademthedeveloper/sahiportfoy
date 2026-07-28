import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Three-point lighting tuned for a gold wireframe on a deep navy backdrop.
 * Two warm key lights from the front and a cool rim light from behind.
 * The light intensity is driven by an external `progress` value (0..1)
 * from the ScrollTrigger so the building shifts from cool to warm tones
 * as the user scrolls.
 */
export default function LightingRig({ progress = 0 }) {
  const keyRef = useRef(null);
  const fillRef = useRef(null);
  const rimRef = useRef(null);

  useFrame(() => {
    if (keyRef.current) {
      // Warm key light — intensity rises with progress.
      keyRef.current.intensity = 1.4 + progress * 0.6;
    }
    if (fillRef.current) {
      fillRef.current.intensity = 0.6 + progress * 0.3;
    }
    if (rimRef.current) {
      // Cool rim — fades a touch as warm takes over.
      rimRef.current.intensity = 1.1 - progress * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} color="#f5e9c8" />
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
      <pointLight
        position={[0, 0, 4]}
        intensity={0.8}
        color="#C9A227"
        distance={8}
        decay={2}
      />
    </>
  );
}
