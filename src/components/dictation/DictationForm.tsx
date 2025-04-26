'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { LanguageSelector } from "@/components/dictation/LanguageSelector"
import { WordPairList } from "@/components/dictation/WordPairList"
import { useState, useMemo, useEffect, useCallback } from "react"
import type { CreateDictationInput } from "@/app/actions/dictation"
import type { WordPairsList } from "@/lib/openai"
import { useRouter } from "next/navigation"
import { AdvancedQuizOptions } from "./AdvancedQuizOptions"
import { getLanguageCodeFromName } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import { useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/posthog-utils'

const DEFAULT_LANGUAGES = {
  source: 'Hebrew',
  target: 'English'
} as const

interface DictationFormProps {
  id?: string
  initialData?: CreateDictationInput & {
    id?: string
    isPublic?: boolean
  }
}

interface FormData extends CreateDictationInput {
  id?: string
  isPublic: boolean
}

export function DictationForm({ id, initialData }: DictationFormProps) {
  const router = useRouter()
  const t = useTranslations('Dictation.form')
  const [formData, setFormData] = useState<FormData>(() => {
    const isPublic = initialData?.isPublic
    return {
      id: initialData?.id,
      title: initialData?.title || '',
      description: initialData?.description,
      sourceLanguage: initialData?.sourceLanguage || DEFAULT_LANGUAGES.source,
      targetLanguage: initialData?.targetLanguage || DEFAULT_LANGUAGES.target,
      wordPairs: initialData?.wordPairs || [{ first: '', second: '', sentence: '' }],
      quizParameters: initialData?.quizParameters || {
        globalTimeLimit: 0,
        globalLivesLimit: 3,
        activityTimeLimit: 30,
        quizModeEnabled: true,
      },
      isPublic: typeof isPublic === 'boolean' ? isPublic : true,
    }
  })
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [isLoading, setIsLoading] = useState(!!id)
  const [selectorKey, setSelectorKey] = useState(0)

  // Fetch data if in edit mode
  useEffect(() => {
    if (!id) return

    async function fetchDictation() {
      try {
        const response = await fetch(`/api/dictation/edit/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dictation')
        }
        const data = await response.json()
        setFormData({
          ...data,
          id: id,
          isPublic: data.isPublic ?? true,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dictation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDictation()
  }, [id])

  const handleGenerateContent = async () => {
    setIsProcessingFile(true)
    setError(undefined)
    try {
      const response = await fetch('/api/dictation/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceLanguage: getLanguageCodeFromName(formData.sourceLanguage),
          targetLanguage: getLanguageCodeFromName(formData.targetLanguage),
          wordPairs: formData.wordPairs || [],
          title: formData.title || 'NO TITLE',
          description: formData.description || 'NO DESCRIPTION',
          isPublic: formData.isPublic,
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
        description: data.description || prev.description,
      }))
      trackEvent('game_content_generated', {
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        word_pairs_generated_count: data.wordPairs.length
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    setError(undefined)
    
    try {
      const response = await fetch('/api/dictation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isPublic: false, // Force draft to be private
          sourceLanguage: formData.sourceLanguage,
          targetLanguage: formData.targetLanguage,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save draft')
      }

      trackEvent('game_draft_saved', { 
        game_id: data.dictationId,
        game_title: formData.title,
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        word_pairs_count: formData.wordPairs.length
      })

      router.push(`/profile?saved=${data.dictationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!formData.id) return

    setIsDeleting(true)
    setError(undefined)
    
    try {
      const response = await fetch(`/api/dictation/edit/${formData.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      trackEvent('game_deleted', { game_id: formData.id })

      router.push('/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft')
    } finally {
      setIsDeleting(false)
    }
  }

  const isFormComplete = useMemo(() => {
    return (
      formData.title.length >= 3 &&
      formData.sourceLanguage &&
      formData.targetLanguage &&
      formData.wordPairs.length > 0 &&
      formData.wordPairs.every(pair => pair.first && pair.second) ? true : false
    )
  }, [formData.title, formData.sourceLanguage, formData.targetLanguage, formData.wordPairs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(undefined)
    
    try {
      const url = id ? `/api/dictation/edit/${id}` : '/api/dictation/create'
      const method = id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sourceLanguage: formData.sourceLanguage,
          targetLanguage: formData.targetLanguage,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${id ? 'update' : 'create'} dictation`)
      }

      trackEvent('game_published', {
        game_id: data.dictationId,
        game_title: formData.title,
        source_language: formData.sourceLanguage,
        target_language: formData.targetLanguage,
        word_pairs_count: formData.wordPairs.length
      })

      router.push(`/profile`)
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
      description: data.description || prev.description || undefined,
    }))
    setIsProcessingFile(false)
  }

  const handleFileUploadError = (error: string) => {
    setError(error)
    setIsProcessingFile(false)
  }

  const handleLanguageSwap = useCallback(() => {
    setFormData(prev => {
      const newWordPairs = prev.wordPairs.map(pair => ({
        first: pair.second,
        second: pair.first,
        sentence: pair.sentence
      }))
      
      return {
        ...prev,
        sourceLanguage: prev.targetLanguage,
        targetLanguage: prev.sourceLanguage,
        wordPairs: newWordPairs
      }
    })
    setSelectorKey(prev => prev + 1)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const isLoadingState = isSubmitting || isProcessingFile || isLoading

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-md rounded-lg p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">{t('basicInfo')}</h2>
        <div className="space-y-2">
          <Label htmlFor="title">{t('title')}</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('titlePlaceholder')}
            maxLength={100}
            required
            disabled={isLoadingState}
            className="transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('description')}</Label>
          <Input
            id="description"
            value={formData.description ?? ''}
            onChange={e => setFormData({ ...formData, description: e.target.value || undefined })}
            placeholder={t('descriptionPlaceholder')}
            maxLength={200}
            disabled={isLoadingState}
            className="transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 gap-2">
          <Switch
            id="public"
            checked={formData.isPublic}
            onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
            disabled={isLoadingState}
          />
          <Label htmlFor="public">{t('public')}</Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LanguageSelector
            key={`source-${selectorKey}`}
            id="source-language"
            label={t('sourceLanguage')}
            value={formData.sourceLanguage}
            onChange={value => setFormData({ ...formData, sourceLanguage: value })}
            excludeLanguage={formData.targetLanguage}
            disabled={isLoadingState}
          />
          <div className="flex items-end justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLanguageSwap}
              disabled={isLoadingState}
              className="mb-[2px]"
            >
              <ArrowsRightLeftIcon className="h-4 w-4" />
              <span className="sr-only">{t('swapLanguages')}</span>
            </Button>
          </div>
          <LanguageSelector
            key={`target-${selectorKey}`}
            id="target-language"
            label={t('targetLanguage')}
            value={formData.targetLanguage}
            onChange={value => setFormData({ ...formData, targetLanguage: value })}
            excludeLanguage={formData.sourceLanguage}
            disabled={isLoadingState}
          />
        </div>
      </div>

      {/* Word Pairs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">{t('wordPairs')}</h2>
        <WordPairList
          wordPairs={formData.wordPairs}
          onChange={wordPairs => setFormData({ ...formData, wordPairs })}
          sourceLanguage={formData.sourceLanguage}
          targetLanguage={formData.targetLanguage}
          disabled={isLoadingState}
          onFileUploadStart={handleFileUploadStart}
          onFileUploadComplete={handleFileUploadComplete}
          onFileUploadError={handleFileUploadError}
        />
      </div>

      {/* Advanced Quiz Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">{t('advancedOptions')}</h2>
        <AdvancedQuizOptions
          value={formData.quizParameters}
          onChange={quizParameters => setFormData({ ...formData, quizParameters })}
          disabled={isLoadingState}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {id ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="transition duration-200 ease-in-out hover:bg-gray-100"
              onClick={() => router.push('/profile')}
              disabled={isLoadingState || isDeleting}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="transition duration-200 ease-in-out hover:bg-gray-100"
              disabled={isLoadingState || isFormComplete}
              onClick={handleGenerateContent}
            >
              {isProcessingFile ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('generating')}</span>
                </div>
              ) : (
                t('populateData')
              )}
            </Button>
            {!formData.isPublic && (
              <Button 
                type="button" 
                variant="destructive"
                className="transition duration-200 ease-in-out"
                disabled={isLoadingState || isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span>{t('deleting')}</span>
                  </div>
                ) : (
                  t('deleteDraft')
                )}
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-indigo-600 text-white transition duration-200 ease-in-out hover:bg-indigo-700 min-w-[120px]"
              disabled={isLoadingState || isDeleting || !isFormComplete}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('saving')}</span>
                </div>
              ) : (
                t('saveChanges')
              )}
            </Button>
          </>
        ) : (
          <>
            <Button 
              type="button" 
              variant="outline" 
              className="transition duration-200 ease-in-out hover:bg-gray-100"
              disabled={isLoadingState || isFormComplete}
              onClick={handleGenerateContent}
            >
              {isProcessingFile ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('generating')}</span>
                </div>
              ) : (
                t('populateData')
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="transition duration-200 ease-in-out hover:bg-gray-100"
              disabled={isLoadingState}
              onClick={handleSaveDraft}
            >
              {t('saveAsDraft')}
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 text-white transition duration-200 ease-in-out hover:bg-indigo-700 min-w-[120px]"
              disabled={isLoadingState || !isFormComplete}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('creating')}</span>
                </div>
              ) : isProcessingFile ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>{t('processingFile')}</span>
                </div>
              ) : (
                t('createDictation')
              )}
            </Button>
          </>
        )}
      </div>
    </form>
  )
} 