import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { INITIAL_LINKS, SOURCE_NODE, PRIMARY_STRIKE_LINK } from '../utils/networkData';

// ─────────────────────────────────────────────────────────────────────────────
// StarBackground — proper component so useMemo is valid
// ─────────────────────────────────────────────────────────────────────────────
function StarBackground() {
  const positions = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#aaccff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NetworkNode — glowing sphere + label
// ─────────────────────────────────────────────────────────────────────────────
function NetworkNode({ node, inRoute }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + 0.08 * Math.sin(t * 1.8 + node.position[0]);
    }
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = inRoute
        ? 1.0 + 0.5 * Math.sin(t * 3)
        : 0.4 + 0.1 * Math.sin(t * 1.2 + node.position[2]);
    }
  });

  const size  = node.type === 'earth' ? 0.38 : node.type === 'telescope' ? 0.3 : 0.22;
  const color = inRoute ? '#00ffcc' : node.color;

  return (
    <group position={node.position}>
      {/* Pulsing halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 28, 28]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Ring accent for Earth & Telescope */}
      {(node.type === 'earth' || node.type === 'telescope') && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 1.5, size * 0.06, 6, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      )}

      <Text
        position={[0, size + 0.3, 0]}
        fontSize={0.15}
        color={inRoute ? '#00ffcc' : '#88bbdd'}
        anchorX="center"
        anchorY="bottom"
      >
        {node.label}
      </Text>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NetworkLink — animated communication beam between nodes
// ─────────────────────────────────────────────────────────────────────────────
function NetworkLink({ link, nodes, isDisrupted, inRoute }) {
  const lineRef = useRef();

  const fromNode = nodes.find((n) => n.id === link.from);
  const toNode   = nodes.find((n) => n.id === link.to);

  const geom = useMemo(() => {
    if (!fromNode || !toNode) return null;
    const pts = [
      new THREE.Vector3(...fromNode.position),
      new THREE.Vector3(...toNode.position),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [link.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const t = clock.getElapsedTime();
    if (inRoute && !isDisrupted) {
      lineRef.current.material.opacity = 0.65 + 0.3 * Math.abs(Math.sin(t * 2.8));
    }
  });

  if (!geom) return null;

  const color   = isDisrupted ? '#ff2200' : inRoute ? '#00ffcc' : '#004488';
  const opacity = isDisrupted ? 0.35 : inRoute ? 0.85 : 0.25;

  return (
    <line ref={lineRef} geometry={geom}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </line>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Asteroid — streaking rock with glow, moves from off-screen to link midpoint
// ─────────────────────────────────────────────────────────────────────────────
function Asteroid({ nodes, progress, active }) {
  const meshRef  = useRef();

  const fromNode = nodes.find((n) => n.id === SOURCE_NODE);
  const toLink   = INITIAL_LINKS.find((l) => l.id === PRIMARY_STRIKE_LINK);
  const toNode   = toLink ? nodes.find((n) => n.id === toLink.to) : null;

  useFrame(({ clock }) => {
    if (meshRef.current && active) {
      meshRef.current.rotation.x += 0.06;
      meshRef.current.rotation.z += 0.04;
    }
  });

  if (!active || !fromNode || !toNode) return null;

  const start = new THREE.Vector3(-10, 7, -10);
  const end   = new THREE.Vector3(...fromNode.position)
    .lerp(new THREE.Vector3(...toNode.position), 0.5);
  const pos   = start.clone().lerp(end, progress).toArray();

  return (
    <group position={pos}>
      {/* Glow aura */}
      <mesh>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={0.18} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      {/* Rock body */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial
          color="#bb7733"
          emissive="#ff3300"
          emissiveIntensity={2}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
      <pointLight intensity={6} distance={5} color="#ff5500" />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NetworkScene — assembles all 3D elements inside one Canvas context
// ─────────────────────────────────────────────────────────────────────────────
function NetworkScene({
  nodes, links, currentRoute, routeLinkIds,
  disruptedLinks, asteroidProgress, asteroidActive,
}) {
  return (
    <>
      <ambientLight intensity={0.18} color="#112255" />
      <directionalLight position={[8, 12, 6]} intensity={0.6} color="#99ccff" />
      <pointLight position={[0, 0, 0]} intensity={1} distance={30} color="#0044aa" />

      <StarBackground />

      {links.map((link) => (
        <NetworkLink
          key={link.id}
          link={link}
          nodes={nodes}
          isDisrupted={disruptedLinks.includes(link.id)}
          inRoute={routeLinkIds.includes(link.id)}
        />
      ))}

      {nodes.map((node) => (
        <NetworkNode
          key={node.id}
          node={node}
          inRoute={currentRoute.includes(node.id)}
        />
      ))}

      <Asteroid
        nodes={nodes}
        progress={asteroidProgress}
        active={asteroidActive}
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        autoRotate
        autoRotateSpeed={0.35}
        minDistance={3}
        maxDistance={30}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export default function Network3DView({
  nodes, links, currentRoute, routeLinkIds,
  disruptedLinks, asteroidProgress, asteroidActive,
}) {
  return (
    <Canvas
      camera={{ position: [6, 5, 9], fov: 52, near: 0.1, far: 250 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
    >
      <color attach="background" args={['#020814']} />
      <fog attach="fog" args={['#020814', 40, 120]} />
      <NetworkScene
        nodes={nodes}
        links={links}
        currentRoute={currentRoute}
        routeLinkIds={routeLinkIds}
        disruptedLinks={disruptedLinks}
        asteroidProgress={asteroidProgress}
        asteroidActive={asteroidActive}
      />
    </Canvas>
  );
}
