'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

interface GameViewProps {
  game: DictationGame
  onGameEnd: () => void
  hideExampleSentences: boolean
  onToggleExampleSentences: () => void
}

interface GameClientProps {
  game: DictationGame
  view: React.ComponentType<GameViewProps>
  onGameEnd?: () => void
}

export function GameClient({ game, view: View, onGameEnd }: GameClientProps) {
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
    if (onGameEnd) {
      onGameEnd()
    } else {
      router.push(`/dictation/play/${game.id}`)
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  const handleToggleExampleSentences = () => {
    setHideExampleSentences(prev => !prev)
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
      <View
        game={game}
        onGameEnd={handleGameEnd}
        hideExampleSentences={hideExampleSentences}
        onToggleExampleSentences={handleToggleExampleSentences}
      />
    </div>
  )
} 