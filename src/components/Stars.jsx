import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPHERE_RADIUS = 200;
const PRIMARY_COUNT_DESKTOP = 20_000;
const SECONDARY_COUNT_DESKTOP = 5_000;
const PRIMARY_COUNT_MOBILE = 8_000;
const SECONDARY_COUNT_MOBILE = 0;
const MAX_SHOOTING_STARS = 3;
const SPAWN_MIN = 3;
const SPAWN_MAX = 8;

function randomInSphere(radius, count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());

    const i3 = i * 3;
    const sinPhi = Math.sin(phi);
    positions[i3] = r * sinPhi * Math.cos(theta);
    positions[i3 + 1] = r * sinPhi * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);

    const tint = Math.random();
    colors[i3] = 0.75 + tint * 0.25;
    colors[i3 + 1] = 0.85 + tint * 0.15;
    colors[i3 + 2] = 1;
  }

  return { positions, colors };
}

function createStarGeometry(count, radius, brighten = false) {
  const { positions, colors } = randomInSphere(radius, count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  if (brighten) {
    const colorAttr = geometry.attributes.color;
    for (let i = 0; i < colorAttr.count; i++) {
      colorAttr.setXYZ(
        i,
        Math.min(1, colorAttr.getX(i) * 1.15 + 0.1),
        Math.min(1, colorAttr.getY(i) * 1.1 + 0.1),
        1,
      );
    }
    colorAttr.needsUpdate = true;
  }

  return geometry;
}

function createShootingStarState() {
  const dist = 90 + Math.random() * 80;
  const angleH = Math.random() * Math.PI * 2;
  const angleV = 0.15 + Math.random() * 0.55;

  const start = new THREE.Vector3(
    Math.cos(angleH) * Math.cos(angleV) * dist,
    15 + Math.random() * 40,
    Math.sin(angleH) * Math.cos(angleV) * dist,
  );

  const dir = new THREE.Vector3(
    (Math.random() - 0.5) * 1.4,
    -0.25 - Math.random() * 0.55,
    (Math.random() - 0.5) * 1.4,
  ).normalize();

  return {
    id: `${Date.now()}-${Math.random()}`,
    start,
    dir,
    speed: 28 + Math.random() * 42,
    length: 10 + Math.random() * 14,
    maxAge: 1.2 + Math.random() * 0.8,
    age: 0,
  };
}

function ShootingStar({ initial, onRemove }) {
  const star = useRef(initial).current;
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    return geo;
  }, []);

  const materialRef = useRef(null);
  const head = useMemo(() => new THREE.Vector3(), []);
  const tail = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    star.age += delta;
    const traveled = star.age * star.speed;

    head.copy(star.start).addScaledVector(star.dir, traveled);
    tail.copy(head).addScaledVector(star.dir, -star.length);

    const positions = geometry.attributes.position.array;
    positions[0] = tail.x;
    positions[1] = tail.y;
    positions[2] = tail.z;
    positions[3] = head.x;
    positions[4] = head.y;
    positions[5] = head.z;
    geometry.attributes.position.needsUpdate = true;

    const fade = 1 - star.age / star.maxAge;
    if (materialRef.current) {
      materialRef.current.opacity = Math.max(0, fade);
    }

    if (star.age >= star.maxAge) {
      onRemove(star.id);
    }
  });

  return (
    <line geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        ref={materialRef}
        color="#e8f4ff"
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </line>
  );
}

function ShootingStarField({ enabled }) {
  const [stars, setStars] = useState([]);
  const nextSpawnAt = useRef(0);

  useFrame((state) => {
    if (!enabled) return;
    const t = state.clock.elapsedTime;

    if (t >= nextSpawnAt.current && stars.length < MAX_SHOOTING_STARS) {
      setStars((prev) => [...prev, createShootingStarState()]);
      nextSpawnAt.current = t + SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    }
  });

  const handleRemove = (id) => {
    setStars((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      {stars.map((star) => (
        <ShootingStar key={star.id} initial={star} onRemove={handleRemove} />
      ))}
    </>
  );
}

export default function Stars({ isMobile = false }) {
  const groupRef = useRef(null);

  const primaryCount = isMobile ? PRIMARY_COUNT_MOBILE : PRIMARY_COUNT_DESKTOP;
  const secondaryCount = isMobile
    ? SECONDARY_COUNT_MOBILE
    : SECONDARY_COUNT_DESKTOP;

  const primaryGeometry = useMemo(
    () => createStarGeometry(primaryCount, SPHERE_RADIUS),
    [primaryCount],
  );
  const secondaryGeometry = useMemo(
    () =>
      secondaryCount > 0
        ? createStarGeometry(secondaryCount, SPHERE_RADIUS, true)
        : null,
    [secondaryCount],
  );

  useEffect(() => {
    return () => {
      primaryGeometry.dispose();
      secondaryGeometry?.dispose();
    };
  }, [primaryGeometry, secondaryGeometry]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={primaryGeometry}>
        <pointsMaterial
          size={0.35}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {secondaryGeometry && (
        <points geometry={secondaryGeometry}>
          <pointsMaterial
            size={0.9}
            vertexColors
            transparent
            opacity={1}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      {!isMobile && <ShootingStarField enabled />}
    </group>
  );
}
