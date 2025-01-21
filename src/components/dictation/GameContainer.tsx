'use client'

import { useState } from 'react'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairList } from '@/components/dictation/WordPairList'
import { GameView } from '@/components/dictation/GameView'

interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const [isGameStarted, setIsGameStarted] = useState(false)

  if (!isGameStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <WordPairList 
          wordPairs={game.wordPairs} 
          hideSentences 
          sourceLanguage={game.sourceLanguage}
          targetLanguage={game.targetLanguage}
        />
        <div className="mt-8 text-center">
          <Button 
            size="lg"
            onClick={() => setIsGameStarted(true)}
            className="px-8"
          >
            Start Game
          </Button>
        </div>
      </div>
    )
  }

  return <GameView game={game} onGameEnd={() => setIsGameStarted(false)} />
} 