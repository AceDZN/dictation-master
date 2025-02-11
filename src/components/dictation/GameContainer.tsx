'use client'

import { useState } from 'react'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairDisplay } from '@/components/dictation/WordPairDisplay'
import { GameView } from '@/components/dictation/GameView'
import { useTranslations } from 'next-intl'

interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [hideExampleSentences, setHideExampleSentences] = useState(false)
  const t = useTranslations('Dictation.game')

  const incrementPlayCount = async () => {
    try {
      const response = await fetch(`/api/dictation/play/${game.id}`, {
        method: 'POST',
      })
      if (!response.ok) {
        console.error('Failed to increment play count')
      }
    } catch (error) {
      console.error('Error incrementing play count:', error)
    }
  }

  const handleGameStart = () => {
    incrementPlayCount()
    setIsGameStarted(true)
  }

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
            onClick={handleGameStart}
            className="px-8"
          >
            {t('startGame')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <GameView 
      game={game} 
      onGameEnd={() => setIsGameStarted(false)} 
      hideExampleSentences={hideExampleSentences}
      onToggleExampleSentences={() => setHideExampleSentences(prev => !prev)}
    />
  )
} 