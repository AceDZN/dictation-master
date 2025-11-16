// src/components/dictation/WordPairList.tsx
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  const isRTL = (language: string): boolean => {
    const rtlLanguages = ['hebrew', 'he', 'iw', 'arabic', 'ar']
    return rtlLanguages.includes(language.toLowerCase())
  }

  const sourceIsRTL = isRTL(sourceLanguage)
  const targetIsRTL = isRTL(targetLanguage)

  return (
    <div className="space-y-4">
      {onFileUploadStart && onFileUploadComplete && onFileUploadError && (
        <FileUpload
          onStart={onFileUploadStart}
          onComplete={onFileUploadComplete}
          onError={onFileUploadError}
          disabled={disabled}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
        />
      )}
      
      <div className="border rounded-lg overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[1fr,1fr,1.5fr,1.5fr,auto] gap-4 p-4 bg-gray-50 font-semibold text-sm">
          <div dir={sourceIsRTL ? 'rtl' : 'ltr'}>{tLang(`languages.${sourceLanguage}`)}</div>
          <div dir={targetIsRTL ? 'rtl' : 'ltr'}>{tLang(`languages.${targetLanguage}`)}</div>
          <div dir={sourceIsRTL ? 'rtl' : 'ltr'}>{t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}</div>
          <div dir={targetIsRTL ? 'rtl' : 'ltr'}>{t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}</div>
          <div className="w-8"></div>
        </div>
        <div className="divide-y divide-gray-200">
          {wordPairs.map((pair, index) => (
            <div key={index} className="p-3 sm:p-4 space-y-3 sm:space-y-0">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs font-medium text-gray-700" dir={sourceIsRTL ? 'rtl' : 'ltr'}>
                      {tLang(`languages.${sourceLanguage}`)}
                    </Label>
                    <Input
                      value={pair.first}
                      onChange={(e) => handlePairChange(index, 'first', e.target.value)}
                      placeholder={t('sourceWord', { language: tLang(`languages.${sourceLanguage}`) })}
                      disabled={disabled}
                      className="w-full"
                      dir={sourceIsRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  {wordPairs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePair(index)}
                      disabled={disabled}
                      className="mt-6 shrink-0"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Remove pair</span>
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700" dir={targetIsRTL ? 'rtl' : 'ltr'}>
                    {tLang(`languages.${targetLanguage}`)}
                  </Label>
                  <Input
                    value={pair.second}
                    onChange={(e) => handlePairChange(index, 'second', e.target.value)}
                    placeholder={t('targetWord', { language: tLang(`languages.${targetLanguage}`) })}
                    disabled={disabled}
                    className="w-full"
                    dir={targetIsRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700" dir={sourceIsRTL ? 'rtl' : 'ltr'}>
                    {t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}
                  </Label>
                  <Input
                    value={pair.firstSentence || ''}
                    onChange={(e) => handlePairChange(index, 'firstSentence', e.target.value)}
                    placeholder={t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}
                    disabled={disabled}
                    className="w-full"
                    dir={sourceIsRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700" dir={targetIsRTL ? 'rtl' : 'ltr'}>
                    {t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}
                  </Label>
                  <Input
                    value={pair.secondSentence || pair.sentence || ''}
                    onChange={(e) => handlePairChange(index, 'secondSentence', e.target.value)}
                    placeholder={t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}
                    disabled={disabled}
                    className="w-full"
                    dir={targetIsRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-[1fr,1fr,1.5fr,1.5fr,auto] gap-4">
                <Input
                  value={pair.first}
                  onChange={(e) => handlePairChange(index, 'first', e.target.value)}
                  placeholder={t('sourceWord', { language: tLang(`languages.${sourceLanguage}`) })}
                  disabled={disabled}
                  dir={sourceIsRTL ? 'rtl' : 'ltr'}
                />
                <Input
                  value={pair.second}
                  onChange={(e) => handlePairChange(index, 'second', e.target.value)}
                  placeholder={t('targetWord', { language: tLang(`languages.${targetLanguage}`) })}
                  disabled={disabled}
                  dir={targetIsRTL ? 'rtl' : 'ltr'}
                />
                <Input
                  value={pair.firstSentence || ''}
                  onChange={(e) => handlePairChange(index, 'firstSentence', e.target.value)}
                  placeholder={t('sourceSentence', { language: tLang(`languages.${sourceLanguage}`) })}
                  disabled={disabled}
                  dir={sourceIsRTL ? 'rtl' : 'ltr'}
                />
                <Input
                  value={pair.secondSentence || pair.sentence || ''}
                  onChange={(e) => handlePairChange(index, 'secondSentence', e.target.value)}
                  placeholder={t('targetSentence', { language: tLang(`languages.${targetLanguage}`) })}
                  disabled={disabled}
                  dir={targetIsRTL ? 'rtl' : 'ltr'}
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