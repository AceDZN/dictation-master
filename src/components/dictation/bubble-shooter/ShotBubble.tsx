'use client'

import { useEffect, useState, useRef } from 'react'
import { useSphere } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { ShotBubbleProps } from './types'
import * as THREE from 'three'

export function ShotBubble({ word, direction, onRemove }: ShotBubbleProps) {
  // Use state to control visibility
  const [active, setActive] = useState(true)
  // Track number of wall bounces
  const [bounceCount, setBounceCount] = useState(0)
  // Max allowed bounces
  const maxBounces = 1
  
  // Handle removal of the bubble
  const handleRemove = () => {
    // Only process if still active
    if (active) {
      console.log('💥 REMOVING SHOT BUBBLE:', word)
      setActive(false)
      // Give time for state to update before calling onRemove
      setTimeout(() => onRemove(), 50)
    }
  }
  
  // Track collision with target bubbles
  const [hitTarget, setHitTarget] = useState(false)
  
  const handleCollision = (e: any) => {
    // Skip if already inactive
    if (!active) return
    
    // Get the collision group to determine what was hit
    const collisionGroup = (e.body as any)?.collisionFilterGroup || 0
    
    if (collisionGroup === 1) {
      // Hit a target bubble
      console.log('🎯 Hit target bubble!', word)
      setHitTarget(true)
      handleRemove()
    } else if (collisionGroup === 4) {
      // Hit a wall
      const currentBounces = bounceCount + 1
      console.log(`🧱 Wall collision (bounce ${currentBounces}/${maxBounces})`)
      
      if (currentBounces > maxBounces) {
        // Too many bounces, remove the bubble
        console.log('Max bounces exceeded')
        handleRemove()
      } else {
        setBounceCount(currentBounces)
        
        // Calculate ricochet
        try {
          // Get API functions safely
          const getVelocity = (api.velocity as any).get;
          const getPosition = (api.position as any).get;
          
          if (typeof getVelocity === 'function' && typeof getPosition === 'function') {
            getVelocity((velocity: [number, number, number]) => {
              getPosition((position: [number, number, number]) => {
                // Determine which wall was hit based on position
                const damping = 0.8
                
                if (Math.abs(position[0]) > wallDimensions.width/2) {
                  // Side wall hit - invert x velocity
                  api.velocity.set(-velocity[0] * damping, velocity[1] * damping, 0)
                } else {
                  // Top/bottom wall hit - invert y velocity
                  api.velocity.set(velocity[0] * damping, -velocity[1] * damping, 0)
                }
              });
            });
          }
        } catch (error) {
          console.error('Error during ricochet:', error)
          handleRemove()
        }
      }
    }
  }
  
  // Wall dimensions (match the ones in the game)
  const wallDimensions = {
    width: 13.5,
    height: 12
  }
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, -4, 0],
    args: [0.5],
    collisionFilterGroup: 2,  // Shot bubbles are in group 2
    collisionFilterMask: 1 | 4, // Can collide with targets (1) and walls (4)
    onCollide: handleCollision,
    // Add some damping to make movement more natural
    linearDamping: 0.1
  }))
  
  // Ensure the shot bubble stays on z=0 plane
  const checkZAxisInterval = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Set initial velocity when created (ensure z=0)
    api.velocity.set(direction.x * 10, direction.y * 10, 0)
    
    // Set up an interval to ensure the bubble stays on z=0
    checkZAxisInterval.current = setInterval(() => {
      // Only check if still active
      if (active) {
        // Get API functions safely
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
      }
    }, 50)
    
    // Auto-remove after timeout
    const timeout = setTimeout(() => {
      console.log('Shot bubble timeout')
      handleRemove()
    }, 5000)
    
    return () => {
      clearTimeout(timeout)
      if (checkZAxisInterval.current) {
        clearInterval(checkZAxisInterval.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Don't render if not active
  if (!active) return null
  
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