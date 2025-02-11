'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { Input } from '@/components/ui/input'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { useAnimate } from 'motion/react'
import { ClockIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button'

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
    currentWordGuesses: 0
  })
  const [input, setInput] = useState('')
  const [inputStatus, setInputStatus] = useState<'default' | 'correct' | 'incorrect'>('default')
  const [hasInputChanged, setHasInputChanged] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiController = useRef<any>(null)
  const heartsContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line 
  const [scope, animate] = useAnimate()

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))
  }, [])

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
      currentWordGuesses: 0
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
  }, [ getCurrentWord, moveToNextWord])

  const animateHeartLoss = useCallback(() => {
    if (!heartsContainerRef.current) return

    // Create a falling heart element
    const fallingHeart = document.createElement('div')
    fallingHeart.innerHTML = '❤️'
    fallingHeart.className = 'absolute text-lg leading-none pointer-events-none z-10 origin-center'
    fallingHeart.style.willChange = 'transform, opacity'

    // Get the heart element position
    const heartElement = heartsContainerRef.current.querySelector('.heart')
    if (!heartElement) return

    const heartRect = heartElement.getBoundingClientRect()
    const containerRect = heartsContainerRef.current.getBoundingClientRect()

    // Add the falling heart to the container
    heartsContainerRef.current.appendChild(fallingHeart)

    // Position the falling heart exactly over the heart display
    fallingHeart.style.left = `${heartRect.left - containerRect.left}px`
    fallingHeart.style.top = `${heartRect.top - containerRect.top}px`

    // Animate the falling heart
    animate([
      [
        fallingHeart,
        {
          transform: [
            'translate(0, 0) rotate(0deg) scale(1)',
            `translate(${Math.random() * 100 - 50}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg) scale(0.5)`
          ],
          opacity: [1, 0]
        },
        {
          duration: 5,
          ease: [0.23, 1, 0.32, 1], // Cubic bezier for natural falling motion
          onComplete: () => fallingHeart.remove()
        }
      ]
    ])
  }, [animate])

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
      animateHeartLoss()
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
  }, [endGame, animateHeartLoss, gameState.hearts, gameState.fails, gameState.currentWordGuesses, game.quizParameters.activityTimeLimit])


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


  if (gameState.isGameOver) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-6 text-indigo-600">{t('gameOver')}</h2>
        <div className="space-y-6 grid ">
          <div className="text-6xl mb-6">
            <div className="flex items-center justify-center gap-4">
              <span className={`text-6xl transition-all ${gameState.stars >= 1 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
              <span className={`text-8xl transition-all ${gameState.stars === 3 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
              <span className={`text-6xl transition-all ${gameState.stars >= 2 ? 'text-yellow-400' : 'text-gray-300 [filter:grayscale(100%)]'}`}>⭐</span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 text-xl" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <p className="flex justify-end items-center	text-3xl">❤️</p>
              <p className="flex justify-start items-center	">{gameState.hearts}</p>
            </div>
            <div className="grid gap-4 text-xl" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <p className="flex justify-end items-center	"><ClockIcon className="h-8 w-8" /></p>
              <p className="flex justify-start items-center	">{formatTime(gameState.totalTime)}</p>
            </div>
            <div className="grid gap-4 text-xl" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
              <p className="justify-end items-center	flex">{gameState.fails}</p>
              <p className="text-center items-center flex">/</p>
              <p className="justify-start items-center flex">{gameState.completedWords}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-row gap-4 justify-center items-center">
            <button
              onClick={restartGame}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg"
            >
              {t('playAgain')}
            </button>
            <button
              onClick={onGameEnd}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-gray-700 transform hover:scale-105 transition-all shadow-lg"
            >
              {t('exit')}
            </button>
          </div>
        </div>
      </div>
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
      
      {/* Game Header */}
      <div className="flex justify-between items-center mb-12 relative text-lg font-bold">
        {/* Hearts Container */}
        <div ref={heartsContainerRef} className="relative flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="heart animate-pulse">❤️</span>
            <span className="heart-count">{gameState.hearts}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="">
          {gameState.currentWordIndex}/{game.wordPairs.length}
        </div>

        {/* Timer */}
        {game.quizParameters.activityTimeLimit > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(gameState.timeLeft / game.quizParameters.activityTimeLimit) * 100}%`,
                  backgroundColor: gameState.timeLeft <= 5 ? '#ef4444' : undefined
                }}
              />
            </div>
            <div className="font-mono mt-2">
              {formatTime(gameState.timeLeft)}
            </div>
          </div>
        )}

      </div>

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