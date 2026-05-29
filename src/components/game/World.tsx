import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Stylized Tree component
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.4, 3.6, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>
      {/* Foliage (stacked spheres for stylized Zelda look) */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <sphereGeometry args={[1.1, 8, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#4caf50" roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

// Stylized Medical Hut
function Hut({ position, label }: { position: [number, number, number]; label?: string }) {
  return (
    <group position={position}>
      {/* Pillars */}
      <mesh position={[-2, 1.1, -1.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh position={[2, 1.1, -1.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh position={[-2, 1.1, 1.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      <mesh position={[2, 1.1, 1.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2.2, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>

      {/* Thatched Roof (Cone) */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[3.2, 1.6, 6]} />
        <meshStandardMaterial color="#d7ccc8" roughness={0.95} flatShading />
      </mesh>

      {/* Low cot bed under the hut */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.15, 1.2]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        {/* Legs */}
        <mesh position={[-1.1, 0.2, -0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
        <mesh position={[1.1, 0.2, -0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
        <mesh position={[-1.1, 0.2, 0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
        <mesh position={[1.1, 0.2, 0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#3e2723" />
        </mesh>
      </group>

      {/* Small floating sign/cloth indicator */}
      {label && (
        <group position={[0, 2.1, 1.51]}>
          <mesh>
            <boxGeometry args={[1.2, 0.3, 0.05]} />
            <meshStandardMaterial color="#faf5ff" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Flickering Fire Bowl
function FireBowl({ position }: { position: [number, number, number] }) {
  const fireRef = useRef<THREE.Mesh | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    // Flicker scale
    if (fireRef.current) {
      const s = 1 + Math.sin(elapsed * 15) * 0.12;
      fireRef.current.scale.set(s, s + Math.cos(elapsed * 10) * 0.1, s);
    }
    // Flicker light intensity
    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + Math.sin(elapsed * 25) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Stand */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.6, 8]} />
        <meshStandardMaterial color="#37474f" roughness={0.8} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.4, 0.2, 0.2, 8]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      {/* Fire flame mesh */}
      <mesh ref={fireRef} position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.22, 6, 6]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
      {/* Glowing point light */}
      <pointLight
        ref={lightRef}
        position={[0, 1.2, 0]}
        color="#f97316"
        intensity={2.0}
        distance={8}
        decay={1.8}
        castShadow
      />
    </group>
  );
}

export default function World() {
  return (
    <group>
      {/* soft environmental lights */}
      <ambientLight intensity={0.8} color="#e0f2fe" />
      <directionalLight
        position={[15, 20, 12]}
        intensity={1.2}
        color="#fffbeb"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Jungle Grass Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#43a047" roughness={0.9} />
      </mesh>

      {/* Flowing river nearby (scrolling blue strip at x = -14) */}
      <mesh position={[-16, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 100]} />
        <meshStandardMaterial color="#0284c7" opacity={0.8} transparent roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Leech Pond (circular pit embed) */}
      <group position={[6, 0.02, 5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 0.05, 16]} />
          <meshStandardMaterial color="#075985" roughness={0.4} />
        </mesh>
        {/* Stone ring edge */}
        <mesh>
          <torusGeometry args={[2.5, 0.15, 8, 24]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
      </group>

      {/* Huts and treatment cots */}
      <Hut position={[0, 0, -4]} label="Stage 1" />
      <Hut position={[6, 0, -8]} label="Stage 2" />

      {/* Stage 3 Cots Grid (Survival ward layout) */}
      <Hut position={[-6, 0, 6]} label="Mat A" />
      <Hut position={[-2, 0, 8]} label="Mat B" />
      <Hut position={[2, 0, 8]} label="Mat C" />
      <Hut position={[-6, 0, 0]} label="Mat D" />
      <Hut position={[6, 0, 0]} label="Mat E" />

      {/* Environment layout: Fire Bowls */}
      <FireBowl position={[-3, 0, -3]} />
      <FireBowl position={[3, 0, -3]} />
      <FireBowl position={[-8, 0, 5]} />
      <FireBowl position={[8, 0, 5]} />

      {/* Dense background stylized trees */}
      <Tree position={[-10, 0, -8]} />
      <Tree position={[-12, 0, -4]} />
      <Tree position={[-8, 0, -12]} />
      <Tree position={[10, 0, -12]} />
      <Tree position={[12, 0, -8]} />
      <Tree position={[8, 0, -15]} />
      <Tree position={[14, 0, -2]} />
      <Tree position={[-12, 0, 12]} />
      <Tree position={[12, 0, 10]} />
      <Tree position={[10, 0, 15]} />
    </group>
  );
}
