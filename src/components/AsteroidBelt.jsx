import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useInteractiveCursor } from '../hooks/useInteractiveCursor';

const ASTEROID_COUNT = 60;
const RING_MIN = 17;
const RING_MAX = 19;
const ORBIT_SPEED = 0.06;
const CYAN = '#00e5ff';

const SPECIAL_LABELS = [
  'CS Student',
  'Web Developer',
  'AI Enthusiast',
  'UI/UX Designer',
  'Problem Solver',
];

const ROCK_COLORS = ['#6b5d52', '#8b7d6b', '#5c4f44', '#7a6a58', '#4a4038', '#9a8878'];

function randomRockColor() {
  return ROCK_COLORS[Math.floor(Math.random() * ROCK_COLORS.length)];
}

function buildAsteroid(angle, radius, y, isSpecial, label, id) {
  const baseScale = isSpecial
    ? 0.38 + Math.random() * 0.12
    : 0.12 + Math.random() * 0.14;

  return {
    id,
    position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
    scale: [
      baseScale * (0.85 + Math.random() * 0.3),
      baseScale * (0.85 + Math.random() * 0.3),
      baseScale * (0.85 + Math.random() * 0.3),
    ],
    color: randomRockColor(),
    rotSpeed: [
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
    ],
    label,
  };
}

function generateAsteroids(totalCount = ASTEROID_COUNT) {
  const asteroids = [];
  let id = 0;

  SPECIAL_LABELS.forEach((label, i) => {
    const angle =
      (i / SPECIAL_LABELS.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const radius = RING_MIN + Math.random() * (RING_MAX - RING_MIN);
    const y = (Math.random() - 0.5) * 1.2;
    asteroids.push(buildAsteroid(angle, radius, y, true, label, id++));
  });

  while (asteroids.length < totalCount) {
    const angle = Math.random() * Math.PI * 2;
    const radius = RING_MIN + Math.random() * (RING_MAX - RING_MIN);
    const y = (Math.random() - 0.5) * 1.2;
    asteroids.push(buildAsteroid(angle, radius, y, false, null, id++));
  }

  return asteroids;
}

const pillBaseStyle = {
  display: 'inline-block',
  background: 'rgba(0, 18, 28, 0.82)',
  border: `1px solid ${CYAN}`,
  borderRadius: '999px',
  padding: '5px 14px',
  color: CYAN,
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  boxShadow: `0 0 14px rgba(0, 229, 255, 0.55), 0 0 28px rgba(0, 229, 255, 0.2)`,
  userSelect: 'none',
  transition: 'transform 0.2s ease',
  transformOrigin: 'center center',
};

function LabeledAsteroid({ data }) {
  const meshRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const setCursor = useInteractiveCursor();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * data.rotSpeed[0];
    meshRef.current.rotation.y += delta * data.rotSpeed[1];
    meshRef.current.rotation.z += delta * data.rotSpeed[2];
  });

  const maxScale = Math.max(...data.scale);

  return (
    <group position={data.position}>
      <mesh
        ref={meshRef}
        scale={data.scale}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          setCursor(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          setCursor(false);
        }}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={data.color} roughness={0.95} metalness={0.05} />
      </mesh>

      <Html
        position={[0, maxScale + 0.35, 0]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            ...pillBaseStyle,
            transform: hovered ? 'scale(1.14)' : 'scale(1)',
          }}
        >
          {data.label}
        </div>
      </Html>
    </group>
  );
}

function Asteroid({ data }) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * data.rotSpeed[0];
    meshRef.current.rotation.y += delta * data.rotSpeed[1];
    meshRef.current.rotation.z += delta * data.rotSpeed[2];
  });

  return (
    <mesh ref={meshRef} position={data.position} scale={data.scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={data.color} roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

export default function AsteroidBelt({ isMobile = false }) {
  const beltRef = useRef(null);
  const count = isMobile ? 30 : ASTEROID_COUNT;
  const asteroids = useMemo(() => generateAsteroids(count), [count]);

  useFrame((_, delta) => {
    if (beltRef.current) {
      beltRef.current.rotation.y += delta * ORBIT_SPEED;
    }
  });

  return (
    <group ref={beltRef}>
      {asteroids.map((data) =>
        data.label ? (
          <LabeledAsteroid key={data.id} data={data} />
        ) : (
          <Asteroid key={data.id} data={data} />
        ),
      )}
    </group>
  );
}
