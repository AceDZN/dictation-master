'use client'

import { FC, useState } from 'react'
import { DictationGame } from '@/lib/types'
import { WriterGameView } from './WriterGameView'
import { BubbleShooterGameView } from './BubbleShooterGameView'
import { Button } from '@/components/ui/button'
import { 
  PencilSquareIcon, 
  PuzzlePieceIcon, 
  ChevronDoubleRightIcon 
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

export type GameMode = 'writer' | 'bubble-shooter'

interface GameModeSelectorProps {
  game: DictationGame
  onGameEnd: () => void
  initialMode?: GameMode
  hideExampleSentences?: boolean
  onToggleExampleSentences?: () => void
}

export const GameModeSelector: FC<GameModeSelectorProps> = ({
  game,
  onGameEnd,
  initialMode = 'writer',
  hideExampleSentences = false,
  onToggleExampleSentences
}) => {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode)
  const [isSelectingMode, setIsSelectingMode] = useState<boolean>(false)
  const t = useTranslations('Dictation.game')

  const renderGameMode = () => {
    switch (gameMode) {
      case 'writer':
        return (
          <WriterGameView
            game={game}
            onGameEnd={onGameEnd}
            hideExampleSentences={hideExampleSentences}
            onToggleExampleSentences={onToggleExampleSentences}
          />
        )
      case 'bubble-shooter':
        return (
          <BubbleShooterGameView
            game={game}
            onGameEnd={onGameEnd}
            hideExampleSentences={hideExampleSentences}
            onToggleExampleSentences={onToggleExampleSentences}
          />
        )
      default:
        return null
    }
  }

  if (isSelectingMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">{game.title}</h1>
        <h2 className="text-xl mb-8 text-center">{t('selectGameMode')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            onClick={() => {
              setGameMode('writer')
              setIsSelectingMode(false)
            }}
            variant="outline"
            className="p-8 h-auto flex flex-col items-center gap-4 hover:bg-gray-50 hover:border-indigo-300 transition-all"
          >
            <PencilSquareIcon className="h-16 w-16 text-indigo-600" />
            <div className="text-lg font-semibold">Writer Mode</div>
            <p className="text-gray-600 text-center">
              Type the correct translation for each word
            </p>
          </Button>
          
          <Button
            onClick={() => {
              setGameMode('bubble-shooter')
              setIsSelectingMode(false)
            }}
            variant="outline"
            className="p-8 h-auto flex flex-col items-center gap-4 hover:bg-gray-50 hover:border-indigo-300 transition-all"
          >
            <PuzzlePieceIcon className="h-16 w-16 text-indigo-600" />
            <div className="text-lg font-semibold">Bubble Shooter</div>
            <p className="text-gray-600 text-center">
              Match word translations by shooting bubbles
            </p>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Game Mode Switcher Button */}
      <div className="absolute top-2 left-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSelectingMode(true)}
          className="flex items-center gap-1"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
          {t('changeMode')}
        </Button>
      </div>
      
      {renderGameMode()}
    </div>
  )
} 