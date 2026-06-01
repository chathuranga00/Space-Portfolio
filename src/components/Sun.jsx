import { useRef, useState } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { Sphere, shaderMaterial } from '@react-three/drei';
import { useInteractiveCursor } from '../hooks/useInteractiveCursor';

const SunShaderMaterial = shaderMaterial(
  { uTime: 0 },
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float wave = sin(vPosition.x * 4.0 + uTime * 0.9)
        * sin(vPosition.y * 4.0 + uTime * 0.7)
        * sin(vPosition.z * 4.0 + uTime * 0.5);
      float blend = wave * 0.5 + 0.5;

      vec3 red = vec3(1.0, 0.15, 0.05);
      vec3 orange = vec3(1.0, 0.4, 0.0);
      vec3 yellow = vec3(1.0, 0.9, 0.25);

      vec3 surface = mix(mix(red, orange, blend), yellow, blend * blend);
      float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.5);
      vec3 color = surface + yellow * rim * 0.35;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
);

extend({ SunShaderMaterial });

const RADIUS = 2.5;
const HOVER_SCALE = 1.06;
const PULSE_AMPLITUDE = 0.05;
const PULSE_SPEED = 0.9;
const ROTATION_SPEED = 0.25;

export default function Sun({ onSelect, lowDetail = false }) {
  const sphereDetail = lowDetail ? 8 : 64;
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const setCursor = useInteractiveCursor();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.uTime = t;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * ROTATION_SPEED;
      const pulse = 1 + Math.sin(t * PULSE_SPEED) * PULSE_AMPLITUDE;
      const hover = hovered ? HOVER_SCALE : 1;
      groupRef.current.scale.setScalar(pulse * hover);
    }
  });

  const setPointer = (active) => {
    setCursor(active);
    setHovered(active);
  };

  return (
    <group ref={groupRef}>
      <pointLight
        color="#FF6600"
        intensity={120}
        distance={40}
        decay={2}
      />
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
        <sunShaderMaterial ref={materialRef} attach="material" />
      </Sphere>
    </group>
  );
}
