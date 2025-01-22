'use client'

import { useState } from 'react'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairDisplay } from '@/components/dictation/WordPairDisplay'
import { GameView } from '@/components/dictation/GameView'

interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const [isGameStarted, setIsGameStarted] = useState(false)

  if (!isGameStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">{game.title}</h1>
        <WordPairDisplay 
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