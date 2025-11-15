'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { getSecondSentence } from '@/lib/language-direction'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { useAnimate } from 'motion/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { GameOverView } from './GameOverView'
import { GameHeader, GameHeaderRef } from './GameHeader'
import { trackEvent } from '@/lib/posthog-utils'
import { usePreferredVoice } from '@/hooks/use-preferred-voice'
import { useTTSPlayer } from '@/hooks/use-tts-player'

interface QuizGameViewProps {
  game: DictationGame
  onGameEnd: () => void
  hideExampleSentences?: boolean
  onToggleExampleSentences?: () => void
  shuffleWords?: boolean
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
  selectedOption: number | null
  mistakesOnCurrentWord: number
  isStarted: boolean
}

interface QuizOption {
  value: string
  isCorrect: boolean
}

export function QuizGameView({
  game,
  onGameEnd,
  hideExampleSentences = false,
  onToggleExampleSentences,
  shuffleWords = true
}: QuizGameViewProps) {
  const t = useTranslations('Dictation.game')
  if (!game.id) {
    throw new Error('Game ID is required')
  }

  // Randomize word pairs on initial load if shuffleWords is true
  const randomizedWordPairs = useMemo(() => {
    return shuffleWords
      ? [...game.wordPairs].sort(() => Math.random() - 0.5)
      : [...game.wordPairs]
  }, [game.wordPairs, shuffleWords])

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
    selectedOption: null,
    mistakesOnCurrentWord: 0,
    isStarted: false
  })

  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([])
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
  const confettiController = useRef<any>(null)
  const gameHeaderRef = useRef<GameHeaderRef>(null)
  // eslint-disable-next-line 
  const [scope, animate] = useAnimate()
  const { preferredVoiceId } = usePreferredVoice()

  const endGame = useCallback((isWin: boolean = false) => {
    trackEvent('game_over', {
      game_id: game.id,
      game_title: game.title,
      game_mode: 'quiz',
      score: gameState.stars,
      hearts_remaining: gameState.hearts,
      time_taken: game.quizParameters.activityTimeLimit - gameState.timeLeft,
      fails_count: gameState.fails,
      completed_words_count: gameState.currentWordIndex,
      total_words_count: game.wordPairs.length,
      is_win: isWin
    })
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))
  }, [game, gameState])

  const handleConfettiInit = useCallback(({ conductor }: { conductor: any }) => {
    confettiController.current = conductor
  }, [])
  const getCurrentWord = useCallback(
    (): WordPair => randomizedWordPairs[gameState.currentWordIndex],
    [randomizedWordPairs, gameState.currentWordIndex],
  )
  const currentWord = useMemo(() => getCurrentWord(), [getCurrentWord])
  const speakCurrentWord = useTTSPlayer({
    text: currentWord?.second,
    fallbackUrl: currentWord?.secondAudioUrl,
    voiceId: preferredVoiceId,
  })

  const generateOptions = useCallback(() => {
    const currentWord = getCurrentWord()
    const correctOption = { value: currentWord.second, isCorrect: true }

    // Generate wrong options from other word pairs, excluding any with the same translation
    const availableOptions = randomizedWordPairs
      .filter((pair, index) =>
        // Exclude current word index and any pairs with the same translation
        index !== gameState.currentWordIndex &&
        pair.second !== currentWord.second
      )
      .map(pair => pair.second)

    // Shuffle and take first 2
    const wrongOptions = [...availableOptions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(value => ({ value, isCorrect: false }))

    // Combine correct and wrong options, then shuffle
    const allOptions = [correctOption, ...wrongOptions].sort(() => Math.random() - 0.5)

    setQuizOptions(allOptions)
  }, [getCurrentWord, gameState.currentWordIndex, randomizedWordPairs, setQuizOptions])

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
      selectedOption: null,
      mistakesOnCurrentWord: 0,
      isStarted: true
    })
    setShowCorrectAnswer(false)
    generateOptions()
  }, [game, generateOptions])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])


  // Generate options when the current word changes
  useEffect(() => {
    generateOptions()
  }, [gameState.currentWordIndex, generateOptions])

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
        selectedOption: null,
        mistakesOnCurrentWord: 0
      }))
      setShowCorrectAnswer(false)
    }
  }, [endGame, gameState.currentWordIndex, game.wordPairs.length, game.quizParameters.activityTimeLimit])


  const playSecondAudio = useCallback(() => speakCurrentWord(), [speakCurrentWord])

  const handleOptionSelect = useCallback((optionIndex: number) => {
    const isCorrect = quizOptions[optionIndex].isCorrect

    setGameState(prev => ({
      ...prev,
      selectedOption: optionIndex,
      isPaused: true
    }))

    if (isCorrect) {
      trackEvent('answer_correct', {
        game_id: game.id,
        game_title: game.title,
        source_language: game.sourceLanguage,
        target_language: game.targetLanguage,
        game_mode: 'quiz',
        word_index: gameState.currentWordIndex,
        word_first: getCurrentWord().first,
        word_second: getCurrentWord().second
      })
      confettiController.current?.shoot()
      setGameState(prev => ({
        ...prev,
        completedWords: prev.completedWords + 1
      }))

      // Play audio if available and move to next word after completion
      playSecondAudio().then(() => {
        setShowCorrectAnswer(false)
        moveToNextWord()
      })
    } else {
      trackEvent('answer_incorrect', {
        game_id: game.id,
        game_title: game.title,
        source_language: game.sourceLanguage,
        target_language: game.targetLanguage,
        game_mode: 'quiz',
        word_index: gameState.currentWordIndex,
        word_first: getCurrentWord().first,
        word_second: getCurrentWord().second,
        hearts_remaining: gameState.hearts - 1,
        time_left: gameState.timeLeft
      })
      // Incorrect answer
      setGameState(prev => {
        const newMistakesOnCurrentWord = prev.mistakesOnCurrentWord + 1
        const newHearts = prev.hearts - 1
        const newFails = prev.fails + 1

        // Only animate heart loss if we still have hearts
        if (prev.hearts > 0) {
          gameHeaderRef.current?.animateHeartLoss()
        }

        let newStars = 3
        if (newFails >= 5) newStars = 1
        else if (newFails >= 3) newStars = 2

        // Store these values to use in the setTimeout
        const updatedHearts = newHearts
        const updatedMistakes = newMistakesOnCurrentWord

        // Use setTimeout to determine next steps
        setTimeout(() => {
          if (updatedHearts <= 0) { // If this was the last heart
            endGame()
          } else if (updatedMistakes >= 2) {
            // This is the second mistake on this word
            // Show correct answer and play audio before proceeding
            setShowCorrectAnswer(true)

            // Find the correct option index
            const correctOptionIndex = quizOptions.findIndex(option => option.isCorrect)

            // Set the correct option as selected
            setGameState(prevState => ({
              ...prevState,
              selectedOption: correctOptionIndex
            }))

            // Play the audio and then move to next word
            playSecondAudio().then(() => {
              setShowCorrectAnswer(false)
              moveToNextWord()
            })
          } else {
            // First mistake, reset selection and allow another try
            setGameState(prevState => ({
              ...prevState,
              selectedOption: null,
              isPaused: false
            }))
          }
        }, 1000)

        return {
          ...prev,
          hearts: newHearts,
          fails: newFails,
          stars: newStars,
          mistakesOnCurrentWord: newMistakesOnCurrentWord
        }
      })
    }
  }, [quizOptions, playSecondAudio, moveToNextWord, endGame, game, gameState, getCurrentWord])

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit || gameState.isPaused) return

    const timer = setInterval(() => {
      if (gameState.timeLeft <= 0) {
        // Handle timeout - count as wrong answer
        setGameState(prev => {
          const newMistakesOnCurrentWord = prev.mistakesOnCurrentWord + 1
          const newHearts = prev.hearts - 1
          const newFails = prev.fails + 1

          gameHeaderRef.current?.animateHeartLoss()

          let newStars = 3
          if (newFails >= 5) newStars = 1
          else if (newFails >= 3) newStars = 2

          // Store these values to use in the setTimeout
          const updatedHearts = newHearts
          const updatedMistakes = newMistakesOnCurrentWord

          // Use setTimeout to determine next steps
          setTimeout(() => {
            if (updatedHearts <= 0) { // If this was the last heart
              endGame()
            } else if (updatedMistakes >= 2) {
              // This is the second mistake on this word
              // Show correct answer and play audio before proceeding
              setShowCorrectAnswer(true)

              // Find the correct option index
              const correctOptionIndex = quizOptions.findIndex(option => option.isCorrect)

              // Set the correct option as selected
              setGameState(prevState => ({
                ...prevState,
                selectedOption: correctOptionIndex
              }))

              // Play the audio and then move to next word
              playSecondAudio().then(() => {
                setShowCorrectAnswer(false)
                moveToNextWord()
              })
            } else {
              // First mistake, reset the timer and allow another try
              setGameState(prevState => ({
                ...prevState,
                timeLeft: game.quizParameters.activityTimeLimit,
                isPaused: false
              }))
            }
          }, 1000)

          return {
            ...prev,
            isPaused: true,
            hearts: newHearts,
            fails: newFails,
            stars: newStars,
            mistakesOnCurrentWord: newMistakesOnCurrentWord
          }
        })
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [
    endGame,
    gameState.isGameOver,
    game.quizParameters.activityTimeLimit,
    gameState.timeLeft,
    gameState.isPaused,
    moveToNextWord,
    playSecondAudio,
    quizOptions
  ])

  useEffect(() => {
    if (gameState.isStarted) {
      trackEvent('play_started', {
        game_id: game.id,
        game_title: game.title,
        source_language: game.sourceLanguage,
        target_language: game.targetLanguage,
        game_mode: 'quiz'
      })
    }
  }, [gameState.isStarted, game])

  // If game is over, show the game over view
  if (gameState.isGameOver) {
    return (
      <GameOverView
        gameId={game.id}
        stars={gameState.stars}
        hearts={gameState.hearts}
        totalTime={gameState.totalTime}
        fails={gameState.fails}
        completedWords={gameState.completedWords}
        totalWords={game.wordPairs.length}
        onPlayAgain={restartGame}
        onExit={onGameEnd}
      />
    )
  }

  const progress = Math.round((gameState.currentWordIndex / game.wordPairs.length) * 100)

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-[70vh]">
      <Realistic onInit={handleConfettiInit} globalOptions={{ useWorker: true }} decorateOptions={() => ({
        particleCount: 10,
        spread: 70,
      })} />
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
        timeLeft={gameState.timeLeft}
        timeLimit={game.quizParameters.activityTimeLimit}
        progress={progress}
        formatTime={formatTime}
      />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center w-full mx-auto">

          <div className="mb-8 text-center">
            <div className="text-6xl font-bold mb-12 text-indigo-600">
              {currentWord.first}
            </div>
          </div>

          <div className="w-full space-y-4 mb-8 flex flex-col items-center justify-center">
            {quizOptions.map((option, index) => (
              <Button
                key={index}
                className={`w-full text-center justify-center text-2xl bold py-6 ${
                  // If an option is selected, show it as green if correct, red if incorrect
                  gameState.selectedOption === index
                    ? option.isCorrect
                      ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-500'
                      : 'bg-red-100 hover:bg-red-200 text-red-800 border-red-500'
                    // If showing correct answer (after second mistake), highlight all options accordingly
                    : showCorrectAnswer
                      ? option.isCorrect
                        ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-500'
                        : 'bg-red-100 hover:bg-red-200 text-red-800 border-red-500'
                      // Default styling for unselected options
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300'
                  } border-2`}
                variant="outline"
                disabled={gameState.selectedOption !== null || showCorrectAnswer}
                onClick={() => handleOptionSelect(index)}
              >
                {option.value}
              </Button>
            ))}
          </div>
          <div className={`example-sentence text-xl text-gray-600 mt-20 transition-opacity duration-300 ${hideExampleSentences ? 'opacity-0' : 'opacity-100'}`}>
            {getSecondSentence(currentWord)}
          </div>
        </div>
      </div>
    </div>
  )
} 