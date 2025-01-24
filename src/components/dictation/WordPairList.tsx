'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WordPair } from "@/lib/types"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { FileUpload } from "./FileUpload"
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
    onChange([...wordPairs, { first: '', second: '', sentence: '' }])
  }

  const handleRemovePair = (index: number) => {
    onChange(wordPairs.filter((_, i) => i !== index))
  }

  const handlePairChange = (index: number, field: keyof WordPair, value: string) => {
    const newPairs = [...wordPairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    onChange(newPairs)
  }

  return (
    <div className="space-y-4">
      {onFileUploadStart && onFileUploadComplete && onFileUploadError && (
        <FileUpload
          onStart={onFileUploadStart}
          onComplete={onFileUploadComplete}
          onError={onFileUploadError}
          disabled={disabled}
        />
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr,1fr,2fr,auto] gap-4 p-4 bg-gray-50 font-semibold">
          <div>{tLang(`languages.${sourceLanguage}`)}</div>
          <div>{tLang(`languages.${targetLanguage}`)}</div>
          <div>{t('exampleSentence')}</div>
          <div className="w-8"></div>
        </div>
        <div className="divide-y">
          {wordPairs.map((pair, index) => (
            <div key={index} className="grid grid-cols-[1fr,1fr,2fr,auto] gap-4 p-4">
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
                value={pair.sentence || ''}
                onChange={(e) => handlePairChange(index, 'sentence', e.target.value)}
                placeholder={t('exampleSentence')}
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