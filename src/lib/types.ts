import { Timestamp } from 'firebase-admin/firestore'

export interface WordPair {
  first: string
  second: string
  firstSentence?: string
  secondSentence?: string
  /**
   * @deprecated use firstSentence/secondSentence instead
   */
  sentence?: string
  firstAudioUrl?: string
  secondAudioUrl?: string
}

export interface QuizParameters {
  globalTimeLimit: number
  globalLivesLimit: number
  activityTimeLimit: number
  quizModeEnabled: boolean
}

export interface DictationGame {
  id?: string
  userId: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: WordPair[]
  quizParameters: QuizParameters
  createdAt?: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface GameStructure {
  slides: Array<{
    type: 'intro' | 'dictation' | 'outro'
    layers: Array<{
      id?: string
      type: 'txt' | 'bg'
      info?: string
      transform?: number[]
    }>
    activities?: Array<{
      shapes: Array<{
        id: string
        settings: {
          textAnswerArray: string[]
          isUsingSpeakingMode: boolean
        }
      }>
    }>
  }>
}

export interface FirebaseGame {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: Array<{
    first: string
    second: string
    firstSentence?: string
    secondSentence?: string
    sentence?: string
  }>
  createdAt: Timestamp
  isPublic: boolean
  userId: string
}