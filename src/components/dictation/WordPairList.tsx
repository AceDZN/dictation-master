// src/components/dictation/WordPairList.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WordPair } from "@/lib/types"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { FileUpload } from "./FileUpload"
import { TextPromptInput } from "./TextPromptInput"
import type { WordPairsList } from "@/lib/openai"
import { useTranslations } from 'next-intl'

interface WordPairListProps {
  wordPairs: WordPair[]
  sourceLanguage: string
  targetLanguage: string
  disabled?: boolean
  onChange: (wordPairs: WordPair[]) => void
  onFileUploadStart?: () => void
  onFileUploadComplete?: (data: WordPairsList) => void
  onFileUploadError?: (error: string) => void
}

export function WordPairList({ 
  wordPairs,
  sourceLanguage,
  targetLanguage,
  disabled = false,
  onChange,
  onFileUploadStart,
  onFileUploadComplete,
  onFileUploadError
}: WordPairListProps) {
  const t = useTranslations('Dictation.form')
  const tLang = useTranslations('Language')

  const handleAddPair = () => {
    onChange([...wordPairs, { first: '', second: '', firstSentence: '', secondSentence: '', sentence: '' }])
  }

  const handleRemovePair = (index: number) => {
    onChange(wordPairs.filter((_, i) => i !== index))
  }

  const handlePairChange = (index: number, field: keyof WordPair, value: string) => {
    const newPairs = [...wordPairs]
    const updatedPair: WordPair = { ...newPairs[index], [field]: value }
    if (field === 'secondSentence') {
      updatedPair.sentence = value
    }
    newPairs[index] = updatedPair
    onChange(newPairs)
  }

  return (
    <div className="space-y-4">
      {onFileUploadStart && onFileUploadComplete && onFileUploadError && (
        <div className="space-y-4">
          {/* Text Prompt Input */}
          <div className="border rounded-lg p-4 bg-gray-50/50">
            <TextPromptInput
              onStart={onFileUploadStart}
              onComplete={onFileUploadComplete}
              onError={onFileUploadError}
              disabled={disabled}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          </div>
          
          {/* Divider with "or" text */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">{t('orDivider')}</span>
            </div>
          </div>
          
          {/* File Upload */}
          <FileUpload
            onStart={onFileUploadStart}
            onComplete={onFileUploadComplete}
            onError={onFileUploadError}
            disabled={disabled}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
          />
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr,1fr,1.5fr,1.5fr,auto] gap-4 p-4 bg-gray-50 font-semibold">
          <div>{tLang(`languages.${sourceLanguage}`)}</div>
          <div>{tLang(`languages.${targetLanguage}`)}</div>
          <div>{t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}</div>
          <div>{t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}</div>
          <div className="w-8"></div>
        </div>
        <div className="divide-y">
          {wordPairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-[1fr,1fr,1.5fr,1.5fr,auto] gap-4 p-4">
              <Input
                value={pair.first}
                onChange={(e) => handlePairChange(index, 'first', e.target.value)}
                placeholder={t('sourceWord', { language: tLang(`languages.${sourceLanguage}`) })}
                disabled={disabled}
              />
              <Input
                value={pair.second}
                onChange={(e) => handlePairChange(index, 'second', e.target.value)}
                placeholder={t('targetWord', { language: tLang(`languages.${targetLanguage}`) })}
                disabled={disabled}
              />
              <Input
                value={pair.firstSentence || ''}
                onChange={(e) => handlePairChange(index, 'firstSentence', e.target.value)}
                placeholder={t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}
                disabled={disabled}
              />
              <Input
                value={pair.secondSentence || pair.sentence || ''}
                onChange={(e) => handlePairChange(index, 'secondSentence', e.target.value)}
                placeholder={t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}
                disabled={disabled}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePair(index)}
                disabled={disabled || wordPairs.length === 1}
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Remove pair</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddPair}
        disabled={disabled}
        className="w-full"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        {t('addWordPair')}
      </Button>
    </div>
  )
} 