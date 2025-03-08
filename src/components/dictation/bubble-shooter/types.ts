import { DictationGame, WordPair } from '@/lib/types'
import * as THREE from 'three'

export interface BubbleShooterGameViewProps {
  game: DictationGame
  onGameEnd: () => void
  hideExampleSentences?: boolean
  onToggleExampleSentences?: () => void
}

export interface GameState {
  currentWordIndex: number
  hearts: number
  timeLeft: number
  gameStartTime: number
  totalTime: number
  isGameOver: boolean
  stars: number
  fails: number
  completedWords: number
  score: number
  combo: number
  powerUpIndex: number | null
}

export interface BubbleProps {
  word: string
  position: [number, number, number]
  color?: string
  onCollide?: (e: any) => void
  isShooter?: boolean
}

export interface TargetBubbleProps {
  wordPair: WordPair
  position: [number, number, number]
  onMatch: (count: number) => void
  onMiss: () => void
  currentTarget: WordPair | undefined
  isPowerUp?: boolean
}

export interface ShotBubbleProps {
  word: string
  direction: THREE.Vector3
  onRemove: () => void
}

export interface ShooterProps {
  wordPairs: WordPair[]
  currentIndex: number
  onShoot: (direction: THREE.Vector3) => void
}

export interface GameHeaderRef {
  animateHeartLoss: () => void
} 