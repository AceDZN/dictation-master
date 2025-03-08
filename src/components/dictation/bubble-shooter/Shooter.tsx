// src/components/dictation/bubble-shooter/Shooter.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useSphere } from '@react-three/cannon'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Bubble } from './Bubble'
import { ShotBubble } from './ShotBubble'
import { ShooterProps } from './types'

export function Shooter({
  wordPairs,
  currentIndex,
  onShoot
}: ShooterProps) {
  // Create shooter physics body
  const [ref] = useSphere(() => ({
    mass: 0,
    position: [0, -4, 0],
    args: [0.5]
  }))
  
  // Track active shot bubbles
  const [shotBubbles, setShotBubbles] = useState<
    { word: string; key: number; direction: THREE.Vector3 }[]
  >([])
  
  // Track shooting direction
  const directionRef = useRef(new THREE.Vector3())
  const { mouse } = useThree()
  
  // Add a cooldown to prevent rapid-firing
  const [canShoot, setCanShoot] = useState(true)
  const cooldownTime = 500 // milliseconds
  
  // Update shooter orientation to face mouse cursor
  useFrame(() => {
    if (ref.current) {
      const target = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0)
      directionRef.current.copy(target).sub(ref.current.position).normalize()
      ref.current.lookAt(target) // Rotates the group to face the mouse
    }
  })

  // Handle shooting
  const shoot = useCallback(() => {
    // Only shoot if cooled down and we have a valid word pair
    if (!canShoot || currentIndex >= wordPairs.length) return
    
    // Create a new shot bubble
    const newKey = Date.now()
    const word = wordPairs[currentIndex]?.first || ''
    const direction = directionRef.current.clone()
    
    // Log shooting action
    console.log('🔫 Shooting bubble:', { word, direction: [direction.x, direction.y] })
    
    // Add to active shot bubbles
    setShotBubbles((prev) => [...prev, { word, key: newKey, direction }])
    
    // Trigger cooldown
    setCanShoot(false)
    setTimeout(() => setCanShoot(true), cooldownTime)
    
    // Notify parent component
    onShoot(direction)
  }, [currentIndex, wordPairs, onShoot, canShoot])

  // Attach click event listener
  useEffect(() => {
    window.addEventListener('click', shoot)
    return () => window.removeEventListener('click', shoot)
  }, [shoot])
  
  // Handle removal of a shot bubble
  const handleRemoveShotBubble = useCallback((key: number) => {
    console.log('📤 Removing shot bubble with key:', key)
    setShotBubbles(prev => prev.filter(b => b.key !== key))
  }, [])

  return (
    <>
      {/* Shooter cone with current word */}
      <Bubble
        word={wordPairs[currentIndex]?.first || ''}
        position={[0, -4, 0]}
        color={canShoot ? "green" : "gray"}
        isShooter={true}
      />
      
      {/* Active shot bubbles */}
      {shotBubbles.map((bubble) => (
        <ShotBubble
          key={bubble.key}
          word={bubble.word}
          direction={bubble.direction}
          onRemove={() => handleRemoveShotBubble(bubble.key)}
        />
      ))}
    </>
  )
} 