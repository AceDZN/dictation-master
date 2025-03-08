// src/components/dictation/WordPairDisplay.tsx
import { WordPair } from "@/lib/types"

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
            <div>{pair.first}</div>
            <div>{pair.second}</div>
            {!hideSentences && pair.sentence && (
              <div className="col-span-2 text-sm text-gray-600 mt-2">
                {pair.sentence}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 