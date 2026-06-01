import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 200;
const CLUSTER_RADIUS = 40;
const SPRITE_SIZE = 32;

const CLUSTERS = [
  {
    id: 'blue-purple',
    position: [-130, 15, -140],
    palette: [
      [0.25, 0.35, 0.95],
      [0.45, 0.28, 0.88],
      [0.32, 0.22, 0.78],
      [0.55, 0.4, 1.0],
    ],
    opacity: 0.1,
    drift: { x: 0.12, y: 0.08, z: 0.05 },
    rotation: { x: 0.004, y: 0.008, z: 0.002 },
  },
  {
    id: 'pink-magenta',
    position: [130, 10, -150],
    palette: [
      [1.0, 0.25, 0.55],
      [0.85, 0.15, 0.75],
      [1.0, 0.45, 0.7],
      [0.95, 0.2, 0.9],
    ],
    opacity: 0.12,
    drift: { x: 0.1, y: 0.1, z: 0.06 },
    rotation: { x: 0.003, y: -0.007, z: 0.003 },
  },
  {
    id: 'teal-cyan',
    position: [0, 115, -160],
    palette: [
      [0.1, 0.75, 0.85],
      [0.15, 0.9, 0.8],
      [0.2, 0.65, 0.95],
      [0.25, 0.85, 0.75],
    ],
    opacity: 0.14,
    drift: { x: 0.08, y: 0.11, z: 0.04 },
    rotation: { x: 0.005, y: 0.005, z: -0.002 },
  },
];

let sharedSpriteTexture = null;

function getSpriteTexture() {
  if (sharedSpriteTexture) return sharedSpriteTexture;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.12)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  sharedSpriteTexture = new THREE.CanvasTexture(canvas);
  sharedSpriteTexture.colorSpace = THREE.SRGBColorSpace;
  return sharedSpriteTexture;
}

function randomInSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

function createClusterGeometry(palette) {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const { x, y, z } = randomInSphere(CLUSTER_RADIUS);
    const i3 = i * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const [r, g, b] = palette[Math.floor(Math.random() * palette.length)];
    const fade = 0.55 + Math.random() * 0.45;
    colors[i3] = r * fade;
    colors[i3 + 1] = g * fade;
    colors[i3 + 2] = b * fade;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function NebulaCluster({ config, texture }) {
  const groupRef = useRef(null);
  const basePosition = useMemo(
    () => new THREE.Vector3(...config.position),
    [config.position],
  );

  const geometry = useMemo(
    () => createClusterGeometry(config.palette),
    [config.palette],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    groupRef.current.rotation.x += delta * config.rotation.x;
    groupRef.current.rotation.y += delta * config.rotation.y;
    groupRef.current.rotation.z += delta * config.rotation.z;

    groupRef.current.position.set(
      basePosition.x + Math.sin(t * config.drift.x) * 6,
      basePosition.y + Math.sin(t * config.drift.y + 1.2) * 5,
      basePosition.z + Math.cos(t * config.drift.z + 0.5) * 4,
    );
  });

  return (
    <group ref={groupRef} position={config.position}>
      <points geometry={geometry} frustumCulled={false}>
        <pointsMaterial
          map={texture}
          size={SPRITE_SIZE}
          vertexColors
          transparent
          opacity={config.opacity}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

export default function Nebula() {
  const texture = useMemo(() => getSpriteTexture(), []);

  useEffect(() => {
    return () => {
      if (sharedSpriteTexture) {
        sharedSpriteTexture.dispose();
        sharedSpriteTexture = null;
      }
    };
  }, []);

  return (
    <group renderOrder={-10}>
      {CLUSTERS.map((cluster) => (
        <NebulaCluster key={cluster.id} config={cluster} texture={texture} />
      ))}
    </group>
  );
}
