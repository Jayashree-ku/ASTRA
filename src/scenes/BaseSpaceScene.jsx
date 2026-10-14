import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import StarField from '../components/StarField';
import GlowingStar from '../components/GlowingStar';
import Exoplanet from '../components/Exoplanet';
import EmotionParticles from '../components/EmotionParticles';

/**
 * NebulaClouds — subtle volumetric fog layers for depth
 */
function NebulaClouds() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.008;
      ref.current.rotation.z = clock.getElapsedTime() * 0.003;
    }
  });

  const clouds = [
    { pos: [12, 3, -20], scale: 14, color: '#001133', opacity: 0.18 },
    { pos: [-15, -5, -18], scale: 12, color: '#002244', opacity: 0.14 },
    { pos: [5, -10, -25], scale: 18, color: '#000d22', opacity: 0.12 },
  ];

  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color={c.color}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            side={2}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * DistantGalaxies — a few sprite-like distant glow blobs
 */
function DistantGalaxies() {
  const defs = [
    { pos: [40, 15, -60], color: '#334466', r: 3 },
    { pos: [-50, -10, -70], color: '#223355', r: 2.5 },
    { pos: [20, -30, -55], color: '#112244', r: 4 },
  ];
  return (
    <>
      {defs.map((g, i) => (
        <mesh key={i} position={g.pos}>
          <sphereGeometry args={[g.r, 8, 8]} />
          <meshBasicMaterial color={g.color} transparent opacity={0.35} depthWrite={false} side={2} />
        </mesh>
      ))}
    </>
  );
}

/**
 * BaseSpaceScene — The persistent 3D backdrop used across all sections.
 */
export default function BaseSpaceScene() {
  return (
    <Canvas
      camera={{ position: [0, 4, 18], fov: 60, near: 0.1, far: 500 }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      shadows={false}
    >
      <color attach="background" args={['#020a18']} />
      <fog attach="fog" args={['#020a18', 80, 220]} />

      <ambientLight intensity={0.1} color="#3355aa" />

      <Suspense fallback={null}>
        <StarField count={9000} />
        <EmotionParticles count={2500} />
        <DistantGalaxies />
        <NebulaClouds />

        {/* Central star */}
        <GlowingStar position={[-3, 0.5, -6]} />

        {/* Inner planet — blue super-Earth */}
        <Exoplanet
          orbitRadius={5.2}
          orbitSpeed={0.085}
          size={0.52}
          color="#1a5faa"
          atmColor="#3399ff"
          tilt={0.22}
          phaseOffset={0}
        />

        {/* Outer planet — ringed gas giant */}
        <Exoplanet
          orbitRadius={9.5}
          orbitSpeed={0.038}
          size={0.82}
          color="#8b4513"
          atmColor="#cc7733"
          tilt={0.45}
          phaseOffset={1.8}
        />

        {/* Third distant planet */}
        <Exoplanet
          orbitRadius={14}
          orbitSpeed={0.022}
          size={0.4}
          color="#2d6060"
          atmColor="#44aaaa"
          tilt={0.1}
          phaseOffset={4.2}
        />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.04}
        rotateSpeed={0.35}
        zoomSpeed={0.5}
        minDistance={6}
        maxDistance={70}
        autoRotate
        autoRotateSpeed={0.12}
      />
    </Canvas>
  );
}
