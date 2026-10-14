import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Exoplanet — Rotating planet with atmospheric glow, orbital path and axial tilt.
 */
export default function Exoplanet({
  orbitRadius = 5,
  orbitSpeed  = 0.08,
  size        = 0.55,
  color       = '#1a6fbd',
  atmColor    = '#4af',
  tilt        = 0.3,
  phaseOffset = 0,
}) {
  const groupRef  = useRef();
  const planetRef = useRef();
  const atmRef    = useRef();
  const ringRef   = useRef();

  // Orbit path geometry
  const orbitGeom = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
    }
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [orbitRadius]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const angle = t * orbitSpeed + phaseOffset;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.004;
    }
    if (atmRef.current) {
      atmRef.current.material.opacity = 0.22 + 0.06 * Math.sin(t * 1.1);
    }
  });

  return (
    <>
      {/* Orbital path ring */}
      <line geometry={orbitGeom}>
        <lineBasicMaterial color="#00aaff" transparent opacity={0.12} depthWrite={false} />
      </line>

      {/* Planet group — moves along orbit */}
      <group ref={groupRef} rotation={[tilt, 0, 0]}>
        {/* Atmosphere glow */}
        <mesh ref={atmRef}>
          <sphereGeometry args={[size * 1.25, 32, 32]} />
          <meshBasicMaterial color={atmColor} transparent opacity={0.22} depthWrite={false} side={THREE.BackSide} />
        </mesh>

        {/* Planet surface */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshStandardMaterial
            color={color}
            roughness={0.75}
            metalness={0.05}
            emissive={color}
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Small ring (Saturn-like) */}
        <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
          <torusGeometry args={[size * 1.6, size * 0.04, 4, 64]} />
          <meshBasicMaterial color="#aaccff" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}
