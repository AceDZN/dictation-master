'use client'

import { useEffect, useRef } from 'react'
import { useSphere } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { ShotBubbleProps } from './types'
import * as THREE from 'three'

export function ShotBubble({ word, direction, onRemove }: ShotBubbleProps) {
  const isActive = useRef(true)
  const bounceCount = useRef(0)
  const maxBounces = 1 // Maximum number of bounces before disappearing

  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, -4, 0],
    args: [0.5],
    collisionFilterGroup: 2, // Shot bubbles are in group 2
    collisionFilterMask: 1 | 4, // Can collide with target bubbles (1) and walls (4)
    onCollide: (e) => {
      // Check if the collision is with a wall (group 4) or a target bubble (group 1)
      // Use type assertion for collisionFilterGroup
      const collisionGroup = (e.body as any)?.collisionFilterGroup || 0;
      
      console.log('🔵 Shot bubble collision detected:', { 
        shotWord: word,
        collisionGroup,
        collisionBody: e.body, 
        collisionTarget: e.target
      });

      if (collisionGroup === 4) {
        // Wall collision - implement ricochet
        bounceCount.current += 1;
        
        if (bounceCount.current > maxBounces) {
          // Exceeded max bounces, remove the bubble
          console.log('Max bounces exceeded, removing bubble');
          if (isActive.current) {
            isActive.current = false;
            onRemove();
          }
        } else {
          // Get current velocity for ricochet calculation
          // Use type assertion for velocity.get
          (api.velocity as any).get((velocity: [number, number, number]) => {
            // Simple ricochet - invert velocity components with some damping
            const damping = 0.8;
            
            // Determine which wall was hit based on position
            (api.position as any).get((position: [number, number, number]) => {
              // Check if it's a side wall or top/bottom wall
              if (Math.abs(position[0]) > 3) {
                // Side wall hit - invert x velocity
                api.velocity.set(-velocity[0] * damping, velocity[1] * damping, 0);
              } else {
                // Top/bottom wall hit - invert y velocity
                api.velocity.set(velocity[0] * damping, -velocity[1] * damping, 0);
              }
            });
          });
        }
      } else if (collisionGroup === 1) {
        // Target bubble collision - remove this shot bubble
        // The TargetBubble component will handle whether it should disappear or not
        console.log('Hit a target bubble, removing shot bubble');
        if (isActive.current) {
          isActive.current = false;
          onRemove();
        }
      }
    }
  }))

  useEffect(() => {
    // Set the velocity of the shot bubble
    api.velocity.set(direction.x * 10, direction.y * 10, 0)
  }, [direction, api])

  useEffect(() => {
    // Set a timeout to remove the bubble after a certain time
    const timeout = setTimeout(() => {
      if (isActive.current) {
        console.log('Shot bubble timeout - removing')
        isActive.current = false
        onRemove()
      }
    }, 5000) // Increased to 5 seconds to allow for bounces
    
    return () => clearTimeout(timeout)
  }, [onRemove])

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="green" />
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
  )
} 