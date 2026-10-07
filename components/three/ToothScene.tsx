'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * DENTRA hero object — a futuristic molar.
 *
 * The crown is a lathe of the tooth's anatomical profile; the roots are
 * tapered capsules. Everything is low-poly and static geometry: it is built
 * once in `useMemo` and only the group's rotation updates per frame, so the
 * scene costs almost nothing after the first paint.
 */

const CYAN = '#15BCDF';

/* ============================================================
   GEOMETRY
   ============================================================ */

/**
 * Crown silhouette, revolved around Y. Points run from the occlusal table
 * down to the cervical margin, giving the characteristic bulge and taper.
 */
function useCrownGeometry() {
  return useMemo(() => {
    const profile: THREE.Vector2[] = [
      new THREE.Vector2(0.0, 1.02),
      new THREE.Vector2(0.34, 1.0),
      new THREE.Vector2(0.58, 0.93),
      new THREE.Vector2(0.72, 0.8),
      new THREE.Vector2(0.8, 0.6),
      new THREE.Vector2(0.82, 0.35),
      new THREE.Vector2(0.79, 0.1),
      new THREE.Vector2(0.72, -0.1),
      new THREE.Vector2(0.62, -0.26),
      new THREE.Vector2(0.54, -0.36),
    ];
    const geometry = new THREE.LatheGeometry(profile, 48);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
}

/** A single tapered root, splayed outward from the crown base. */
function Root({
  position,
  rotation,
  length,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[0.055, 0.2, length, 20, 1, false]} />
      <meshPhysicalMaterial
        color="#F4F6F7"
        transparent
        opacity={0.62}
        roughness={0.18}
        metalness={0.35}
        transmission={0.5}
        thickness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.1}
        ior={1.4}
      />
    </mesh>
  );
}

/** Occlusal cusps — four rounded peaks on the biting surface. */
function Cusps() {
  const positions = useMemo<[number, number, number][]>(
    () => [
      [0.34, 1.0, 0.34],
      [-0.34, 1.0, 0.34],
      [0.34, 1.0, -0.34],
      [-0.34, 1.0, -0.34],
    ],
    [],
  );

  return (
    <>
      {positions.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.24, 20, 16]} />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent
            opacity={0.55}
            roughness={0.12}
            metalness={0.4}
            transmission={0.6}
            thickness={0.8}
            clearcoat={1}
            ior={1.45}
          />
        </mesh>
      ))}
    </>
  );
}

/** Thin cyan rings that read as scanning/measurement bands. */
function ScanRings() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    // Slow counter-rotation keeps the rings visually distinct from the tooth.
    ref.current.rotation.y = -state.clock.elapsedTime * 0.12;
  });

  return (
    <group ref={ref}>
      {[0.55, 0.05, -0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05 + i * 0.06, 0.006, 8, 96]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.4 - i * 0.08} />
        </mesh>
      ))}
    </group>
  );
}

/** Technical data points orbiting the object. */
function DataPoints({ count = 14 }: { count?: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 1.25 + (i % 3) * 0.18;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = -0.6 + (i % 5) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color={CYAN} size={0.045} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
}

/** Ambient particulate — sparse, slow, never confetti-like. */
function Particles({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    // Deterministic placement so the field looks identical on every load.
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 7;
      positions[i * 3 + 1] = (rand() - 0.5) * 5;
      positions[i * 3 + 2] = (rand() - 0.5) * 5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#2B3033"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.28}
      />
    </points>
  );
}

/* ============================================================
   TOOTH
   ============================================================ */

function Tooth({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const crown = useCrownGeometry();

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    // Spec rotation: ~0.2 rad/s.
    group.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      <group scale={1.15}>
        {/* Crown */}
        <mesh geometry={crown} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#FAFBFC"
            transparent
            opacity={0.66}
            roughness={0.14}
            metalness={0.42}
            transmission={0.55}
            thickness={1.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            ior={1.45}
            envMapIntensity={1.1}
          />
        </mesh>

        <Cusps />

        {/* Three roots: two buccal, one palatal. */}
        <Root position={[0.3, -0.85, 0.16]} rotation={[0.1, 0, 0.22]} length={1.05} />
        <Root position={[-0.3, -0.85, 0.16]} rotation={[0.1, 0, -0.22]} length={1.05} />
        <Root position={[0, -0.9, -0.3]} rotation={[-0.2, 0, 0]} length={1.15} />

        {/* Inner cyan core — reads as the digital twin inside the enamel. */}
        <mesh position={[0, 0.35, 0]}>
          <icosahedronGeometry args={[0.42, 1]} />
          <meshBasicMaterial color={CYAN} transparent opacity={0.16} wireframe />
        </mesh>
      </group>

      <ScanRings />
      <DataPoints />
    </group>
  );
}

/* ============================================================
   SCENE
   ============================================================ */

export default function ToothScene({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.3, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
      // Pointer events stay with the page; the object is decorative.
      className="pointer-events-none"
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.5} />
      <directionalLight position={[-5, 2, -3]} intensity={0.6} color={CYAN} />
      <pointLight position={[0, -2, 3]} intensity={0.5} color={CYAN} />

      {reducedMotion ? (
        <Tooth reducedMotion />
      ) : (
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35}>
          <Tooth reducedMotion={false} />
        </Float>
      )}

      <Particles />

      {/*
        Reflections come from lightformers rendered into an offscreen target
        rather than a `preset`, which would fetch an HDR from a CDN. Keeping
        the environment local means the scene works offline and adds no
        blocking network request to the hero.
      */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.4}
          position={[0, 3, 2]}
          scale={[6, 3, 1]}
          color="#FFFFFF"
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 1, 1]}
          scale={[3, 4, 1]}
          rotation={[0, Math.PI / 3, 0]}
          color={CYAN}
        />
        <Lightformer
          form="circle"
          intensity={1.6}
          position={[3, -1, 2]}
          scale={[2.5, 2.5, 1]}
          color="#FFFFFF"
        />
      </Environment>
    </Canvas>
  );
}
