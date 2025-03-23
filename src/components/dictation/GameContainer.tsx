'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairDisplay } from '@/components/dictation/WordPairDisplay'
import { useTranslations } from 'next-intl'
import { BoltIcon, EyeIcon, EyeSlashIcon,PencilIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"


interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const router = useRouter()
  const [hideExampleSentences, setHideExampleSentences] = useState(true)
  const t = useTranslations('Dictation.game')


  const handleWriterGameStart = () => {
    router.push(`/dictation/play/${game.id}/writer-game?hideExamples=${hideExampleSentences.toString()}`)
  }

  const handleQuizGameStart = () => {
    router.push(`/dictation/play/${game.id}/quiz-game?hideExamples=${hideExampleSentences.toString()}`)
  }

  const handleArcheryGameStart = () => {
    router.push(`/dictation/play/${game.id}/archery-game?hideExamples=${hideExampleSentences.toString()}`)
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
                label={hideExampleSentences ? t('showExamples') : t('hideExamples')}
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
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-full mx-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg"
                onClick={handleWriterGameStart}
                className="px-8 flex items-center"
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                {t('startWriterGame')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('writerGameDescription')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg"
                onClick={handleQuizGameStart}
                className="px-8 flex items-center"
                
              >
                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                {t('startQuizGame')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('quizGameDescription')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="lg"
                onClick={handleArcheryGameStart}
                className="px-8 flex items-center"
                
              >
                <BoltIcon className="w-5 h-5 mr-2" />
                {t('startArcheryGame')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('archeryGameDescription')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 