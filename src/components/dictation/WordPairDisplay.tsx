// src/components/dictation/WordPairDisplay.tsx
import { WordPair } from "@/lib/types"
import { getFirstSentence, getSecondSentence } from '@/lib/language-direction'

interface WordPairDisplayProps {
  wordPairs: WordPair[]
  sourceLanguage: string
  targetLanguage: string
  hideSentences?: boolean
}

export function WordPairDisplay({ 
  wordPairs,
  sourceLanguage,
  targetLanguage,
  hideSentences = false
}: WordPairDisplayProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 font-semibold">
        <div>{sourceLanguage}</div>
        <div>{targetLanguage}</div>
      </div>
      <div className="divide-y">
        {wordPairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 p-4">
            <div>
              <p className="font-medium text-gray-900">{pair.first}</p>
              {!hideSentences && getFirstSentence(pair) && (
                <p className="text-sm text-gray-600 mt-2">
                  {getFirstSentence(pair)}
                </p>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{pair.second}</p>
              {!hideSentences && getSecondSentence(pair) && (
                <p className="text-sm text-gray-600 mt-2">
                  {getSecondSentence(pair)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 