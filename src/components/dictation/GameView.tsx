'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { Input } from '@/components/ui/input'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { animate, useAnimate } from 'motion/react'

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
}

export function GameView({ game, onGameEnd }: GameViewProps) {
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
    fails: 0
  })
  const [input, setInput] = useState('')
  const [inputStatus, setInputStatus] = useState<'default' | 'correct' | 'incorrect'>('default')
  const [hasInputChanged, setHasInputChanged] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const confettiController = useRef<any>(null)
  const heartsContainerRef = useRef<HTMLDivElement>(null)
  const [scope, animate] = useAnimate()

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit) return

    const timer = setInterval(() => {
      if (gameState.timeLeft <= 0) {
        handleIncorrectAnswer(true)
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameOver, game.quizParameters.activityTimeLimit, gameState.timeLeft])

  // Auto-focus effect
  useEffect(() => {
    if (!gameState.isGameOver) {
      inputRef.current?.focus()
    }
  }, [gameState.currentWordIndex, gameState.isGameOver])

  const getCurrentWord = (): WordPair => randomizedWordPairs[gameState.currentWordIndex]

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

  const validateAnswer = () => {
    const isCorrect = input.toLowerCase().trim() === getCurrentWord().second.toLowerCase().trim()
    if (isCorrect) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer()
    }
  }

  const handleCorrectAnswer = () => {
    setInputStatus('correct')
    setHasInputChanged(false)
    confettiController.current?.shoot()

    // Move to next word after a short delay
    setTimeout(() => {
      const nextIndex = gameState.currentWordIndex + 1
      if (nextIndex >= game.wordPairs.length) {
        endGame()
      } else {
        setGameState(prev => ({
          ...prev,
          currentWordIndex: nextIndex,
          timeLeft: game.quizParameters.activityTimeLimit
        }))
        setInput('')
        setInputStatus('default')
      }
    }, 500)
  }

  const animateHeartLoss = () => {
    if (!heartsContainerRef.current) return

    // Create a falling heart element
    const fallingHeart = document.createElement('div')
    fallingHeart.innerHTML = '❤️'
    fallingHeart.className = 'falling-heart'

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
  }

  const handleIncorrectAnswer = (isTimeOut: boolean = false) => {
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
      if (isTimeOut) {
        setTimeout(() => {
          setInput('')
          setInputStatus('default')
          inputRef.current?.focus()
        }, 500)
      } else {
        setTimeout(() => {
          setInputStatus('default')
          inputRef.current?.focus()
        }, 500)
      }
    }
  }

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))
  }

  const handleConfettiInit = ({ conductor }: { conductor: any }) => {
    confettiController.current = conductor
  }

  const restartGame = () => {
    setGameState({
      currentWordIndex: 0,
      hearts: game.quizParameters.globalLivesLimit,
      timeLeft: game.quizParameters.activityTimeLimit,
      gameStartTime: Date.now(),
      totalTime: 0,
      isGameOver: false,
      stars: 3,
      fails: 0
    })
    setInput('')
    setInputStatus('default')
    setHasInputChanged(false)
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (gameState.isGameOver) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-2xl">
        <h2 className="text-4xl font-bold mb-6 text-indigo-600">Game Over!</h2>
        <div className="space-y-6">
          <div className="text-6xl mb-6 animate-bounce">
            {'⭐'.repeat(gameState.stars)}
          </div>
          <p className="text-xl">Hearts remaining: {'❤️'.repeat(gameState.hearts)}</p>
          <p className="text-xl">Time: {gameState.totalTime} seconds</p>
          <p className="text-xl">Words completed: {gameState.currentWordIndex + 1}/{game.wordPairs.length}</p>
          <div className="space-x-6 mt-8">
            <button
              onClick={restartGame}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Play Again
            </button>
            <button
              onClick={onGameEnd}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-gray-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Realistic onInit={handleConfettiInit} />
      
      {/* Game Header */}
      <div className="flex justify-between items-center mb-12 relative">
        {/* Hearts Container */}
        <div ref={heartsContainerRef} className="hearts-container">
          <div className="heart-display">
            <span className="heart">❤️</span>
            <span className="heart-count">{gameState.hearts}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-lg font-bold">
          {gameState.currentWordIndex}/{game.wordPairs.length}
        </div>

        {/* Timer */}
        {game.quizParameters.activityTimeLimit > 0 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="text-2xl font-bold font-mono mb-2">
              {formatTime(gameState.timeLeft)}
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${(gameState.timeLeft / game.quizParameters.activityTimeLimit) * 100}%`,
                  backgroundColor: gameState.timeLeft <= 5 ? '#ef4444' : undefined
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Word Display */}
      <div className="text-center mb-12">
        <div className="text-5xl font-bold mb-8 text-indigo-600 animate-pulse">
          {getCurrentWord().first}
        </div>
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={`text-center text-2xl p-6 rounded-xl border-2 shadow-lg transform transition-all duration-200 ${
            inputStatus === 'correct' ? 'bg-green-50 border-green-500 scale-105' :
            inputStatus === 'incorrect' ? 'bg-red-50 border-red-500 shake' :
            'hover:scale-105 focus:scale-105 border-indigo-200 hover:border-indigo-400 focus:border-indigo-600'
          }`}
          autoComplete="off"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'perspective(1000px) rotateX(2deg)',
          }}
        />
      </div>
    </div>
  )
} 