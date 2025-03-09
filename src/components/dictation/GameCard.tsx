// src/components/dictation/GameCard.tsx
import { GameCardClient } from '@/components/dictation/GameCardClient'

interface Game {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: Array<{
    first: string
    second: string
    sentence?: string
  }>
  createdAt: {
    _seconds: number
    _nanoseconds: number
    toDate?: () => Date
  }
  isPublic?: boolean
  playCount?: number
  userId?: string
}

export function GameCard({ 
  id, 
  title, 
  description, 
  sourceLanguage, 
  targetLanguage, 
  wordPairs, 
  createdAt,
  isPublic,
  playCount = 0,
  userId,
}: Game) {
  // Server component that delegates to client component for user-specific actions
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-md">
      <GameCardClient
        id={id}
        title={title}
        description={description}
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        wordPairs={wordPairs}
        createdAt={createdAt}
        isPublic={isPublic}
        playCount={playCount}
        userId={userId}
      />
    </div>
  )
} 