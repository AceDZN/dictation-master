'use client'

import * as React from "react"
import type { WordPairsList } from "@/lib/openai"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FileUploadProps {
  onStart: () => void
  onComplete: (data: WordPairsList) => void
  onError: (error: string) => void
  disabled?: boolean
}

export function FileUpload({ onStart, onComplete, onError, disabled = false }: FileUploadProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    onStart()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/dictation/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      onComplete(data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to upload file')
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Upload Word Pairs</Label>
      <Input
        id="file-upload"
        type="file"
        accept=".txt,.csv"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  )
} 