import { useMemo } from "react"
import * as THREE from 'three'
// Canvas-based text display
export const useCanvasText = (text: string, fontSize: number = 24, color: string = 'white', fontFamily: string = 'Arial, sans-serif', backgroundColor: string = 'rgba(0,0,0,0.5)') => {
    const texture = useMemo(() => {
      // Create canvas for text rendering
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      
      // Set canvas size based on text length with padding
      const padding = 0
      const textWidth = text.length * fontSize * 0.6 // Approximate width based on character count
      canvas.width = Math.max(200, textWidth + padding )
      canvas.height = fontSize * 1.5 + padding
      
      // Set text rendering styles
      ctx.fillStyle = backgroundColor // More transparent background (20%)
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw text with provided font size
      ctx.font = `bold ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.fillText(text, canvas.width / 2, canvas.height / 2 )
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas)
      texture.needsUpdate = true
      return texture
    }, [text, fontSize, color, fontFamily, backgroundColor])
    
    return texture
  }