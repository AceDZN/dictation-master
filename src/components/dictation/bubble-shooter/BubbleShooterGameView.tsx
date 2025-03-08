'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Physics } from '@react-three/cannon'
import * as THREE from 'three'
import Realistic from 'react-canvas-confetti/dist/presets/realistic'
import { GameHeader, GameHeaderRef } from '../GameHeader'
import { GameOverView } from '../GameOverView'
import { TargetBubble } from './TargetBubble'
import { Shooter } from './Shooter'
import { Walls } from './Walls'
import { WallsDebugPanel } from './WallsDebugPanel'
import { BubbleShooterGameViewProps, GameState } from './types'
import { WordPair } from '@/lib/types'

// Dynamically import Canvas with SSR disabled
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => mod.Canvas), { ssr: false })

export function BubbleShooterGameView({
  game,
  onGameEnd,
  hideExampleSentences = false,
  onToggleExampleSentences
}: BubbleShooterGameViewProps) {
  const t = useTranslations('Dictation.game')

  const [isLoading, setIsLoading] = useState(true)
  const [randomizedWordPairs, setRandomizedWordPairs] = useState<WordPair[]>([])
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    hearts: game.quizParameters.globalLivesLimit,
    timeLeft: game.quizParameters.activityTimeLimit,
    gameStartTime: Date.now(),
    totalTime: 0,
    isGameOver: false,
    stars: 3,
    fails: 0,
    completedWords: 0,
    score: 0,
    combo: 0,
    powerUpIndex: null
  })

  const [bubbleWordPairs, setBubbleWordPairs] = useState<WordPair[]>([])

  const confettiController = useRef<any>(null)
  const gameHeaderRef = useRef<GameHeaderRef>(null)
  const heartsContainerRef = useRef<HTMLDivElement>(null)

  // Add state for wall dimensions
  const [wallDimensions, setWallDimensions] = useState({
    width: 13.5,
    height: 12,
    thickness: 0.5
  })

  // Add handler for updating wall dimensions
  const handleUpdateWallDimensions = (width: number, height: number, thickness: number) => {
    setWallDimensions({ width, height, thickness })
  }

  useEffect(() => {
    if (game.wordPairs.length > 0) {
      setRandomizedWordPairs([...game.wordPairs].sort(() => Math.random() - 0.5))
      setIsLoading(false)
    }
  }, [game.wordPairs])

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameOver: true,
      totalTime: prev.gameStartTime > 0 ? Math.floor((Date.now() - prev.gameStartTime) / 1000) : 0
    }))
  }, [])

  const handleConfettiInit = useCallback(({ conductor }: { conductor: any }) => {
    confettiController.current = conductor
  }, [])

  const restartGame = useCallback(() => {
    setIsLoading(true)
    setRandomizedWordPairs([...game.wordPairs].sort(() => Math.random() - 0.5))
    setGameState({
      currentWordIndex: 0,
      hearts: game.quizParameters.globalLivesLimit,
      timeLeft: game.quizParameters.activityTimeLimit,
      gameStartTime: Date.now(),
      totalTime: 0,
      isGameOver: false,
      stars: 3,
      fails: 0,
      completedWords: 0,
      score: 0,
      combo: 0,
      powerUpIndex: null
    })
    setTimeout(() => setIsLoading(false), 100)
  }, [game.wordPairs, game.quizParameters.globalLivesLimit, game.quizParameters.activityTimeLimit])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const getCurrentWord = useCallback((): WordPair | undefined => {
    if (randomizedWordPairs.length === 0 || gameState.currentWordIndex >= randomizedWordPairs.length) {
      return undefined
    }
    return randomizedWordPairs[gameState.currentWordIndex]
  }, [randomizedWordPairs, gameState.currentWordIndex])

  const handleMatch = useCallback(
    (matchedPairs: number) => {
      if (!confettiController.current) return

      confettiController.current.shoot()

      setGameState((prev) => {
        const newIndex = prev.currentWordIndex + 1
        const newCombo = prev.combo + 1
        let newPowerUpIndex = prev.powerUpIndex
        let newTimeLeft = prev.timeLeft

        if (prev.currentWordIndex === prev.powerUpIndex) {
          newTimeLeft += 10 // Power-up effect: add 10 seconds
          newPowerUpIndex = null
        }

        if (newCombo % 3 === 0 && newPowerUpIndex === null) {
          const remainingIndices = Array.from(
            { length: randomizedWordPairs.length - newIndex },
            (_, i) => newIndex + i
          )
          if (remainingIndices.length > 0) {
            newPowerUpIndex =
              remainingIndices[Math.floor(Math.random() * remainingIndices.length)]
          }
        }

        return {
          ...prev,
          completedWords: prev.completedWords + matchedPairs,
          score: prev.score + 100 * matchedPairs * newCombo,
          combo: newCombo,
          currentWordIndex: newIndex,
          powerUpIndex: newPowerUpIndex,
          timeLeft: newTimeLeft
        }
      })
    },
    [randomizedWordPairs]
  )

  const handleMiss = useCallback(() => {
    const newHearts = gameState.hearts - 1
    const newFails = gameState.fails + 1
    let newStars = 3

    if (newFails >= 5) newStars = 1
    else if (newFails >= 3) newStars = 2

    gameHeaderRef.current?.animateHeartLoss()

    setGameState((prev) => ({
      ...prev,
      hearts: newHearts,
      fails: newFails,
      stars: newStars,
      combo: 0
    }))

    if (newHearts <= 0) {
      endGame()
    }
  }, [endGame, gameState.hearts, gameState.fails])

  const handleShoot = useCallback((direction: THREE.Vector3) => {
    console.log('🚀 Shot fired with direction:', direction)
    
    // After a shot, we need to wait a short time before allowing a new shot
    // We could add a cooldown period here if needed
    
    // The actual hit detection and matching happens in the ShotBubble and TargetBubble components
  }, [])

  // Function to advance to the next round (called after a shot bubble is removed)
  const advanceToNextRound = useCallback(() => {
    console.log('Advancing to next round')
    // If you want to add specific logic for advancing, you can add it here
  }, [])

  useEffect(() => {
    if (gameState.isGameOver || !game.quizParameters.activityTimeLimit || isLoading) return

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 0) {
          handleMiss()
          return { ...prev, timeLeft: game.quizParameters.activityTimeLimit }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState.isGameOver, handleMiss, game.quizParameters.activityTimeLimit, isLoading])

  useEffect(() => {
    if (!isLoading && gameState.currentWordIndex >= randomizedWordPairs.length) {
      setTimeout(endGame, 1000)
    }
  }, [gameState.currentWordIndex, randomizedWordPairs.length, endGame, isLoading])

  const currentWordPair = getCurrentWord()

  useEffect(() => {
    if (isLoading || !currentWordPair) return

    const otherWordPairs = randomizedWordPairs.filter((wp) => wp.first !== currentWordPair.first)
    const incorrectWordPairs =
      otherWordPairs.length >= 2
        ? otherWordPairs.sort(() => Math.random() - 0.5).slice(0, 2)
        : [otherWordPairs[0] || currentWordPair, otherWordPairs[0] || currentWordPair]
    
    const newBubbleWordPairs = [currentWordPair, ...incorrectWordPairs].sort(() => Math.random() - 0.5);
    
    // Log the word pairs for debugging
    console.log('Setting up bubbles:', {
      currentWordPair,
      bubbleWordPairs: newBubbleWordPairs,
      currentIndex: gameState.currentWordIndex
    });
    
    setBubbleWordPairs(newBubbleWordPairs)
  }, [gameState.currentWordIndex, randomizedWordPairs, isLoading, currentWordPair])

  if (isLoading) {
    return <div className="w-full min-h-[50vh] flex justify-center items-center">Loading game...</div>
  }

  if (randomizedWordPairs.length === 0) {
    return (
      <div className="w-full min-h-[50vh] flex justify-center items-center">
        No words available for this game.
      </div>
    )
  }

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

  if (!currentWordPair) return null

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Realistic onInit={handleConfettiInit} />
      <h1 className="text-md mb-12 text-center text-gray-300 relative">{game.title}</h1>

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

      <div className="w-full min-h-[50vh] flex flex-col justify-center items-center">
        <div className="w-full h-[600px] relative bg-gray-100 rounded-lg">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            style={{
              background: 'radial-gradient(circle, rgba(173,216,230,1) 0%, rgba(135,206,235,1) 100%)'
            }}
          >
            <Physics gravity={[0, 0, 0]}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 10]} intensity={1} />
              
              {/* Add the walls with configurable dimensions */}
              <Walls 
                width={wallDimensions.width} 
                height={wallDimensions.height} 
                thickness={wallDimensions.thickness} 
              />

              {bubbleWordPairs.map((wp, index) => {
                // Check if this is the matching bubble
                const isMatchingBubble = wp.first === currentWordPair.first;
                console.log(`Bubble ${index}:`, { 
                  word: wp.second, 
                  isMatchingBubble,
                  wordPairFirst: wp.first,
                  currentWordPairFirst: currentWordPair.first
                });
                
                // Calculate positions to fit within the walls
                // Distribute bubbles evenly across the top of the game area
                const xPos = (index - 1) * 2;
                const yPos = 2; // Position bubbles higher in the game area
                
                return (
                  <TargetBubble
                    key={wp.id || index} 
                    wordPair={wp}
                    position={[xPos, yPos, 0]} // Adjusted position
                    onMatch={handleMatch}
                    onMiss={handleMiss}
                    currentTarget={currentWordPair}
                    isPowerUp={gameState.powerUpIndex === gameState.currentWordIndex && wp.first === currentWordPair.first}
                  />
                );
              })}

              <Shooter
                wordPairs={randomizedWordPairs}
                currentIndex={gameState.currentWordIndex}
                onShoot={handleShoot}
              />
            </Physics>
          </Canvas>

          {/* Add the debug panel */}
          <WallsDebugPanel
            width={wallDimensions.width}
            height={wallDimensions.height}
            thickness={wallDimensions.thickness}
            onUpdateDimensions={handleUpdateWallDimensions}
          />

          <div className="absolute top-0 right-0 p-4 text-xl font-bold text-gray-800">
            Score: {gameState.score}
            {gameState.combo > 1 && <span className="ml-2 text-indigo-600">x{gameState.combo}</span>}
          </div>

          {!hideExampleSentences && currentWordPair && (
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-gray-600">
              {currentWordPair.sentence}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 