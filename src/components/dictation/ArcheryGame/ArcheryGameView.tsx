'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { DictationGame, WordPair } from '@/lib/types'
import { getSecondSentence } from '@/lib/language-direction'
//import { useAnimate } from 'motion/react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GameOverView } from '../GameOverView'
import { GameHeader, GameHeaderRef } from '../GameHeader'
import { trackEvent } from '@/lib/posthog-utils'
import { usePreferredVoice } from '@/hooks/use-preferred-voice'
import { useTTSPlayer } from '@/hooks/use-tts-player'
import { getLanguageBCP47Tag } from '@/lib/language-tags'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { Canvas } from '@react-three/fiber'
import { Leva, } from 'leva'
import * as THREE from 'three'

import { Target } from './Target'
import { ArcheryScene } from './Scene'
import { useGLTF } from '@react-three/drei'
interface GameViewProps {
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
  isStarted: boolean
  score: number
  isBowDrawn: boolean
  archerPosition: THREE.Vector3
}




// Removed module-level Audio to avoid SSR errors

export function ArcheryGameView({
  game,
  onGameEnd,
  hideExampleSentences = false,
  onToggleExampleSentences,
  shuffleWords = true
}: GameViewProps) {
  if (!game.id) {
    throw new Error('Game ID is required')
  }
  useGLTF.preload('/3d-models/bow.glb')
  const t = useTranslations('Dictation.game')

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
    isStarted: true,
    score: 0,
    isBowDrawn: false,
    archerPosition: new THREE.Vector3(0, 0, 5)
  })
  // Add debug mode state
  const [debugMode, setDebugMode] = useState(true)
  const { preferredVoiceId } = usePreferredVoice()

  // Audio refs (client-only)
  const hitSoundRef = useRef<HTMLAudioElement | null>(null)
  const missSoundRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      hitSoundRef.current = new Audio('/sounds/arrow-hit.mp3')
      missSoundRef.current = new Audio('/sounds/arrow-miss.mp3')
    }
  }, [])

  // Debug mode keyboard shortcut - press 'D' to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const gameContainerRef = useRef<HTMLDivElement>(null)
  const confettiController = useRef<any>(null)
  const gameHeaderRef = useRef<GameHeaderRef>(null)
  //const [scope, animate] = useAnimate()

  // Generate targets for the current word
  const generateTargets = useCallback((currentWord: WordPair, totalOptions: number = 4): Target[] => {
    const targets: Target[] = []

    // Get wrong options from other words
    const wrongOptions = randomizedWordPairs
      .filter(wp => wp.second !== currentWord.second)
      .map(wp => wp.second)
      .sort(() => Math.random() - 0.5)
      .slice(0, totalOptions - 1)

    // Combine correct answer with wrong options
    const allOptions = [
      { word: currentWord.second, isCorrect: true },
      ...wrongOptions.map(word => ({ word, isCorrect: false }))
    ]

    // Shuffle the options
    const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5)

    // Position targets in a semicircle in front of the player
    const DISTANCE = { min: 7, max: 12 }
    const ANGLE = { min: 4, max: 2.75 }
    const distance = DISTANCE.min + Math.random() * (DISTANCE.max - DISTANCE.min)

    const radius = distance
    const startAngle = -Math.PI / (ANGLE.min + Math.random() * (ANGLE.max - ANGLE.min))
    const endAngle = Math.PI / (ANGLE.min + Math.random() * (ANGLE.max - ANGLE.min))
    const angleStep = (endAngle - startAngle) / (shuffledOptions.length - 1 || 1)

    shuffledOptions.forEach((option, i) => {
      const angle = startAngle + (angleStep * i)
      const x = Math.sin(angle) * radius
      const z = -Math.cos(angle) * radius

      targets.push({
        position: new THREE.Vector3(x, 1.5, z),
        word: option.word,
        isCorrect: option.isCorrect
      })
    })

    return targets
  }, [randomizedWordPairs])

  // Current targets
  const [targets, setTargets] = useState<Target[]>([])

  const getCurrentWord = useCallback((): WordPair => {
    return randomizedWordPairs[gameState.currentWordIndex]
  }, [randomizedWordPairs, gameState.currentWordIndex])
  const currentWord = useMemo(() => getCurrentWord(), [getCurrentWord])
  const sourceLanguageTag = useMemo(
    () => getLanguageBCP47Tag(game.sourceLanguage),
    [game.sourceLanguage],
  )
  const targetLanguageTag = useMemo(
    () => getLanguageBCP47Tag(game.targetLanguage),
    [game.targetLanguage],
  )
  const speakPromptWord = useTTSPlayer({
    text: currentWord?.first,
    fallbackUrl: currentWord?.firstAudioUrl,
    voiceId: preferredVoiceId,
    lang: sourceLanguageTag,
  })
  const speakCurrentWord = useTTSPlayer({
    text: currentWord?.second,
    fallbackUrl: currentWord?.secondAudioUrl,
    voiceId: preferredVoiceId,
    minDurationMs: 1000,
    lang: targetLanguageTag,
  })

  useEffect(() => {
    if (gameState.isGameOver) {
      return
    }
    speakPromptWord()
  }, [gameState.isGameOver, speakPromptWord])

  // Update targets when current word changes
  useEffect(() => {
    if (!gameState.isGameOver) {
      setTargets(generateTargets(getCurrentWord()))
    }
  }, [gameState.currentWordIndex, gameState.isGameOver, generateTargets, getCurrentWord])

  const endGame = useCallback((isWin: boolean = false) => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      totalTime: Math.floor((Date.now() - prev.gameStartTime) / 1000)
    }))

    trackEvent('game_over', {
      game_id: game.id,
      game_title: game.title,
      game_mode: 'archery',
      score: gameState.score,
      hearts_remaining: gameState.hearts,
      time_taken: game.quizParameters.activityTimeLimit - gameState.timeLeft,
      fails_count: gameState.fails,
      completed_words_count: gameState.completedWords,
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
      isStarted: true,
      score: 0,
      isBowDrawn: false,
      archerPosition: new THREE.Vector3(0, 0, 5)
    })
  }, [game.quizParameters.globalLivesLimit, game.quizParameters.activityTimeLimit])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  // Move to next word
  const moveToNextWord = useCallback(() => {
    const nextIndex = gameState.currentWordIndex + 1
    if (nextIndex >= game.wordPairs.length) {
      setTimeout(() => {
        endGame(true)
      }, 1000) // Add delay before game end
    } else {
      setGameState(prev => ({
        ...prev,
        currentWordIndex: nextIndex,
        timeLeft: game.quizParameters.activityTimeLimit,
        isPaused: false
      }))
    }
  }, [endGame, gameState.currentWordIndex, game.wordPairs.length, game.quizParameters.activityTimeLimit])

  const handleCorrectAnswer = useCallback(() => {
    // Play arrow hit sound effect
    try {
      const audioEl = hitSoundRef.current
      if (audioEl) {
        audioEl.volume = 0.5
        audioEl.onended = () => {
          confettiController.current?.shoot()
        }
        audioEl.currentTime = 0
        audioEl.play().catch(error => console.error('Sound play error:', error))
      } else {
        confettiController.current?.shoot()
      }
    } catch (error) {
      console.error('Sound loading error:', error)
    }

    // Pause the timer immediately
    setGameState(prev => ({
      ...prev,
      isPaused: true,
      completedWords: prev.completedWords + 1,
      score: prev.score + 100
    }))

    speakCurrentWord()
      .catch(error => {
        console.error('Error during TTS playback:', error)
      })
      .finally(() => {
        moveToNextWord()
      })

    trackEvent('answer_correct', {
      game_id: game.id,
      game_title: game.title,
      source_language: game.sourceLanguage,
      target_language: game.targetLanguage,
      game_mode: 'archery',
      word_index: gameState.currentWordIndex,
      word_first: currentWord.first,
      word_second: currentWord.second
    })
  }, [confettiController, currentWord, game, gameState.currentWordIndex, moveToNextWord, speakCurrentWord])

  const handleIncorrectAnswer = useCallback(() => {
    const newHearts = gameState.hearts - 1
    const newFails = gameState.fails + 1

    // Play miss sound effect
    try {
      const audioEl = missSoundRef.current
      if (audioEl) {
        audioEl.volume = 0.5
        audioEl.currentTime = 0
        audioEl.play().catch(error => console.error('Sound play error:', error))
      }
    } catch (error) {
      console.error('Sound loading error:', error)
    }

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
      stars: newStars
    }))

    if (newHearts <= 0) {
      endGame(false)
    }

    trackEvent('answer_incorrect', {
      game_id: game.id,
      game_title: game.title,
      source_language: game.sourceLanguage,
      target_language: game.targetLanguage,
      game_mode: 'archery',
      word_index: gameState.currentWordIndex,
      word_first: getCurrentWord().first,
      word_second: getCurrentWord().second,
      hearts_remaining: newHearts,
      time_left: gameState.timeLeft
    })
  }, [endGame, game, gameState, getCurrentWord])

  // Handle target hit
  const handleTargetHit = useCallback((target: Target) => {
    if (target.isCorrect) {
      handleCorrectAnswer()
    } else {
      handleIncorrectAnswer()
    }
  }, [handleCorrectAnswer, handleIncorrectAnswer])

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit || gameState.isPaused) return

    const timer = setInterval(() => {
      if (gameState.timeLeft <= 0) {
        handleIncorrectAnswer()
        // After decreasing a heart, move to the next word and reset timer
        moveToNextWord()
      } else {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [handleIncorrectAnswer, gameState.isGameOver, game.quizParameters.activityTimeLimit, gameState.timeLeft, gameState.isPaused, moveToNextWord])

  // Track game start
  useEffect(() => {
    if (gameState.isStarted) {
      trackEvent('play_started', {
        game_id: game.id,
        game_title: game.title,
        source_language: game.sourceLanguage,
        target_language: game.targetLanguage,
        game_mode: 'archery'
      })
    }
  }, [gameState.isStarted, game])

  // Handle bow drawing state
  const setIsBowDrawn = useCallback((value: boolean) => {
    setGameState(prev => ({ ...prev, isBowDrawn: value }))
  }, [])

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

  return (
    <div className="max-w-5xl mx-auto">
      <Realistic onInit={handleConfettiInit} globalOptions={{ useWorker: true }} decorateOptions={() => ({
        particleCount: 10,
        spread: 70,
      })} />

      <h1 className="text-md mb-8 text-center text-gray-300 relative">
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
      />

      <div className="relative text-center mb-8 w-full h-[60vh] flex flex-col justify-center items-center bg-cyan-300 rounded-lg overflow-hidden" ref={gameContainerRef}>
        <Canvas shadows>
          <ArcheryScene
            targets={targets}
            isBowDrawn={gameState.isBowDrawn}
            setIsBowDrawn={setIsBowDrawn}
            onTargetHit={handleTargetHit}
          />
        </Canvas>
        <div className="text-4xl font-bold mb-12 text-indigo-600 current-word py-2 px-6 bg-white/70 absolute top-0 left-1/2 z-20 -translate-x-1/2 rounded-b-lg w-auto max-w-full">
          {getCurrentWord().first}
        </div>
        {/* Debug UI is always rendered but only visible when active */}
        <div className={`absolute top-0 right-0 z-10 ${debugMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Leva titleBar={{ title: "Archery Debug", filter: false }} />
        </div>
      </div>

      {!hideExampleSentences && getSecondSentence(getCurrentWord()) && (
        <div className="text-center text-lg text-gray-600 mb-8 max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg">
          <p>{getSecondSentence(getCurrentWord())}</p>
        </div>
      )}

      <div className="text-center text-sm text-gray-400 mb-4">
        {t('instructions')} {t('clickDragInstructions')}
        {/* Add debug hotkey hint with faint styling */}
        <span className="ml-2 opacity-50">{`(Press 'D' to toggle debug panel)`}</span>
      </div>
    </div>
  )
} 