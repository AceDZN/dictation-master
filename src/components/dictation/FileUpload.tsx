'use client'

import * as React from "react"
import type { WordPairsList } from "@/lib/openai"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'

interface FileUploadProps {
  onStart: () => void
  onComplete: (data: WordPairsList) => void
  onError: (error: string) => void
  disabled?: boolean
  sourceLanguage: string
  targetLanguage: string
}

export function FileUpload({ onStart, onComplete, onError, disabled = false, sourceLanguage, targetLanguage }: FileUploadProps) {
  const t = useTranslations('Dictation.form')

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    onStart()

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('firstLanguage', sourceLanguage)
      formData.append('secondLanguage', targetLanguage)

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
      <Label htmlFor="file-upload">{t('uploadWordPairs')}</Label>
      <Input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  )
} 