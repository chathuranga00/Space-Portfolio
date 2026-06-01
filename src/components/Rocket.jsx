import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ROCKET_HOME } from '../hooks/useRocketTravel';

const HOME_POSITION = ROCKET_HOME;
const TRAVEL_SPEED = 2.8;
const ARRIVAL_THRESHOLD = 0.65;
const BOB_SPEED = 1.1;
const BOB_AMPLITUDE = 0.22;
const BODY_SILVER = '#d4d8e0';
const FIN_SILVER = '#a8b0bc';

function createExhaustTexture() {
  const size = 64;
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
  gradient.addColorStop(0, 'rgba(255, 220, 120, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 100, 40, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 40, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createExhaustGeometry(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 0.2;
    positions[i3 + 1] = -Math.random() * 0.5;
    positions[i3 + 2] = (Math.random() - 0.5) * 0.2;

    const t = Math.random();
    colors[i3] = 1;
    colors[i3 + 1] = 0.35 + t * 0.4;
    colors[i3 + 2] = t * 0.15;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

const _direction = new THREE.Vector3();
const _cameraTarget = new THREE.Vector3();
const _cameraDesired = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export default function Rocket({
  traveling = false,
  targetPosition = null,
  onArrived,
  followCamera = true,
  lowDetail = false,
}) {
  const seg = lowDetail ? 8 : 16;
  const rocketRef = useRef(null);
  const exhaustRef = useRef(null);
  const exhaustMaterialRef = useRef(null);
  const homeRef = useRef(HOME_POSITION.clone());
  const arrivedRef = useRef(false);
  const bobPhase = useRef(Math.random() * Math.PI * 2);

  const { camera } = useThree();

  const exhaustTexture = useMemo(() => createExhaustTexture(), []);
  const exhaustGeometry = useMemo(() => createExhaustGeometry(120), []);

  useEffect(() => {
    return () => {
      exhaustTexture.dispose();
      exhaustGeometry.dispose();
    };
  }, [exhaustTexture, exhaustGeometry]);

  useEffect(() => {
    if (traveling) {
      arrivedRef.current = false;
    }
  }, [traveling, targetPosition]);

  useFrame((state, delta) => {
    if (!rocketRef.current) return;

    const rocket = rocketRef.current;
    const t = state.clock.elapsedTime;

    if (traveling && targetPosition) {
      _direction.copy(targetPosition).sub(rocket.position);
      const distance = _direction.length();

      if (distance > ARRIVAL_THRESHOLD) {
        _direction.normalize();
        rocket.position.addScaledVector(_direction, TRAVEL_SPEED * delta);
        rocket.quaternion.setFromUnitVectors(_up, _direction);
      } else if (!arrivedRef.current) {
        arrivedRef.current = true;
        homeRef.current.copy(rocket.position);
        onArrived?.();
      }

      if (followCamera) {
        _cameraTarget.copy(rocket.position);
        _cameraDesired
          .copy(rocket.position)
          .addScaledVector(_direction, -6)
          .add(new THREE.Vector3(0, 3.5, 0));
        camera.position.lerp(_cameraDesired, 0.06);
        camera.lookAt(_cameraTarget);
      }
    } else {
      const bob =
        Math.sin(t * BOB_SPEED + bobPhase.current) * BOB_AMPLITUDE;
      rocket.position.copy(homeRef.current);
      rocket.position.y = homeRef.current.y + bob;
      rocket.rotation.set(0.25, t * 0.15, 0.1);
    }

    if (exhaustRef.current) {
      exhaustRef.current.rotation.y += delta * (traveling ? 4 : 1.2);
    }

    if (exhaustMaterialRef.current) {
      exhaustMaterialRef.current.size = traveling ? 0.45 : 0.22;
      exhaustMaterialRef.current.opacity = traveling ? 0.95 : 0.55;
    }

    if (exhaustGeometry && traveling) {
      const positions = exhaustGeometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * (traveling ? 2.5 : 0.6);
        if (positions[i + 1] < -1.2) {
          positions[i + 1] = -Math.random() * 0.15;
          positions[i] = (Math.random() - 0.5) * 0.25;
          positions[i + 2] = (Math.random() - 0.5) * 0.25;
        }
      }
      exhaustGeometry.attributes.position.needsUpdate = true;
    }
  });

  const finAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group ref={rocketRef} position={HOME_POSITION.toArray()}>
      {/* Nose */}
      <mesh position={[0, 0.95, 0]}>
        <coneGeometry args={[0.28, 0.55, seg]} />
        <meshStandardMaterial color={BODY_SILVER} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.9, seg]} />
        <meshStandardMaterial color={BODY_SILVER} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Fins */}
      {finAngles.map((angle) => (
        <mesh
          key={angle}
          position={[
            Math.sin(angle) * 0.32,
            -0.05,
            Math.cos(angle) * 0.32,
          ]}
          rotation={[0, angle, Math.PI]}
        >
          <coneGeometry args={[0.1, 0.28, 4]} />
          <meshStandardMaterial color={FIN_SILVER} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {/* Engine glow */}
      <pointLight
        color="#ff5500"
        intensity={traveling ? 14 : 4}
        distance={5}
        position={[0, -0.45, 0]}
      />

      {/* Exhaust particles */}
      <points ref={exhaustRef} position={[0, -0.55, 0]} geometry={exhaustGeometry}>
        <pointsMaterial
          ref={exhaustMaterialRef}
          map={exhaustTexture}
          vertexColors
          transparent
          size={0.22}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.55}
        />
      </points>
    </group>
  );
}
