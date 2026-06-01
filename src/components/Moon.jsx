import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useInteractiveCursor } from '../hooks/useInteractiveCursor';

const RADIUS = 0.8;
const ORBIT_RADIUS = 4;
const COLOR = '#C0C0C0';
const ORBIT_TILT = (15 * Math.PI) / 180;
const ORBIT_SPEED = 0.65;
const SELF_ROTATION_SPEED = 0.5;
const HOVER_SCALE = 1.1;

function createCraterTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c8c8c8';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 48; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const craterR = 6 + Math.random() * 28;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, craterR);
    gradient.addColorStop(0, '#5a5a5a');
    gradient.addColorStop(0.45, '#8a8a8a');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, craterR, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 24; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 2 + Math.random() * 8;
    ctx.fillStyle = 'rgba(90, 90, 90, 0.35)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function Moon({ onSelect, lowDetail = false }) {
  const sphereDetail = lowDetail ? 8 : 48;
  const orbitGroupRef = useRef(null);
  const moonRef = useRef(null);

  const [hovered, setHovered] = useState(false);
  const setCursor = useInteractiveCursor();

  const craterMap = useMemo(() => createCraterTexture(), []);

  useEffect(() => {
    return () => craterMap.dispose();
  }, [craterMap]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const angle = t * ORBIT_SPEED;

    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.set(
        Math.cos(angle) * ORBIT_RADIUS,
        0,
        Math.sin(angle) * ORBIT_RADIUS,
      );
    }

    if (moonRef.current) {
      moonRef.current.rotation.y += delta * SELF_ROTATION_SPEED;
      moonRef.current.scale.setScalar(hovered ? HOVER_SCALE : 1);
    }
  });

  const setPointer = (active) => {
    setCursor(active);
    setHovered(active);
  };

  return (
    <group rotation={[ORBIT_TILT, 0, 0]}>
      <group ref={orbitGroupRef}>
        <group ref={moonRef}>
          <Sphere
            args={[RADIUS, sphereDetail, sphereDetail]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setPointer(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setPointer(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            <meshStandardMaterial
              color={COLOR}
              map={craterMap}
              roughness={0.9}
              metalness={0.05}
            />
          </Sphere>

          {hovered && (
            <Html
              position={[0, RADIUS + 0.6, 0]}
              center
              distanceFactor={12}
              style={{ pointerEvents: 'none' }}
            >
              <div
                style={{
                  color: '#e8e8e8',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                  textShadow:
                    '0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.6)',
                  userSelect: 'none',
                }}
              >
                Skills
              </div>
            </Html>
          )}
        </group>
      </group>
    </group>
  );
}
