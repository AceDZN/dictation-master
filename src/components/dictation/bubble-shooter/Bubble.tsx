'use client'

import { useSphere } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { BubbleProps } from './types'

export function Bubble({
  word,
  position,
  color = 'blue',
  onCollide,
  isShooter = false
}: BubbleProps) {
  const [ref, api] = useSphere(() => ({
    mass: isShooter ? 0 : 1,
    position,
    args: [0.5],
    collisionFilterGroup: isShooter ? 0 : 1,
    collisionFilterMask: isShooter ? 0 : 2,
    onCollide: (e) => {
      console.log('🎯 Bubble collision detected', { 
        bubbleWord: word, 
        isShooter,
        collisionBody: e.body
      })
      
      if (onCollide && !isShooter) {
        onCollide(e)
      }
    }
  }))

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