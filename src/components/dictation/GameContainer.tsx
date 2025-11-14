'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DictationGame } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { WordPairDisplay } from '@/components/dictation/WordPairDisplay'
import { useTranslations } from 'next-intl'
import { BoltIcon, EyeIcon, EyeSlashIcon, PencilIcon, QuestionMarkCircleIcon, ArrowPathIcon, RectangleStackIcon } from '@heroicons/react/24/outline'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { getDirectedGame, type LanguageDirection } from '@/lib/language-direction'


interface GameContainerProps {
  game: DictationGame
}

export function GameContainer({ game }: GameContainerProps) {
  const router = useRouter()
  const [hideExampleSentences, setHideExampleSentences] = useState(true)
  const [shuffleWords, setShuffleWords] = useState(true)
  const [languageDirection, setLanguageDirection] = useState<LanguageDirection>('forward')
  const t = useTranslations('Dictation.game')
  const activeGame = useMemo(
    () => getDirectedGame(game, languageDirection),
    [game, languageDirection]
  )

  const buildGameUrl = (variant: 'writer-game' | 'quiz-game' | 'archery-game' | 'practice-cards') => {
    const directionParam = `direction=${languageDirection}`
    const hideParam = `hideExamples=${hideExampleSentences.toString()}`
    const shuffleParam = `shuffle=${shuffleWords.toString()}`
    return `/dictation/play/${game.id}/${variant}?${directionParam}&${hideParam}&${shuffleParam}`
  }

  const handleWriterGameStart = () => {
    router.push(buildGameUrl('writer-game'))
  }

  const handleQuizGameStart = () => {
    router.push(buildGameUrl('quiz-game'))
  }

  const handleArcheryGameStart = () => {
    router.push(buildGameUrl('archery-game'))
  }

  const handleCardsGameStart = () => {
    router.push(buildGameUrl('practice-cards'))
  }

  const forwardLabel = `${game.sourceLanguage} → ${game.targetLanguage}`
  const reverseLabel = `${game.targetLanguage} → ${game.sourceLanguage}`

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">{game.title}</h1>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">{t('languageDirectionLabel')}</p>
          <div className="mt-2 inline-flex rounded-full bg-gray-100 p-1">
            <Button
              type="button"
              size="sm"
              variant={languageDirection === 'forward' ? 'default' : 'ghost'}
              className="rounded-full px-4"
              onClick={() => setLanguageDirection('forward')}
            >
              {forwardLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={languageDirection === 'reverse' ? 'default' : 'ghost'}
              className="rounded-full px-4"
              onClick={() => setLanguageDirection('reverse')}
            >
              {reverseLabel}
            </Button>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShuffleWords(prev => !prev)}
                >
                  <ArrowPathIcon className={`h-5 w-5 ${shuffleWords ? 'text-indigo-600' : 'text-gray-400'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {shuffleWords ? t('disableShuffle') : t('enableShuffle')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
      </div>
      <WordPairDisplay
        wordPairs={activeGame.wordPairs}
        hideSentences={hideExampleSentences}
        sourceLanguage={activeGame.sourceLanguage}
        targetLanguage={activeGame.targetLanguage}
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-full mx-auto">
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="lg"
                onClick={handleCardsGameStart}
                className="px-8 flex items-center"

              >
                <RectangleStackIcon className="w-5 h-5 mr-2" />
                {t('startCardsGame')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('cardsGameDescription')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
} 