'use client'

// DEPRECATED: This component has been replaced by WriterGameClient
// This file is kept for backward compatibility but should be removed in future updates

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { GameView } from '@/components/dictation/GameView'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

interface WriterGameContainerProps {
  game: DictationGame
}

export function WriterGameContainer({ game }: WriterGameContainerProps) {
  console.warn('WriterGameContainer is deprecated. Please use WriterGameClient instead.')
  
  const searchParams = useSearchParams()
  const hideExamplesParam = searchParams.get('hideExamples')
  const [hideExampleSentences, setHideExampleSentences] = useState(
    hideExamplesParam === 'true' || hideExamplesParam === null
  )
  const [showBackButton, setShowBackButton] = useState(true)
  const router = useRouter()
  const t = useTranslations('Dictation.game')

  // Hide back button after 5 seconds
  useEffect(() => {
    if (showBackButton) {
      const timer = setTimeout(() => {
        setShowBackButton(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showBackButton])

  const handleGameEnd = () => {
    router.push(`/dictation/play/${game.id}`)
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className="relative">
      {showBackButton && (
        <div className="absolute top-0 left-0 z-10 p-4 transition-opacity duration-300">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
            className="flex items-center gap-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('back')}
          </Button>
        </div>
      )}
      <GameView 
        game={game} 
        onGameEnd={handleGameEnd} 
        hideExampleSentences={hideExampleSentences}
        onToggleExampleSentences={() => setHideExampleSentences(prev => !prev)}
      />
    </div>
  )
} 