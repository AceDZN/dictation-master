'use client'

import { ForwardedRef, MutableRefObject, RefObject, forwardRef, useCallback, useImperativeHandle } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useAnimate } from 'motion/react'

interface GameHeaderProps {
  hearts: number
  currentWordIndex: number
  totalWords: number
  timeLeft: number
  timeLimit: number
  formatTime: (seconds: number) => string
  heartsContainerRef: MutableRefObject<HTMLDivElement | null>
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
      heartsContainerRef
    }: GameHeaderProps,
    ref: ForwardedRef<GameHeaderRef>
  ) {
    const [scope, animate] = useAnimate()

    const animateHeartLoss = useCallback(() => {
      if (!heartsContainerRef.current) return

      // Create a falling heart element
      const fallingHeart = document.createElement('div')
      fallingHeart.innerHTML = '❤️'
      fallingHeart.className = 'absolute text-lg leading-none pointer-events-none z-10 origin-center'
      fallingHeart.style.willChange = 'transform, opacity'

      // Get the heart element position
      const heartElement = heartsContainerRef.current.querySelector('.heart')
      if (!heartElement) return

      const heartRect = heartElement.getBoundingClientRect()
      const containerRect = heartsContainerRef.current.getBoundingClientRect()

      // Add the falling heart to the container
      heartsContainerRef.current.appendChild(fallingHeart)

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
    }, [animate, heartsContainerRef])

    // Expose the animateHeartLoss function to parent components
    useImperativeHandle(ref, () => ({
      animateHeartLoss
    }))

    return (
      <div className="flex justify-between items-center mb-12 relative text-lg font-bold">
        {/* Hearts Container */}
        <div ref={heartsContainerRef} className="relative flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="heart animate-pulse">❤️</span>
            <span className="heart-count">{hearts}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="">
          {currentWordIndex}/{totalWords}
        </div>

        {/* Timer */}
        {timeLimit > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(timeLeft / timeLimit) * 100}%`,
                  backgroundColor: timeLeft <= 5 ? '#ef4444' : undefined
                }}
              />
            </div>
            <div className="font-mono mt-2">
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>
    )
  }
) 