'use client'

import { useRef, useEffect } from 'react'
import { useSphere } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { BubbleProps } from './types'
import * as THREE from 'three'

export function Bubble({
  word,
  position,
  color = 'blue',
  onCollide,
  isShooter = false
}: BubbleProps) {
  // Reference to track velocity changes
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
  
  // Handle collisions
  const handleCollision = (e: any) => {
    // Only handle collisions for target bubbles
    if (!isShooter && onCollide) {
      console.log('💥 Bubble collision:', { word, isShooter })
      onCollide(e)
    }
    
    // Handle wall collisions for target bubbles (red bubbles)
    if (!isShooter) {
      const collisionGroup = (e.body as any)?.collisionFilterGroup || 0
      
      // If collision is with a wall (group 4)
      if (collisionGroup === 4) {
        console.log('🧱 Target bubble hit wall:', { word })
        
        // Get current velocity for ricochet
        const getCurrentVelocity = (api.velocity as any).get;
        const getCurrentPosition = (api.position as any).get;
        
        if (typeof getCurrentVelocity === 'function' && typeof getCurrentPosition === 'function') {
          getCurrentVelocity((velocity: [number, number, number]) => {
            getCurrentPosition((position: [number, number, number]) => {
              const damping = 0.7 // Reduce velocity after bounce
              
              // Wall dimensions - match the ones in the game
              const wallWidth = 13.5
              const wallHeight = 12
              
              // Determine which wall was hit
              if (Math.abs(position[0]) > wallWidth/2) {
                // Side wall hit - invert x velocity
                api.velocity.set(-velocity[0] * damping, velocity[1] * damping, 0)
              } else if (Math.abs(position[1]) > wallHeight/2) {
                // Top/bottom wall hit - invert y velocity
                api.velocity.set(velocity[0] * damping, -velocity[1] * damping, 0)
              }
            });
          });
        }
      }
    }
  }

  // Create physics sphere with collision handling
  const [ref, api] = useSphere(() => ({
    mass: isShooter ? 0 : 1,
    position,
    args: [0.5],
    // Target bubbles are in group 1 and can collide with shot bubbles (group 2) and walls (group 4)
    // Shooter is in group 0 and doesn't collide with anything
    collisionFilterGroup: isShooter ? 0 : 1,
    collisionFilterMask: isShooter ? 0 : (2 | 4), // Target bubbles can collide with shot bubbles AND walls
    onCollide: handleCollision,
    // Add some damping to make movement more natural
    linearDamping: 0.5
  }))
  
  // Add a small random velocity to target bubbles to make them move around
  useEffect(() => {
    if (!isShooter) {
      // Add a small random velocity to make the bubbles move
      const randomVelocity = [
        (Math.random() - 0.5) * 2, // x velocity between -1 and 1
        (Math.random() - 0.5) * 2, // y velocity between -1 and 1
        0 // no z velocity
      ] as [number, number, number]
      
      // Set initial velocity
      api.velocity.set(...randomVelocity)
      
      // Store in ref for later use
      velocityRef.current.set(...randomVelocity)
    }
  }, [isShooter, api.velocity])
  
  // Ensure bubbles stay on z=0 plane
  useEffect(() => {
    if (!isShooter) {
      // Set up an interval to check and correct the z position and velocity
      const interval = setInterval(() => {
        // Get position API functions safely
        const getPosition = (api.position as any).get;
        const getVelocity = (api.velocity as any).get;
        
        // Check and fix position if needed
        if (typeof getPosition === 'function') {
          getPosition((position: [number, number, number]) => {
            if (position[2] !== 0) {
              api.position.set(position[0], position[1], 0)
            }
          });
        }
        
        // Check and fix velocity if needed
        if (typeof getVelocity === 'function') {
          getVelocity((velocity: [number, number, number]) => {
            if (velocity[2] !== 0) {
              api.velocity.set(velocity[0], velocity[1], 0)
            }
          });
        }
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [isShooter, api])

  return (
    <group ref={ref}>
      {isShooter ? (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.3, 1, 32]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <Text
            position={[0, -0.6, 0]} // Moves the text below the cone
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
            overflowWrap="break-word"
          >
            {word}
          </Text>
        </>
      ) : (
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
          <Text
            position={[0, 0, 0.51]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
            overflowWrap="break-word"
          >
            {word}
          </Text>
        </mesh>
      )}
    </group>
  )
} 