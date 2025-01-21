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
  sourceLanguage: string
  targetLanguage: string
  hideSentences?: boolean
}

export function WordPairList({ 
  wordPairs,
  sourceLanguage,
  targetLanguage,
  hideSentences = false
}: WordPairListProps) {
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