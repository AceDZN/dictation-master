'use client'

import { useEffect, useState } from 'react'

interface FloatingElementsProps {
  count?: number
  speed?: number
}

export function FloatingElements({ count = 5, speed = 1 }: FloatingElementsProps) {
  const [elements, setElements] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    rotation: number
    color: string
    duration: number
    delay: number
  }>>([])
  
  useEffect(() => {
    const colors = [
      'bg-indigo-400/20', 'bg-sky-400/20', 'bg-blue-300/20', 
      'bg-purple-300/20', 'bg-violet-300/20'
    ]
    
    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // position in %
      y: Math.random() * 100,
      size: 20 + Math.random() * 40, // size between 20px and 60px
      rotation: Math.random() * 360, // initial rotation in degrees
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: (5 + Math.random() * 10) / speed, // animation duration between 5-15s
      delay: Math.random() * 5 // delay to start animation
    }))
    
    setElements(newElements)
  }, [count, speed])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {elements.map((el) => (
        <div 
          key={el.id}
          className={`absolute rounded-lg ${el.color} backdrop-blur-sm animate-float`}
          style={{
            width: `${el.size}px`,
            height: `${el.size}px`,
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `rotate(${el.rotation}deg)`,
            animation: `float ${el.duration}s ease-in-out ${el.delay}s infinite alternate, 
                        rotate ${el.duration * 2}s linear ${el.delay}s infinite`
          }}
        />
      ))}
    </div>
  )
} 