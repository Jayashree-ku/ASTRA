import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GlowingStar — Animated central star with corona rings and pulsing glow.
 */
export default function GlowingStar({ position = [0, 0, 0] }) {
  const coreRef  = useRef();
  const corona1  = useRef();
  const corona2  = useRef();
  const glowRef  = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = 1.5 + 0.5 * Math.sin(t * 2.1);
    }
    if (corona1.current) {
      corona1.current.rotation.z = t * 0.3;
      corona1.current.scale.setScalar(1 + 0.05 * Math.sin(t * 1.7));
    }
    if (corona2.current) {
      corona2.current.rotation.z = -t * 0.18;
      corona2.current.scale.setScalar(1 + 0.08 * Math.sin(t * 0.9));
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.18 + 0.07 * Math.sin(t * 1.3);
      glowRef.current.scale.setScalar(1 + 0.1 * Math.sin(t * 0.7));
    }
  });

  // Corona ring geometry (torus with radial variation)
  const coronaGeom = useMemo(() => {
    const g = new THREE.TorusGeometry(1.6, 0.04, 12, 80);
    return g;
  }, []);

  return (
    <group position={position}>
      {/* Outer glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#ffe066" transparent opacity={0.18} depthWrite={false} side={THREE.BackSide} />
      </mesh>

      {/* Core star */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#fff5cc"
          emissive="#ffaa00"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>

      {/* Corona ring 1 */}
      <mesh ref={corona1} geometry={coronaGeom}>
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Corona ring 2 — tilted */}
      <mesh ref={corona2} geometry={coronaGeom} rotation={[Math.PI / 4, 0, 0]}>
        <meshBasicMaterial color="#ff8800" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Point light for scene illumination */}
      <pointLight intensity={4} distance={80} color="#fff5cc" />
      <pointLight intensity={2} distance={40} color="#ffaa44" />
    </group>
  );
}
