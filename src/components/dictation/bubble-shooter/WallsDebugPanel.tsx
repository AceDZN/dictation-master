'use client'

import { useState } from 'react'

interface WallsDebugPanelProps {
  width: number
  height: number
  thickness: number
  onUpdateDimensions?: (width: number, height: number, thickness: number) => void
}

export function WallsDebugPanel({ 
  width: initialWidth, 
  height: initialHeight, 
  thickness: initialThickness,
  onUpdateDimensions
}: WallsDebugPanelProps) {
  const [width, setWidth] = useState(initialWidth)
  const [height, setHeight] = useState(initialHeight)
  const [thickness, setThickness] = useState(initialThickness)
  const [isOpen, setIsOpen] = useState(true)

  const handleUpdate = () => {
    if (onUpdateDimensions) {
      onUpdateDimensions(width, height, thickness)
    }
  }

  if (!isOpen) {
    return (
      <button 
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md z-50"
        onClick={() => setIsOpen(true)}
      >
        Show Debug Panel
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-md shadow-lg z-50 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Walls Debug Panel</h3>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Width</label>
          <div className="flex items-center">
            <input 
              type="range" 
              min="3" 
              max="15" 
              step="0.5"
              value={width} 
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="w-full mr-2"
            />
            <span className="text-sm w-8">{width}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Height</label>
          <div className="flex items-center">
            <input 
              type="range" 
              min="5" 
              max="20" 
              step="0.5"
              value={height} 
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="w-full mr-2"
            />
            <span className="text-sm w-8">{height}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Thickness</label>
          <div className="flex items-center">
            <input 
              type="range" 
              min="0.1" 
              max="2" 
              step="0.1"
              value={thickness} 
              onChange={(e) => setThickness(parseFloat(e.target.value))}
              className="w-full mr-2"
            />
            <span className="text-sm w-8">{thickness}</span>
          </div>
        </div>

        <div className="pt-2">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md w-full"
            onClick={handleUpdate}
          >
            Update Walls
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>Wall Positions:</p>
          <ul className="mt-1 space-y-1">
            <li>Left: x={-width/2 - thickness/2}</li>
            <li>Right: x={width/2 + thickness/2}</li>
            <li>Top: y={height/2 + thickness/2}</li>
            <li>Bottom: y={-height/2 - thickness/2}</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 