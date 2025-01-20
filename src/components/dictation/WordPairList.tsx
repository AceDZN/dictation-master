'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WordPair } from "@/lib/types"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { FileUpload } from "./FileUpload"
import { useState } from "react"
import type { WordPairsList } from "@/lib/openai"

interface WordPairListProps {
  wordPairs: WordPair[]
  onChange: (wordPairs: WordPair[]) => void
  sourceLanguage: string
  targetLanguage: string
  error?: string
  disabled?: boolean
  onFileUploadStart?: () => void
  onFileUploadComplete?: (data: WordPairsList) => void
  onFileUploadError?: (error: string) => void
}

export function WordPairList({
  wordPairs,
  onChange,
  sourceLanguage,
  targetLanguage,
  error: formError,
  disabled,
  onFileUploadStart,
  onFileUploadComplete,
  onFileUploadError
}: WordPairListProps) {
  const [fileError, setFileError] = useState<string>()

  const addWordPair = () => {
    onChange([...wordPairs, { first: '', second: '', sentence: '' }])
  }

  const removeWordPair = (index: number) => {
    onChange(wordPairs.filter((_, i) => i !== index))
  }

  const updateWordPair = (index: number, field: keyof WordPair, value: string) => {
    const newPairs = [...wordPairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    onChange(newPairs)
  }

  const handleFileUpload = (data: WordPairsList) => {
    setFileError(undefined)
    onChange(data.wordPairs)
    onFileUploadComplete?.(data)
  }

  const handleFileError = (error: string) => {
    setFileError(error)
    onFileUploadError?.(error)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Word Pairs</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addWordPair}
          disabled={wordPairs.length >= 50 || disabled}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Word Pair
        </Button>
      </div>

      {formError && <p className="text-sm text-red-500">{formError}</p>}

      <div className="space-y-4">
        {/* File Upload Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Bulk Upload Word Pairs
          </h3>
          <FileUpload 
            onUpload={handleFileUpload}
            onError={handleFileError}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            disabled={disabled}
            onUploadStart={onFileUploadStart}
          />
          {fileError && (
            <p className="mt-2 text-sm text-red-500">{fileError}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Upload a CSV, TXT, or image file with word pairs. For text files, format: source_word,target_word,example_sentence (optional)
          </p>
        </div>

        {/* Manual Entry Section */}
        <div className="space-y-4">
          {wordPairs.map((pair, index) => (
            <div key={index} className="grid gap-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`word-${index}-first`}>
                    {sourceLanguage} Word
                  </Label>
                  <Input
                    id={`word-${index}-first`}
                    value={pair.first}
                    onChange={e => updateWordPair(index, 'first', e.target.value)}
                    maxLength={50}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`word-${index}-second`}>
                    {targetLanguage} Word
                  </Label>
                  <Input
                    id={`word-${index}-second`}
                    value={pair.second}
                    onChange={e => updateWordPair(index, 'second', e.target.value)}
                    maxLength={50}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`word-${index}-sentence`}>
                  Example Sentence (Optional)
                </Label>
                <Textarea
                  id={`word-${index}-sentence`}
                  value={pair.sentence}
                  onChange={e => updateWordPair(index, 'sentence', e.target.value)}
                  maxLength={200}
                  disabled={disabled}
                />
              </div>
              {wordPairs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-self-end text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeWordPair(index)}
                  disabled={disabled}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 