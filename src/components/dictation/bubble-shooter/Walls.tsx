'use client'

import { useRef } from 'react'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

interface WallsProps {
  width?: number
  height?: number
  thickness?: number
}

// Define the walls of the game area
export function Walls({ 
  width = 7, 
  height = 10, 
  thickness = 0.5 
}: WallsProps) {
  // Refs to track wall positions
  const leftWallRef = useRef<THREE.Mesh>(null)
  const rightWallRef = useRef<THREE.Mesh>(null)
  const topWallRef = useRef<THREE.Mesh>(null)
  const bottomWallRef = useRef<THREE.Mesh>(null)

  // Left wall
  const [leftWallPhysicsRef] = useBox(() => ({
    args: [thickness, height, 1],
    position: [-width/2 - thickness/2, 0, 0],
    type: 'Static',
    collisionFilterGroup: 4, // Wall collision group
    collisionFilterMask: 2,  // Can collide with shot bubbles (group 2)
  }))

  // Right wall
  const [rightWallPhysicsRef] = useBox(() => ({
    args: [thickness, height, 1],
    position: [width/2 + thickness/2, 0, 0],
    type: 'Static',
    collisionFilterGroup: 4,
    collisionFilterMask: 2,
  }))

  // Top wall
  const [topWallPhysicsRef] = useBox(() => ({
    args: [width + thickness*2, thickness, 1],
    position: [0, height/2 + thickness/2, 0],
    type: 'Static',
    collisionFilterGroup: 4,
    collisionFilterMask: 2,
  }))

  // Bottom wall
  const [bottomWallPhysicsRef] = useBox(() => ({
    args: [width + thickness*2, thickness, 1],
    position: [0, -height/2 - thickness/2, 0],
    type: 'Static',
    collisionFilterGroup: 4,
    collisionFilterMask: 2,
  }))

  return (
    <group>
      {/* Left wall */}
      <mesh 
        ref={leftWallRef}
        position={[-width/2 - thickness/2, 0, 0]}
        onPointerDown={() => console.log('Left wall position:', leftWallRef.current?.position)}
      >
        <boxGeometry args={[thickness, height, 1]} />
        <meshStandardMaterial color="#ff6b6b" transparent opacity={0.3} />
      </mesh>

      {/* Right wall */}
      <mesh 
        ref={rightWallRef}
        position={[width/2 + thickness/2, 0, 0]}
        onPointerDown={() => console.log('Right wall position:', rightWallRef.current?.position)}
      >
        <boxGeometry args={[thickness, height, 1]} />
        <meshStandardMaterial color="#4ecdc4" transparent opacity={0.3} />
      </mesh>

      {/* Top wall */}
      <mesh 
        ref={topWallRef}
        position={[0, height/2 + thickness/2, 0]}
        onPointerDown={() => console.log('Top wall position:', topWallRef.current?.position)}
      >
        <boxGeometry args={[width + thickness*2, thickness, 1]} />
        <meshStandardMaterial color="#ffbe0b" transparent opacity={0.3} />
      </mesh>

      {/* Bottom wall */}
      <mesh 
        ref={bottomWallRef}
        position={[0, -height/2 - thickness/2, 0]}
        onPointerDown={() => console.log('Bottom wall position:', bottomWallRef.current?.position)}
      >
        <boxGeometry args={[width + thickness*2, thickness, 1]} />
        <meshStandardMaterial color="#8338ec" transparent opacity={0.3} />
      </mesh>
    </group>
  )
} 