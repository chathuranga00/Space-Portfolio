import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT_DESKTOP = 3_000;
const COUNT_MOBILE = 800;
const CLOUD_RADIUS = 38;

function createDustGeometry(count) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = CLOUD_RADIUS * Math.cbrt(Math.random());

    const i3 = i * 3;
    const sinPhi = Math.sin(phi);
    positions[i3] = r * sinPhi * Math.cos(theta);
    positions[i3 + 1] = r * sinPhi * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    seeds[i3] = Math.random() * 100;
    seeds[i3 + 1] = Math.random() * 100;
    seeds[i3 + 2] = Math.random() * 100;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 3));
  return geometry;
}

export default function SpaceDust({ isMobile = false }) {
  const pointsRef = useRef(null);
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;

  const geometry = useMemo(() => createDustGeometry(count), [count]);
  const basePositions = useMemo(
    () => new Float32Array(geometry.attributes.position.array),
    [geometry],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const positions = geometry.attributes.position.array;
    const seeds = geometry.attributes.seed.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const sx = seeds[i3];
      const sy = seeds[i3 + 1];
      const sz = seeds[i3 + 2];

      positions[i3] =
        basePositions[i3] +
        Math.sin(t * 0.15 + sx) * 0.35 +
        Math.sin(t * 0.08 + sy * 1.3) * 0.2;
      positions[i3 + 1] =
        basePositions[i3 + 1] +
        Math.cos(t * 0.12 + sy) * 0.3 +
        Math.sin(t * 0.1 + sz) * 0.15;
      positions[i3 + 2] =
        basePositions[i3 + 2] +
        Math.cos(t * 0.14 + sz * 0.9) * 0.35 +
        Math.cos(t * 0.07 + sx * 1.1) * 0.2;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.06}
        color="#c8cdd8"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
