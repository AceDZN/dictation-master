'use client'

import { useEffect, useState } from 'react'

interface TypewriterEffectProps {
  text: string
  delay?: number
}

export function TypewriterEffect({ text, delay = 60 }: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  //const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay)
      
      return () => clearTimeout(timeout)
    } /*else {
      setIsDone(true)
    }*/
  }, [currentIndex, delay, text])

  return (
    <span className="relative">
      {displayText}
      {/*!isDone && (
        <span className="absolute -right-4 inline-block h-full w-0.5 bg-indigo-600 animate-blink">
          &nbsp;
        </span>
      )*/}
    </span>
  )
} 