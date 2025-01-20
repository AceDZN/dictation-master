'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/dictation/LanguageSelector"
import { WordPairList } from "@/components/dictation/WordPairList"
import { QuizParameters } from "@/components/dictation/QuizParameters"
import { createDictation } from "@/app/actions/dictation"
import { useState } from "react"
import type { CreateDictationInput } from "@/app/actions/dictation"
import type { WordPair } from "@/lib/types"
import { useRouter } from "next/navigation"
import { AdvancedQuizOptions } from "./AdvancedQuizOptions"
import { getLanguageCodeFromName, getLanguageNameFromCode } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const DEFAULT_LANGUAGES = {
  source: 'Hebrew',
  target: 'English'
} as const

export function CreateDictationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateDictationInput>({
    title: '',
    sourceLanguage: DEFAULT_LANGUAGES.source,
    targetLanguage: DEFAULT_LANGUAGES.target,
    wordPairs: [{ first: '', second: '', sentence: '' }],
    quizParameters: {
      globalTimeLimit: 0,
      globalLivesLimit: 3,
      activityTimeLimit: 0,
      quizModeEnabled: false,
    },
  })
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(undefined)
    
    try {
      const result = await createDictation({
        ...formData,
        sourceLanguage: getLanguageCodeFromName(formData.sourceLanguage),
        targetLanguage: getLanguageCodeFromName(formData.targetLanguage),
      })
      
      if (result.error) {
        setError(result.error)
      } else if (result.game?.id) {
        router.push(`/dictation/edit/${result.game.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUploadStart = () => {
    setIsProcessingFile(true)
    setError(undefined)
  }

  const handleFileUploadComplete = (wordPairs: WordPair[]) => {
    setFormData(prev => ({ ...prev, wordPairs }))
    setIsProcessingFile(false)
  }

  const handleFileUploadError = (error: string) => {
    setError(error)
    setIsProcessingFile(false)
  }

  const isLoading = isSubmitting || isProcessingFile

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-md rounded-lg p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">Basic Information</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter game title"
            maxLength={100}
            required
            disabled={isLoading}
            className="transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LanguageSelector
            id="source-language"
            label="Source Language"
            value={formData.sourceLanguage}
            onChange={value => setFormData({ ...formData, sourceLanguage: value })}
            excludeLanguage={formData.targetLanguage}
            disabled={isLoading}
          />
          <LanguageSelector
            id="target-language"
            label="Target Language"
            value={formData.targetLanguage}
            onChange={value => setFormData({ ...formData, targetLanguage: value })}
            excludeLanguage={formData.sourceLanguage}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Word Pairs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">Word Pairs</h2>
        <WordPairList
          wordPairs={formData.wordPairs}
          onChange={wordPairs => setFormData({ ...formData, wordPairs })}
          sourceLanguage={formData.sourceLanguage}
          targetLanguage={formData.targetLanguage}
          disabled={isLoading}
          onFileUploadStart={handleFileUploadStart}
          onFileUploadComplete={handleFileUploadComplete}
          onFileUploadError={handleFileUploadError}
        />
      </div>

      {/* Advanced Quiz Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">Advanced Options</h2>
        <AdvancedQuizOptions
          value={formData.quizParameters}
          onChange={quizParameters => setFormData({ ...formData, quizParameters })}
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          className="transition duration-200 ease-in-out hover:bg-gray-100"
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 text-white transition duration-200 ease-in-out hover:bg-indigo-700 min-w-[120px]"
          disabled={isLoading}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Creating...</span>
            </div>
          ) : isProcessingFile ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Processing File...</span>
            </div>
          ) : (
            'Create Game'
          )}
        </Button>
      </div>
    </form>
  )
} 