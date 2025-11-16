'use client'

import { incrementPlayCount } from '@/app/dictation/play/[id]/helpers'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

interface GameOverViewProps {
  gameId: string
  stars: number
  hearts?: number
  totalTime: number
  fails?: number
  completedWords: number
  totalWords?: number
  onPlayAgain: () => void
  onExit: () => void
}

/**
 * GameOverView - Reusable component for displaying the game over screen
 * Shows star rating, hearts remaining, time spent, and score
 */
export function GameOverView({
  gameId,
  stars,
  hearts = 0,
  totalTime,
  fails = 0,
  completedWords,
  totalWords,
  onPlayAgain,
  onExit
}: GameOverViewProps) {
  const t = useTranslations('Dictation.game')

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  useEffect(() => {
    if (!gameId) return
    incrementPlayCount(gameId)
  }, [gameId])

  return (
    <div className="max-w-md mx-auto text-center p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-2xl">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-indigo-600">{t('gameOver')}</h2>
      <div className="space-y-4 sm:space-y-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
            <span className={`text-4xl sm:text-5xl md:text-6xl transition-all ${stars >= 1 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
            <span className={`text-5xl sm:text-6xl md:text-8xl transition-all ${stars === 3 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
            <span className={`text-4xl sm:text-5xl md:text-6xl transition-all ${stars >= 2 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="grid gap-2 sm:gap-4 text-base sm:text-lg md:text-xl" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <p className="flex justify-end items-center text-xl sm:text-2xl md:text-3xl">❤️</p>
            <p className="flex justify-start items-center">{hearts}</p>
          </div>
          <div className="grid gap-2 sm:gap-4 text-base sm:text-lg md:text-xl" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <p className="flex justify-end items-center"><ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" /></p>
            <p className="flex justify-start items-center">{formatTime(totalTime)}</p>
          </div>
          <div className="grid gap-2 sm:gap-4 text-base sm:text-lg md:text-xl" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
            <p className="justify-end items-center flex">{fails}</p>
            <p className="text-center items-center flex">/</p>
            <p className="justify-start items-center flex">
              {totalWords ? `${completedWords}/${totalWords}` : completedWords}
            </p>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <button
            onClick={onPlayAgain}
            className="bg-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg w-full sm:w-auto"
          >
            {t('playAgain')}
          </button>
          <button
            onClick={onExit}
            className="bg-gray-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-700 transform hover:scale-105 transition-all shadow-lg w-full sm:w-auto"
          >
            {t('exit')}
          </button>
        </div>
      </div>
    </div>
  )
} 