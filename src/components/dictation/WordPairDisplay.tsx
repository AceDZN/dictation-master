// src/components/dictation/WordPairDisplay.tsx
import { WordPair } from "@/lib/types"
import { getFirstSentence, getSecondSentence } from '@/lib/language-direction'

interface WordPairDisplayProps {
  wordPairs: WordPair[]
  sourceLanguage: string
  targetLanguage: string
  hideSentences?: boolean
}

const isRTL = (language: string): boolean => {
  const rtlLanguages = ['hebrew', 'he', 'iw', 'arabic', 'ar']
  return rtlLanguages.includes(language.toLowerCase())
}

export function WordPairDisplay({ 
  wordPairs,
  sourceLanguage,
  targetLanguage,
  hideSentences = false
}: WordPairDisplayProps) {
  const sourceIsRTL = isRTL(sourceLanguage)
  const targetIsRTL = isRTL(targetLanguage)

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 font-semibold text-xs sm:text-sm">
        <div className="text-gray-700" dir={sourceIsRTL ? 'rtl' : 'ltr'}>{sourceLanguage}</div>
        <div className="text-gray-700" dir={targetIsRTL ? 'rtl' : 'ltr'}>{targetLanguage}</div>
      </div>
      <div className="divide-y divide-gray-200">
        {wordPairs.map((pair, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors">
            <div className="min-w-0" dir={sourceIsRTL ? 'rtl' : 'ltr'}>
              <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{pair.first}</p>
              {!hideSentences && getFirstSentence(pair) && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 break-words">
                  {getFirstSentence(pair)}
                </p>
              )}
            </div>
            <div className="min-w-0" dir={targetIsRTL ? 'rtl' : 'ltr'}>
              <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{pair.second}</p>
              {!hideSentences && getSecondSentence(pair) && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 break-words">
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