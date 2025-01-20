'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { LanguageSelector } from "@/components/dictation/LanguageSelector"
import { WordPairList } from "@/components/dictation/WordPairList"
import { QuizParameters } from "@/components/dictation/QuizParameters"
import { createDictation } from "@/app/actions/dictation"
import { useState, useMemo } from "react"
import type { CreateDictationInput } from "@/app/actions/dictation"
import type { WordPair } from "@/lib/types"
import type { WordPairsList } from "@/lib/openai"
import { useRouter } from "next/navigation"
import { AdvancedQuizOptions } from "./AdvancedQuizOptions"
import { getLanguageCodeFromName, getLanguageNameFromCode } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { saveDraft } from '@/lib/draft-storage'
import type { DraftDictation } from '@/lib/draft-storage'

const DEFAULT_LANGUAGES = {
  source: 'Hebrew',
  target: 'English'
} as const

interface CreateDictationFormProps {
  initialData?: DraftDictation
}

export function CreateDictationForm({ initialData }: CreateDictationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateDictationInput & { isPublic?: boolean }>(() => ({
    id: initialData?.id,
    title: initialData?.title || '',
    description: initialData?.description || '',
    sourceLanguage: initialData?.sourceLanguage || DEFAULT_LANGUAGES.source,
    targetLanguage: initialData?.targetLanguage || DEFAULT_LANGUAGES.target,
    wordPairs: initialData?.wordPairs || [{ first: '', second: '', sentence: '' }],
    quizParameters: initialData?.quizParameters || {
      globalTimeLimit: 0,
      globalLivesLimit: 3,
      activityTimeLimit: 0,
      quizModeEnabled: false,
    },
    isPublic: initialData?.isPublic ?? true,
  }))
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const isFormComplete = useMemo(() => {
    return (
      formData.title.length >= 3 &&
      formData.sourceLanguage &&
      formData.targetLanguage &&
      formData.wordPairs.length > 0 &&
      formData.wordPairs.every(pair => pair.first && pair.second)
    )
  }, [formData.title, formData.sourceLanguage, formData.targetLanguage, formData.wordPairs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(undefined)
    
    try {
      const result = await createDictation({
        ...formData,
        sourceLanguage: formData.sourceLanguage,
        targetLanguage: formData.targetLanguage,
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

  const handleFileUploadComplete = (data: WordPairsList) => {
    setFormData(prev => ({ 
      ...prev, 
      wordPairs: data.wordPairs,
      title: data.title || prev.title,
      description: data.description || prev.description || '',
    }))
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

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description || ''}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter game description"
            maxLength={200}
            disabled={isLoading}
            className="transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="public"
            checked={formData.isPublic}
            onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
            disabled={isLoading}
          />
          <Label htmlFor="public">Public</Label>
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
          disabled={isLoading || isFormComplete}
          onClick={async () => {
            setIsProcessingFile(true)
            try {
              const response = await fetch('/api/dictation/generate-content', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sourceLanguage: getLanguageCodeFromName(formData.sourceLanguage),
                  targetLanguage: getLanguageCodeFromName(formData.targetLanguage),
                  wordPairs: formData.wordPairs,
                  title: formData.title,
                  description: formData.description || '',
                }),
              })
              
              if (!response.ok) {
                throw new Error('Failed to generate content')
              }
              
              const data = await response.json()
              setFormData(prev => ({ 
                ...prev, 
                wordPairs: data.wordPairs,
                title: data.title || prev.title,
                description: data.description || prev.description || '',
              }))
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to generate content')
            } finally {
              setIsProcessingFile(false)
            }
          }}
        >
          {isProcessingFile ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Generating...</span>
            </div>
          ) : (
            'Populate Data'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="transition duration-200 ease-in-out hover:bg-gray-100"
          disabled={isLoading}
          onClick={() => {
            try {
              const draft = saveDraft(formData)
              router.push(`/profile?saved=${draft.id}`)
            } catch (err) {
              setError('Failed to save draft')
            }
          }}
        >
          Save as Draft
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 text-white transition duration-200 ease-in-out hover:bg-indigo-700 min-w-[120px]"
          disabled={isLoading || !isFormComplete}
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
            'Create Dictation'
          )}
        </Button>
      </div>
    </form>
  )
} 