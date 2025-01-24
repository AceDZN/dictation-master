'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { Input } from '@/components/ui/input'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { useAnimate } from 'framer-motion'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'

interface GameViewProps {
  game: DictationGame
  onGameEnd: () => void
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
}

export function GameView({ game, onGameEnd }: GameViewProps) {
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
    completedWords: 0
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
      completedWords: 0
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


  const handleCorrectAnswer = useCallback(() => {
    setInputStatus('correct')
    setHasInputChanged(false)
    confettiController.current?.shoot()
    
    // Pause the timer immediately
    setGameState(prev => ({ ...prev, isPaused: true, completedWords: prev.completedWords + 1 }))

    // Move to next word after a longer delay
    setTimeout(() => {
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
          isPaused: false
        }))
        setInput('')
        setInputStatus('default')
      }
    }, 1000) // Increased from 500ms to 1000ms
  }, [endGame,gameState.currentWordIndex, game.wordPairs.length, game.quizParameters.activityTimeLimit])

  const animateHeartLoss = useCallback(() => {
    if (!heartsContainerRef.current) return

    // Create a falling heart element
    const fallingHeart = document.createElement('div')
    fallingHeart.innerHTML = '❤️'
    fallingHeart.className = 'absolute text-4xl leading-none pointer-events-none z-10 origin-center'
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

  const handleIncorrectAnswer = useCallback((isTimeOut: boolean = false) => {
    setInputStatus('incorrect')
    const newHearts = gameState.hearts - 1
    const newFails = gameState.fails + 1
    
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
  }, [endGame, animateHeartLoss,gameState.hearts, gameState.fails,  game.quizParameters.activityTimeLimit])


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
      <h1 className="text-md mb-12 text-center text-gray-300">{game.title}</h1>
      
      {/* Game Header */}
      <div className="flex justify-between items-center mb-12 relative  text-lg font-bold">
        {/* Hearts Container */}
        <div ref={heartsContainerRef} className="relative flex items-center gap-2 ">
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
            <div className=" font-mono mt-2">
              {formatTime(gameState.timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* Word Display */}
      <div className="text-center mb-12 w-full min-h-[50vh] flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center h-auto">
            <div className="text-6xl font-bold mb-12 text-indigo-600">
                {getCurrentWord().first}
            </div>
            <div className="flex justify-center items-center">
            <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
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
            </div>
            <div className="text-xl  text-gray-600 mt-20">
                {getCurrentWord().sentence}
            </div>
        </div>
      </div>
      
    </div>
  )
} 