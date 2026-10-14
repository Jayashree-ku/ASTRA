import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAstraStore } from '../store/useAstraStore';
import { EMOTION_CONFIG } from '../utils/audioEngine';
import * as THREE from 'three';

/**
 * EmotionParticles — 3000 particle cloud that shifts color and behavior
 * based on the currently selected cosmic emotion (Rasa).
 */
export default function EmotionParticles({ count = 3000 }) {
  const ref = useRef();
  const activeEmotion = useAstraStore((s) => s.activeEmotion);

  const [positions, baseColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      col[i * 3]     = 0.2;
      col[i * 3 + 1] = 0.6;
      col[i * 3 + 2] = 1.0;
    }
    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = t * 0.007;

    // Shift particle color to match active emotion
    if (activeEmotion && EMOTION_CONFIG[activeEmotion]) {
      const cfg = EMOTION_CONFIG[activeEmotion];
      const col = new THREE.Color(cfg.particleColor);
      const arr = ref.current.geometry.attributes.color.array;
      for (let i = 0; i < count; i++) {
        const flicker = 0.6 + 0.4 * Math.sin(t * 3 + i * 0.1);
        arr[i * 3]     = col.r * flicker;
        arr[i * 3 + 1] = col.g * flicker;
        arr[i * 3 + 2] = col.b * flicker;
      }
      ref.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[baseColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
