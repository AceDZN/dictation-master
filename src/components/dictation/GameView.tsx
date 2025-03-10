// src/components/dictation/GameView.tsx
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { Input } from '@/components/ui/input'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { useAnimate } from 'motion/react'
import {  EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button'
import { GameOverView } from './GameOverView'
import { GameHeader, GameHeaderRef } from './GameHeader'
import { trackEvent } from '@/lib/posthog-utils'

interface GameViewProps {
  game: DictationGame
  onGameEnd: () => void
  hideExampleSentences?: boolean
  onToggleExampleSentences?: () => void
}

interface GameState {
  currentWordIndex: number
  hearts: number
  timeLeft: number
  gameStartTime: number
  totalTime: number
  isGameOver: boolean
  stars: number
  fails: number
  isPaused: boolean
  completedWords: number
  currentWordGuesses: number
  isStarted: boolean
  score: number
}

export function GameView({ 
  game, 
  onGameEnd,
  hideExampleSentences = false,
  onToggleExampleSentences
}: GameViewProps) {
  const t = useTranslations('Dictation.game')
  // Randomize word pairs on initial load
  const randomizedWordPairs = useMemo(() => {
    return [...game.wordPairs].sort(() => Math.random() - 0.5)
  }, [game.wordPairs])

  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    hearts: game.quizParameters.globalLivesLimit,
    timeLeft: game.quizParameters.activityTimeLimit,
    gameStartTime: Date.now(),
    totalTime: 0,
    isGameOver: false,
    stars: 3,
    fails: 0,
    isPaused: false,
    completedWords: 0,
    currentWordGuesses: 0,
    isStarted: false,
    score: 0
  })
  const [input, setInput] = useState('')
  const [inputStatus, setInputStatus] = useState<'default' | 'correct' | 'incorrect'>('default')
  const [hasInputChanged, setHasInputChanged] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiController = useRef<any>(null)
  const heartsContainerRef = useRef<HTMLDivElement>(null)
  const gameHeaderRef = useRef<GameHeaderRef>(null)
  // eslint-disable-next-line 
  const [scope, animate] = useAnimate()

  const endGame = useCallback((isWin: boolean = false) => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))
    trackEvent('game_over', {
      game_id: game.id,
      game_title: game.title,
      game_mode: 'writer',
      score: gameState.score,
      hearts_remaining: gameState.hearts,
      time_taken: game.quizParameters.activityTimeLimit - gameState.timeLeft,
      fails_count: gameState.fails,
      completed_words_count: gameState.currentWordIndex,
      total_words_count: game.wordPairs.length,
      is_win: isWin
    })
  }, [game, gameState])

  const handleConfettiInit = useCallback(({ conductor }: { conductor: any }) => {
    confettiController.current = conductor
  }, [])

  const restartGame = useCallback(() => {
    setGameState({
      currentWordIndex: 0,
      hearts: game.quizParameters.globalLivesLimit,
      timeLeft: game.quizParameters.activityTimeLimit,
      gameStartTime: Date.now(),
      totalTime: 0,
      isGameOver: false,
      stars: 3,
      fails: 0,
      isPaused: false,
      completedWords: 0,
      currentWordGuesses: 0,
      isStarted: false,
      score: 0
    })
    setInput('')
    setInputStatus('default')
    setHasInputChanged(false)
  }, [game.quizParameters.globalLivesLimit, game.quizParameters.activityTimeLimit])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const getCurrentWord = useCallback((): WordPair => randomizedWordPairs[gameState.currentWordIndex], [randomizedWordPairs, gameState.currentWordIndex])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    setHasInputChanged(true)

    // Check if the answer is correct on change
    if (value.toLowerCase().trim() === getCurrentWord().second.toLowerCase().trim()) {
      handleCorrectAnswer()
    }
  }

  const handleInputBlur = () => {
    if (!gameState.isGameOver && hasInputChanged) {
      validateAnswer()
      setHasInputChanged(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hasInputChanged) {
      validateAnswer()
      setHasInputChanged(false)
    }
  }


  // Extracted moveToNextWord logic into a separate function
  const moveToNextWord = useCallback(() => {
    const nextIndex = gameState.currentWordIndex + 1
    if (nextIndex >= game.wordPairs.length) {
      setTimeout(() => {
        endGame()
      }, 1000) // Add delay before game end
    } else {
      setGameState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        timeLeft: game.quizParameters.activityTimeLimit,
        isPaused: false,
        currentWordGuesses: 0
      }))
      setInput('')
      setInputStatus('default')
    }
  }, [endGame, gameState.currentWordIndex, game.wordPairs.length, game.quizParameters.activityTimeLimit])

  const handleCorrectAnswer = useCallback(() => {
    setInputStatus('correct')
    setHasInputChanged(false)
    confettiController.current?.shoot()
    
    // Pause the timer immediately
    setGameState(prev => ({ ...prev, isPaused: true, completedWords: prev.completedWords + 1 }))

    // Play audio if available and move to next word after completion
    const currentWord = getCurrentWord()
    if (currentWord.secondAudioUrl) {
      const audio = new Audio(currentWord.secondAudioUrl)
      audio.addEventListener('ended', () => {
        moveToNextWord()
      })
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        moveToNextWord() // Move to next word even if audio fails
      })
    } else {
      // If no audio, wait for a moment before moving to next word
      setTimeout(moveToNextWord, 1000)
    }

    trackEvent('answer_correct', {
      game_id: game.id,
      game_title: game.title,
      source_language: game.sourceLanguage,
      target_language: game.targetLanguage,
      game_mode: 'writer',
      word_index: gameState.currentWordIndex,
      word_first: currentWord.first,
      word_second: currentWord.second
    })
  }, [ getCurrentWord, moveToNextWord, game, gameState.currentWordIndex])

  const getHint = useCallback((word: string, guessCount: number) => {
    const revealed = word.slice(0, Math.min(guessCount + 1, word.length))
    const hidden = '_'.repeat(Math.max(0, word.length - revealed.length))
    return revealed + hidden
  }, [])

  const handleIncorrectAnswer = useCallback((isTimeOut: boolean = false) => {
    setInputStatus('incorrect')
    const newHearts = gameState.hearts - 1
    const newFails = gameState.fails + 1
    const newGuesses = gameState.currentWordGuesses + 1
    
    // Only animate heart loss if we still have hearts
    if (gameState.hearts > 0) {
      gameHeaderRef.current?.animateHeartLoss()
    }
    
    let newStars = 3
    if (newFails >= 5) newStars = 1
    else if (newFails >= 3) newStars = 2

    setGameState(prev => ({
      ...prev,
      hearts: newHearts,
      fails: newFails,
      stars: newStars,
      currentWordGuesses: newGuesses,
      timeLeft: isTimeOut ? game.quizParameters.activityTimeLimit : prev.timeLeft
    }))

    if (newHearts <= 0) {
      endGame()
    } else {
      setTimeout(() => {
        setInputStatus('default')
        inputRef.current?.focus()
      }, 500)
    }

    trackEvent('answer_incorrect', {
      game_id: game.id,
      game_title: game.title,
      source_language: game.sourceLanguage,
      target_language: game.targetLanguage,
      game_mode: 'writer',
      word_index: gameState.currentWordIndex,
      word_first: getCurrentWord().first,
      word_second: getCurrentWord().second,
      hearts_remaining: newHearts,
      time_left: gameState.timeLeft
    })
  }, [endGame, game, gameState, getCurrentWord])


  const validateAnswer = useCallback(() => {
    const isCorrect = input.toLowerCase().trim() === getCurrentWord().second.toLowerCase().trim()
    if (isCorrect) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer()
    }
  }, [input, getCurrentWord, handleCorrectAnswer, handleIncorrectAnswer])

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit || gameState.isPaused) return

    const timer = setInterval(() => {
      if (gameState.timeLeft <= 0) {
        handleIncorrectAnswer(true)
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [handleIncorrectAnswer, gameState.isGameOver, game.quizParameters.activityTimeLimit, gameState.timeLeft, gameState.isPaused])

  // Auto-focus effect
  useEffect(() => {
    if (!gameState.isGameOver) {
      inputRef.current?.focus()
    }
  }, [gameState.currentWordIndex, gameState.isGameOver])

  useEffect(() => {
    if (gameState.isStarted) {
      trackEvent('play_started', {
        game_id: game.id,
        game_title: game.title,
        source_language: game.sourceLanguage,
        target_language: game.targetLanguage,
        game_mode: 'writer'
      })
    }
  }, [gameState.isStarted, game])

  if (gameState.isGameOver) {
    return (
      <GameOverView 
        stars={gameState.stars}
        hearts={gameState.hearts}
        totalTime={gameState.totalTime}
        fails={gameState.fails}
        completedWords={gameState.completedWords}
        onPlayAgain={restartGame}
        onExit={onGameEnd}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <Realistic onInit={handleConfettiInit} />
      <h1 className="text-md mb-12 text-center text-gray-300 relative">
        {game.title}

        {/* Example Sentences Toggle */}
        {onToggleExampleSentences && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExampleSentences}
            className="absolute right-0 top-1/2 -translate-y-1/2"
            title={hideExampleSentences ? t('showExamples') : t('hideExamples')}
          >
            {hideExampleSentences ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </Button>
        )}
      </h1>
      
      <GameHeader 
        ref={gameHeaderRef}
        hearts={gameState.hearts}
        currentWordIndex={gameState.currentWordIndex}
        totalWords={game.wordPairs.length}
        timeLeft={gameState.timeLeft}
        timeLimit={game.quizParameters.activityTimeLimit}
        formatTime={formatTime}
        heartsContainerRef={heartsContainerRef}
      />

      <div className="text-center mb-12 w-full min-h-[50vh] flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center h-auto">
          <div className="text-6xl font-bold mb-12 text-indigo-600">
            {getCurrentWord().first}
          </div>
          <div className="flex justify-center items-center">
            <div className="flex flex-col justify-center items-center relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                maxLength={getCurrentWord().second.length}
                className={`text-center text-xl md:text-4xl font-bold p-6 rounded-xl border-2 shadow-lg h-fit w-auto transition-all duration-300 ease-in-out transform preserve-3d hover:scale-105 focus:scale-105 ${
                  inputStatus === 'correct' ? 'bg-green-50 border-green-500 scale-105' :
                  inputStatus === 'incorrect' ? 'bg-red-50 border-red-500 shake' :
                  'border-indigo-200 hover:border-indigo-400 focus:border-indigo-600'
                }`}
                autoComplete="off"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'perspective(1000px) rotateX(2deg)',
                }}
              />
              {gameState.currentWordGuesses > 0 && inputStatus !== 'correct' && (
                <TooltipProvider>
                  <Tooltip open={true}>
                    <TooltipTrigger asChild>
                      <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-1 h-1" />
                    </TooltipTrigger>
                    <TooltipContent 
                      className="bg-red-500 text-white font-mono text-lg px-4 py-2 shadow-lg relative overflow-visible"
                      sideOffset={16}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-red-500" />
                      {getHint(getCurrentWord().second, gameState.currentWordGuesses - 1)}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className={`example-sentence text-xl text-gray-600 mt-20 transition-opacity duration-300 ${hideExampleSentences ? 'opacity-0' : 'opacity-100'}`}>
            {getCurrentWord().sentence}
          </div>
        </div>
      </div>
    </div>
  )
} 