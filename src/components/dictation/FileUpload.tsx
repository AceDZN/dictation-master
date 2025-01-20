'use client'

import * as React from "react"
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import type { WordPair } from "@/lib/types"
import { getLanguageCodeFromName } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import type { WordPairsList } from "@/lib/openai"

interface FileUploadProps {
  onUpload: (data: WordPairsList) => void
  onError: (error: string) => void
  sourceLanguage: string
  targetLanguage: string
  disabled?: boolean
  onUploadStart?: () => void
}

export function FileUpload({ 
  onUpload, 
  onError, 
  sourceLanguage, 
  targetLanguage, 
  disabled,
  onUploadStart 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB')
      return
    }

    if (!['text/csv', 'text/plain'].includes(file.type) && !file.type.startsWith('image/')) {
      onError('Only CSV, TXT, and image files are supported')
      return
    }

    setIsLoading(true)
    onUploadStart?.()
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('firstLanguage', sourceLanguage)
      formData.append('secondLanguage', targetLanguage)

      const response = await fetch('/api/dictation/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file')
      }

      onUpload(data)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    if (!isLoading && !disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isLoading || disabled ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
      onDrop={!disabled ? handleDrop : undefined}
      onDragOver={!disabled ? handleDragOver : undefined}
      onDragLeave={!disabled ? handleDragLeave : undefined}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,image/*"
        className="hidden"
        onChange={handleFileInput}
        disabled={isLoading || disabled}
      />
      <div className="flex flex-col items-center gap-2">
        {isLoading ? (
          <>
            <Spinner className="text-indigo-600" size="lg" />
            <div className="text-sm text-gray-600">Processing file...</div>
            <div className="text-xs text-gray-500">This may take a few moments</div>
          </>
        ) : (
          <>
            <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              CSV, TXT, or image file (max. 10MB)
            </div>
          </>
        )}
      </div>
    </div>
  )
} 