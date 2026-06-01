import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useInteractiveCursor } from '../hooks/useInteractiveCursor';

const ORBIT_BASE_SPEED = 0.35;
const SELF_ROTATION_SPEED = 0.4;
const PAUSE_DURATION = 2.5;
const HOVER_SCALE = 1.12;
const BASE_LIGHT_INTENSITY = 0.85;
const HOVER_LIGHT_INTENSITY = 2.5;

export default function Planet({
  orbitRadius,
  speed = 1,
  size,
  color,
  name,
  onSelect,
  startAngle = 0,
  lowDetail = false,
  sizeMultiplier = 1,
}) {
  const planetSize = size * sizeMultiplier;
  const sphereDetail = lowDetail ? 8 : 32;
  const torusSegments = lowDetail ? 8 : 16;
  const torusRadial = lowDetail ? 32 : 128;
  const orbitGroupRef = useRef(null);
  const planetRef = useRef(null);
  const lightRef = useRef(null);
  const angleRef = useRef(startAngle);
  const pausedUntilRef = useRef(0);
  const elapsedRef = useRef(0);

  const [hovered, setHovered] = useState(false);
  const setCursor = useInteractiveCursor();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    elapsedRef.current = t;
    const paused = t < pausedUntilRef.current;

    if (!paused) {
      angleRef.current = startAngle + t * speed * ORBIT_BASE_SPEED;
    }

    const angle = angleRef.current;
    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.set(
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius,
      );
    }

    if (planetRef.current) {
      planetRef.current.rotation.y += delta * SELF_ROTATION_SPEED;
      const hoverScale = hovered ? HOVER_SCALE : 1;
      planetRef.current.scale.setScalar(hoverScale);
    }

    if (lightRef.current) {
      lightRef.current.intensity = hovered
        ? HOVER_LIGHT_INTENSITY
        : BASE_LIGHT_INTENSITY;
    }
  });

  const setPointer = (active) => {
    setCursor(active);
    setHovered(active);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    pausedUntilRef.current = elapsedRef.current + PAUSE_DURATION;
    if (orbitGroupRef.current) {
      const worldPosition = orbitGroupRef.current.getWorldPosition(
        new THREE.Vector3(),
      );
      onSelect?.(worldPosition);
    } else {
      onSelect?.();
    }
  };

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.03, torusSegments, torusRadial]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      <group ref={orbitGroupRef}>
        <pointLight
          ref={lightRef}
          color={color}
          intensity={BASE_LIGHT_INTENSITY}
          distance={planetSize * 8}
          decay={2}
        />

        <group ref={planetRef}>
          <mesh scale={planetSize * 1.4}>
            <sphereGeometry args={[1, sphereDetail, sphereDetail]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.05}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>

          <Sphere
            args={[planetSize, sphereDetail, sphereDetail]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setPointer(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setPointer(false);
            }}
            onClick={handleClick}
          >
            <meshStandardMaterial color={color} roughness={0.65} metalness={0.15} />
          </Sphere>

          <Html
            position={[0, planetSize + 0.55, 0]}
            center
            distanceFactor={12}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.6)',
                userSelect: 'none',
              }}
            >
              {name}
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}
