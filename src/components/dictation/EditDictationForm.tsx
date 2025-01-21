'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { LanguageSelector } from "@/components/dictation/LanguageSelector"
import { WordPairList } from "@/components/dictation/WordPairList"
import { AdvancedQuizOptions } from "./AdvancedQuizOptions"
import { useState, useEffect } from "react"
import type { DictationGame } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface EditDictationFormProps {
  id: string
}

export function EditDictationForm({ id }: EditDictationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<DictationGame | null>(null)
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDictation() {
      try {
        const response = await fetch(`/api/dictation/edit/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dictation')
        }
        const data = await response.json()
        setFormData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dictation')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDictation()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setIsSubmitting(true)
    setError(undefined)
    
    try {
      const response = await fetch(`/api/dictation/edit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update dictation')
      }

      router.push('/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded">
        No dictation found
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow-md rounded-lg p-6">
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
            disabled={isSubmitting}
            className="transition duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description ?? ''}
            onChange={e => setFormData({ ...formData, description: e.target.value || undefined })}
            placeholder="Enter game description"
            maxLength={200}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          <LanguageSelector
            id="target-language"
            label="Target Language"
            value={formData.targetLanguage}
            onChange={value => setFormData({ ...formData, targetLanguage: value })}
            excludeLanguage={formData.sourceLanguage}
            disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>

      {/* Advanced Quiz Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-indigo-600">Advanced Options</h2>
        <AdvancedQuizOptions
          value={formData.quizParameters}
          onChange={quizParameters => setFormData({ ...formData, quizParameters })}
          disabled={isSubmitting}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          className="transition duration-200 ease-in-out hover:bg-gray-100"
          onClick={() => router.push('/profile')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 text-white transition duration-200 ease-in-out hover:bg-indigo-700 min-w-[120px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
} 