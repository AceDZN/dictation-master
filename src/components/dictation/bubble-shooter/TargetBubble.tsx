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
  const [isActive, setIsActive] = useState(true)

  const handleCollision = useCallback(
    (e: any) => {
      if (!isActive || !currentTarget) return
      
      // The correct matching logic for the game:
      // We want to match the first field (language key) of the target bubble with the current target
      const isMatch = wordPair.first === currentTarget.first;
      
      console.log('Collision detected!', {
        bubbleWordPair: wordPair,
        currentWordPair: currentTarget,
        isMatch
      })

      if (isMatch) {
        // When hit by the correct bubble, both should disappear
        console.log('✅ MATCH FOUND! Activating match effect')
        setIsActive(false) // This bubble will disappear
        onMatch(1) // Signal a match to the game
      } else {
        // When hit by the wrong bubble, only the shooter bubble should disappear
        // We don't need to do anything here as the shooter bubble will remove itself
        console.log('❌ MISMATCH. Only shooter bubble will disappear')
        // We don't call onMiss() anymore as we don't want to penalize the player
        // for hitting the wrong bubble - the shooter bubble will just disappear
      }
    },
    [wordPair, currentTarget, onMatch, isActive]
  )

  return isActive ? (
    <Bubble
      word={wordPair.second} // Display 'second' word on target bubbles
      position={position}
      color={isPowerUp ? 'yellow' : 'red'}
      onCollide={handleCollision}
    />
  ) : null
} 