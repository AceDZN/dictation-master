'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { QuizGameView } from './QuizGameView'

interface QuizGameClientProps {
  game: DictationGame
}

export function QuizGameClient({ game }: QuizGameClientProps) {
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
    router.push(`/dictation/play/${game.id}`)
  }

  const handleToggleExampleSentences = () => {
    setHideExampleSentences(!hideExampleSentences)
  }

  return (
    <div className="relative">
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-0 left-0 z-10"
          onClick={handleBackClick}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>
      )}
      <QuizGameView
        game={game}
        onGameEnd={handleGameEnd}
        hideExampleSentences={hideExampleSentences}
        onToggleExampleSentences={handleToggleExampleSentences}
      />
    </div>
  )
} 