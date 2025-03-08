'use client'

import { useState, useCallback } from 'react'
import { Bubble } from './Bubble'
import { TargetBubbleProps } from './types'

export function TargetBubble({
  wordPair,
  position,
  onMatch,
  onMiss,
  currentTarget,
  isPowerUp = false
}: TargetBubbleProps) {
  // Use state to control visibility
  const [active, setActive] = useState(true)

  // Handle collisions with shot bubbles
  const handleCollision = useCallback(
    (e: any) => {
      // Skip if already inactive or no current target
      if (!active || !currentTarget) return
      
      // Check if this bubble matches the current target word
      const isMatch = wordPair.first === currentTarget.first
      
      console.log('🎯 Target bubble hit:', {
        targetBubble: wordPair.second,
        targetFirst: wordPair.first,
        currentTargetFirst: currentTarget.first,
        isMatch
      })

      if (isMatch) {
        // This is the correct bubble - both bubbles should disappear
        console.log('✅ CORRECT MATCH! Target bubble will disappear')
        // Set inactive to remove from rendering
        setActive(false)
        // Call onMatch to update score and advance to next word
        onMatch(1)
      } else {
        // Incorrect bubble hit - only shot bubble should disappear
        console.log('❌ INCORRECT. Shot bubble will disappear but target stays')
        // We don't need to do anything here - the shot bubble will remove itself
      }
    },
    [wordPair, currentTarget, onMatch, active]
  )

  // Don't render if not active
  if (!active) return null

  return (
    <Bubble
      word={wordPair.second} // Display 'second' word on target bubbles
      position={position}
      color={isPowerUp ? 'yellow' : 'red'}
      onCollide={handleCollision}
    />
  )
} 