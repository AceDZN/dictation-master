'use client'

import { useState, useEffect, useRef } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { Input } from '@/components/ui/input'
import confetti from 'react-canvas-confetti'

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
  const inputRef = useRef<HTMLInputElement>(null)

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit) return

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) {
          handleIncorrectAnswer()
          return {
            ...prev,
            timeLeft: game.quizParameters.activityTimeLimit,
            fails: prev.fails + 1
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameOver, game.quizParameters.activityTimeLimit])

  // Auto-focus effect
  useEffect(() => {
    if (!gameState.isGameOver) {
      inputRef.current?.focus()
    }
  }, [gameState.currentWordIndex, gameState.isGameOver])

  const getCurrentWord = (): WordPair => game.wordPairs[gameState.currentWordIndex]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    // Check if the answer is correct on change
    if (value.toLowerCase().trim() === getCurrentWord().second.toLowerCase().trim()) {
      handleCorrectAnswer()
    }
  }

  const handleInputBlur = () => {
    if (!gameState.isGameOver) {
      validateAnswer()
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAnswer()
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
    triggerConfetti()

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

  const handleIncorrectAnswer = () => {
    setInputStatus('incorrect')
    const newHearts = gameState.hearts - 1
    const newFails = gameState.fails + 1
    
    // Calculate stars based on fails
    let newStars = 3
    if (newFails >= 5) newStars = 1
    else if (newFails >= 3) newStars = 2

    setGameState(prev => ({
      ...prev,
      hearts: newHearts,
      fails: newFails,
      stars: newStars
    }))

    if (newHearts <= 0) {
      endGame()
    } else {
      // Reset input and refocus after a short delay
      setTimeout(() => {
        setInput('')
        setInputStatus('default')
        inputRef.current?.focus()
      }, 500)
    }
  }

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
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
  }

  if (gameState.isGameOver) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <div className="space-y-4">
          <div className="text-4xl mb-4">
            {'⭐'.repeat(gameState.stars)}
          </div>
          <p>Hearts remaining: {'❤️'.repeat(gameState.hearts)}</p>
          <p>Time: {gameState.totalTime} seconds</p>
          <p>Words completed: {gameState.currentWordIndex}/{game.wordPairs.length}</p>
          <div className="space-x-4">
            <button
              onClick={restartGame}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Play Again
            </button>
            <button
              onClick={onGameEnd}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          Progress: {gameState.currentWordIndex + 1}/{game.wordPairs.length}
        </div>
        <div>
          {'❤️'.repeat(gameState.hearts)}
        </div>
        {game.quizParameters.activityTimeLimit > 0 && (
          <div>
            Time: {gameState.timeLeft}s
          </div>
        )}
      </div>

      {/* Word Display */}
      <div className="text-center mb-8">
        <div className="text-2xl font-bold mb-4">
          {getCurrentWord().first}
        </div>
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={`text-center text-lg ${
            inputStatus === 'correct' ? 'bg-green-50 border-green-500' :
            inputStatus === 'incorrect' ? 'bg-red-50 border-red-500' :
            ''
          }`}
          placeholder={`Type the ${game.targetLanguage} word...`}
          autoComplete="off"
        />
      </div>
    </div>
  )
} 