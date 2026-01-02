'use client'

import * as React from "react"
import { useState } from "react"
import type { WordPairsList } from "@/lib/openai"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { DocumentTextIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { useTranslations } from 'next-intl'

interface TextPromptInputProps {
  onStart: () => void
  onComplete: (data: WordPairsList) => void
  onError: (error: string) => void
  disabled?: boolean
  sourceLanguage: string
  targetLanguage: string
}

export function TextPromptInput({ 
  onStart, 
  onComplete, 
  onError, 
  disabled = false, 
  sourceLanguage, 
  targetLanguage 
}: TextPromptInputProps) {
  const t = useTranslations('Dictation.form')
  const [text, setText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)

  const handleExtract = async () => {
    if (!text.trim()) {
      onError(t('textPromptEmpty'))
      return
    }

    setIsExtracting(true)
    onStart()

    try {
      const response = await fetch('/api/dictation/extract-from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          sourceLanguage,
          targetLanguage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract word pairs')
      }

      const data = await response.json()
      onComplete(data)
      setText('') // Clear the textarea after successful extraction
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to extract word pairs from text')
    } finally {
      setIsExtracting(false)
    }
  }

  const isDisabled = disabled || isExtracting

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
        <Label htmlFor="text-prompt" className="text-sm font-medium">
          {t('textPromptLabel')}
        </Label>
      </div>
      <p className="text-xs text-gray-500">
        {t('textPromptDescription')}
      </p>
      <Textarea
        id="text-prompt"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('textPromptPlaceholder')}
        disabled={isDisabled}
        className="min-h-[120px] resize-y transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
        maxLength={10000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {text.length.toLocaleString()} / 10,000 {t('characters')}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExtract}
          disabled={isDisabled || !text.trim()}
          className="gap-2"
        >
          {isExtracting ? (
            <>
              <Spinner size="sm" />
              <span>{t('extracting')}</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>{t('extractWordPairs')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
