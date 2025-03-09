'use client'

import { ForwardedRef, MutableRefObject, forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { useAnimate } from 'motion/react'

interface GameHeaderProps {
  hearts: number
  currentWordIndex?: number
  totalWords?: number
  timeLeft: number
  timeLimit?: number
  formatTime: (seconds: number) => string
  heartsContainerRef?: MutableRefObject<HTMLDivElement | null>
  progress?: number
}

export interface GameHeaderRef {
  animateHeartLoss: () => void
}

/**
 * GameHeader - Reusable component for displaying game statistics
 * Includes hearts, progress, and timer
 */
export const GameHeader = forwardRef<GameHeaderRef, GameHeaderProps>(
  function GameHeader(
    {
      hearts,
      currentWordIndex,
      totalWords,
      timeLeft,
      timeLimit,
      formatTime,
      heartsContainerRef,
      progress
    }: GameHeaderProps,
    ref: ForwardedRef<GameHeaderRef>
  ) {
    const [, animate] = useAnimate()
    const internalHeartsContainerRef = useRef<HTMLDivElement>(null)
    const heartsRef = heartsContainerRef || internalHeartsContainerRef

    const animateHeartLoss = useCallback(() => {
      if (!heartsRef.current) return

      // Create a falling heart element
      const fallingHeart = document.createElement('div')
      fallingHeart.innerHTML = '❤️'
      fallingHeart.className = 'absolute text-lg leading-none pointer-events-none z-10 origin-center'
      fallingHeart.style.willChange = 'transform, opacity'

      // Get the heart element position
      const heartElement = heartsRef.current.querySelector('.heart')
      if (!heartElement) return

      const heartRect = heartElement.getBoundingClientRect()
      const containerRect = heartsRef.current.getBoundingClientRect()

      // Add the falling heart to the container
      heartsRef.current.appendChild(fallingHeart)

      // Position the falling heart exactly over the heart display
      fallingHeart.style.left = `${heartRect.left - containerRect.left}px`
      fallingHeart.style.top = `${heartRect.top - containerRect.top}px`

      // Animate the falling heart
      animate([
        [
          fallingHeart,
          {
            transform: [
              'translate(0, 0) rotate(0deg) scale(1)',
              `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg) scale(0.5)`
            ],
            opacity: [1, 0]
          },
          {
            duration: 5,
            ease: [0.23, 1, 0.32, 1], // Cubic bezier for natural falling motion
            onComplete: () => fallingHeart.remove()
          }
        ]
      ])
    }, [animate, heartsRef])

    // Expose the animateHeartLoss function to parent components
    useImperativeHandle(ref, () => ({
      animateHeartLoss
    }))

    // Calculate effective time limit (default to 60s if not provided)
    const effectiveTimeLimit = timeLimit ?? 60

    return (
      <div className="flex justify-between items-center mb-12 relative text-lg font-bold w-full">
        {/* Hearts Container */}
        <div ref={heartsRef} className="relative flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="heart animate-pulse">❤️</span>
            <span className="heart-count">{hearts}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="">
          {currentWordIndex !== undefined && totalWords !== undefined ? (
            `${currentWordIndex}/${totalWords}`
          ) : progress !== undefined ? (
            `${progress}%`
          ) : null}
        </div>

        {/* Timer */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
              style={{ 
                width: `${(timeLeft / effectiveTimeLimit) * 100}%`,
                backgroundColor: timeLeft <= 5 ? '#ef4444' : undefined
              }}
            />
          </div>
          <div className="font-mono mt-2">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
    )
  }
) 