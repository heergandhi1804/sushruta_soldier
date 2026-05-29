import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Player() {
  const { playerPosition, setPlayerPosition, gameMode } = useGameStore();
  const playerRef = useRef<THREE.Group | null>(null);

  // Keyboard state
  const keys = useRef({ w: false, s: false, a: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const [isWalking, setIsWalking] = useState(false);

  useFrame((state) => {
    // Only move if active playing or active sandbox testing
    if (gameMode !== 'play-active') return;

    // Movement speeds
    const speed = 0.12;
    let dx = 0;
    let dz = 0;

    if (keys.current.w || keys.current.arrowup) dz -= 1;
    if (keys.current.s || keys.current.arrowdown) dz += 1;
    if (keys.current.a || keys.current.arrowleft) dx -= 1;
    if (keys.current.d || keys.current.arrowright) dx += 1;

    // Normalize diagonal
    if (dx !== 0 && dz !== 0) {
      dx *= 0.707;
      dz *= 0.707;
    }

    const nextX = playerPosition[0] + dx * speed;
    const nextZ = playerPosition[2] + dz * speed;

    // Boundary constraints: keep within jungle clearing and avoid river (x = -12)
    const clampedX = Math.min(12, Math.max(-11.5, nextX));
    const clampedZ = Math.min(14, Math.max(-14, nextZ));

    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      setPlayerPosition([clampedX, 0, clampedZ]);
      setIsWalking(true);

      // Rotate player to face the walk direction
      if (playerRef.current) {
        const targetAngle = Math.atan2(dx, dz);
        playerRef.current.rotation.y = targetAngle;
      }
    } else {
      setIsWalking(false);
    }

    // Healer avatar breathing vs walking wobble
    if (playerRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const bodyMesh = playerRef.current.children[0] as THREE.Mesh;
      if (bodyMesh) {
        if (moving) {
          // Walk bob
          bodyMesh.position.y = 0.75 + Math.sin(elapsed * 12) * 0.08;
        } else {
          // Idle breathing
          bodyMesh.position.y = 0.75;
          bodyMesh.scale.y = 1 + Math.sin(elapsed * 2) * 0.015;
        }
      }
    }

    // Third-person camera follow script
    // Lerp camera behind the healer smoothly
    const targetCamX = playerPosition[0];
    const targetCamY = playerPosition[1] + 5.0;
    const targetCamZ = playerPosition[2] + 6.5;

    state.camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);
    state.camera.lookAt(playerPosition[0], playerPosition[1] + 0.8, playerPosition[2]);
  });

  return (
    <group ref={playerRef} position={playerPosition}>
      {/* Stylized Human Healer mesh group */}
      <group position={[0, 0, 0]}>
        {/* Torso */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.8, 8]} />
          <meshStandardMaterial color="#faf5ff" roughness={0.8} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#c68a4c" roughness={0.6} />
        </mesh>

        {/* Lower dhoti wrap (orange) */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.35, 8]} />
          <meshStandardMaterial color="#ea580c" />
        </mesh>

        {/* Left Arm */}
        <mesh position={[-0.26, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
          <meshStandardMaterial color="#c68a4c" />
        </mesh>

        {/* Right Arm */}
        <mesh position={[0.26, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 8]} />
          <meshStandardMaterial color="#c68a4c" />
        </mesh>
      </group>
    </group>
  );
}
