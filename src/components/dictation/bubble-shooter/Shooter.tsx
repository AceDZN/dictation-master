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
  const [ref] = useSphere(() => ({
    mass: 0,
    position: [0, -4, 0],
    args: [0.5]
  }))
  const [shotBubbles, setShotBubbles] = useState<
    { word: string; key: number; direction: THREE.Vector3 }[]
  >([])
  const directionRef = useRef(new THREE.Vector3())
  const { mouse } = useThree()

  useFrame(() => {
    if (ref.current) {
      const target = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0)
      directionRef.current.copy(target).sub(ref.current.position).normalize()
      ref.current.lookAt(target) // Rotates the group to face the mouse
    }
  })

  const shoot = useCallback(() => {
    const newKey = Date.now()
    const word = wordPairs[currentIndex]?.first || '' // Use 'first' word
    const direction = directionRef.current.clone()
    setShotBubbles((prev) => [...prev, { word, key: newKey, direction }])
    onShoot(direction)
  }, [currentIndex, wordPairs, onShoot])

  useEffect(() => {
    window.addEventListener('click', shoot)
    return () => window.removeEventListener('click', shoot)
  }, [shoot])

  return (
    <>
      <Bubble
        word={wordPairs[currentIndex]?.first || ''} // Use 'first' word
        position={[0, -4, 0]}
        color="green"
        isShooter={true}
      />
      {shotBubbles.map((bubble) => (
        <ShotBubble
          key={bubble.key}
          word={bubble.word}
          direction={bubble.direction}
          onRemove={() =>
            setShotBubbles((prev) => prev.filter((b) => b.key !== bubble.key))
          }
        />
      ))}
    </>
  )
} 