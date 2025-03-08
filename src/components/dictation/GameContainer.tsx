'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairDisplay } from '@/components/dictation/WordPairDisplay'
import { useTranslations } from 'next-intl'
import { EyeIcon, EyeSlashIcon, PencilSquareIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const router = useRouter()
  const [hideExampleSentences, setHideExampleSentences] = useState(true)
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

  const handleStartWriterGame = () => {
    incrementPlayCount()
    router.push(`/dictation/play/${game.id}/writer-game?hideExamples=${hideExampleSentences.toString()}`)
  }

  const handleStartBubbleShooterGame = () => {
    incrementPlayCount()
    router.push(`/dictation/play/${game.id}/bubble-shooter?hideExamples=${hideExampleSentences.toString()}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">{game.title}</h1>
      <div className="flex justify-end mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setHideExampleSentences(prev => !prev)}
                aria-label={hideExampleSentences ? t('showExamples') : t('hideExamples')}
              >
                {hideExampleSentences ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hideExampleSentences ? t('showExamples') : t('hideExamples')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <WordPairDisplay 
        wordPairs={game.wordPairs} 
        hideSentences={hideExampleSentences}
        sourceLanguage={game.sourceLanguage}
        targetLanguage={game.targetLanguage}
      />
      
      <h2 className="text-xl my-8 text-center">{t('selectGameMode')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Button 
          onClick={handleStartWriterGame}
          variant="outline"
          className="p-6 h-auto flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-indigo-300 transition-all"
        >
          <PencilSquareIcon className="h-12 w-12 text-indigo-600" />
          <div className="text-lg font-semibold">Writer Mode</div>
          <p className="text-gray-600 text-center text-sm">
            Type the correct translation for each word
          </p>
        </Button>
        
        <Button 
          onClick={handleStartBubbleShooterGame}
          variant="outline"
          className="p-6 h-auto flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-indigo-300 transition-all"
        >
          <PuzzlePieceIcon className="h-12 w-12 text-indigo-600" />
          <div className="text-lg font-semibold">Bubble Shooter</div>
          <p className="text-gray-600 text-center text-sm">
            Match word translations by shooting bubbles
          </p>
        </Button>
      </div>
    </div>
  )
} 