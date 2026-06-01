import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Outlines } from '@react-three/drei';
import { useInteractiveCursor } from '../hooks/useInteractiveCursor';

const POSITION = [20, 5, 0];
const CYAN = '#00e5ff';
const SILVER = '#a8adb8';
const PANEL = '#7a8494';
const ROTATION_SPEED = 0.18;
const BOB_SPEED = 0.75;
const BOB_AMPLITUDE = 0.35;
const RING_SPIN_SPEED = 0.9;

function Metallic({
  color = SILVER,
  emissive,
  emissiveIntensity = 0,
  metalness = 0.88,
  roughness = 0.32,
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

function HoverOutline({ visible }) {
  if (!visible) return null;
  return <Outlines thickness={2.5} color={CYAN} screenspace={false} opacity={0.95} />;
}

export default function SpaceStation({ onSelect, lowDetail = false }) {
  const cylSeg = lowDetail ? 8 : 24;
  const sphereSeg = lowDetail ? 8 : 20;
  const torusSeg = lowDetail ? 8 : 16;
  const torusRadial = lowDetail ? 16 : 64;
  const rootRef = useRef(null);
  const bobRef = useRef(null);
  const ringRef = useRef(null);

  const [hovered, setHovered] = useState(false);
  const setCursor = useInteractiveCursor();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (rootRef.current) {
      rootRef.current.rotation.y += delta * ROTATION_SPEED;
    }

    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * BOB_SPEED) * BOB_AMPLITUDE;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * RING_SPIN_SPEED;
    }
  });

  const setPointer = (active) => {
    setCursor(active);
    setHovered(active);
  };

  const interact = {
    onPointerOver: (e) => {
      e.stopPropagation();
      setPointer(true);
    },
    onPointerOut: (e) => {
      e.stopPropagation();
      setPointer(false);
    },
    onClick: (e) => {
      e.stopPropagation();
      onSelect?.();
    },
  };

  return (
    <group ref={rootRef} position={POSITION}>
      <pointLight
        color={CYAN}
        intensity={25}
        distance={14}
        decay={2}
        position={[1.5, 0.5, 1.5]}
      />

      <group ref={bobRef}>
        <mesh visible={false} {...interact}>
          <boxGeometry args={[6, 3.5, 3.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Central body */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.75, 0.75, 3.2, cylSeg]} />
          <Metallic />
          <HoverOutline visible={hovered} />
        </mesh>

        {/* Solar panels */}
        <mesh position={[-2.6, 0, 0]}>
          <boxGeometry args={[0.1, 2.2, 2.8]} />
          <Metallic color={PANEL} />
          <HoverOutline visible={hovered} />
        </mesh>
        <mesh position={[2.6, 0, 0]}>
          <boxGeometry args={[0.1, 2.2, 2.8]} />
          <Metallic color={PANEL} />
          <HoverOutline visible={hovered} />
        </mesh>

        {/* Panel accent strips */}
        {[-2.6, 2.6].map((x) => (
          <mesh key={x} position={[x, 0, 1.35]}>
            <boxGeometry args={[0.12, 0.08, 0.5]} />
            <Metallic color={CYAN} emissive={CYAN} emissiveIntensity={1.8} />
          </mesh>
        ))}

        {/* Communication dome */}
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.42, sphereSeg, sphereSeg]} />
          <Metallic color="#c5cad4" roughness={0.25} />
          <HoverOutline visible={hovered} />
        </mesh>

        {/* Rotating ring */}
        <group ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.35, 0.09, torusSeg, torusRadial]} />
            <Metallic color="#9098a8" />
            <HoverOutline visible={hovered} />
          </mesh>
        </group>

        {/* Cyan accent lights along body */}
        <pointLight color={CYAN} intensity={4} distance={3} position={[0, 0, 1.2]} />
        <pointLight color={CYAN} intensity={4} distance={3} position={[0, 0, -1.2]} />
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[1.2, 0.06, 0.06]} />
          <Metallic color={CYAN} emissive={CYAN} emissiveIntensity={2.2} />
        </mesh>

        {hovered && (
          <Html
            position={[0, 2.4, 0]}
            center
            distanceFactor={14}
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                color: CYAN,
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
                textShadow: `0 0 10px ${CYAN}, 0 0 20px rgba(0,0,0,0.85)`,
                userSelect: 'none',
              }}
            >
              Contact
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}
