'use server'

import { z } from 'zod'
import type { DictationGame } from '@/lib/types'
import { auth } from "@/lib/auth"
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'

const CreateDictationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  wordPairs: z.array(z.object({
    first: z.string(),
    second: z.string(),
    firstSentence: z.string().optional(),
    secondSentence: z.string().optional(),
    sentence: z.string().optional(),
    firstAudioUrl: z.string().optional(),
    secondAudioUrl: z.string().optional(),
  })),
  quizParameters: z.object({
    globalTimeLimit: z.number(),
    globalLivesLimit: z.number(),
    activityTimeLimit: z.number(),
    quizModeEnabled: z.boolean(),
  }),
})

export type CreateDictationInput = z.infer<typeof CreateDictationSchema>

export async function createDictation(data: CreateDictationInput): Promise<{ error?: string, game?: DictationGame }> {
  try {
    const session = await auth()
    if (!session?.user?.email || !session?.user?.id) {
      return { error: 'Not authenticated' }
    }

    // Validate input
    const validatedData = CreateDictationSchema.parse(data)

    return {
      game: {
        ...validatedData,
        id: 'temp-id',
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  } catch (error) {
    console.error('Error creating dictation:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: 'Failed to create dictation' }
  }
}

export interface Game {
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
  createdAt: {
    _seconds: number
    _nanoseconds: number
    toDate?: () => Date
  }
  isPublic?: boolean
  playCount?: number
}

const normalizeTimestamp = (
  value: unknown,
  fallback: Timestamp,
) => {
  if (value instanceof Timestamp) {
    return {
      _seconds: value.seconds,
      _nanoseconds: value.nanoseconds,
      toDate: () => value.toDate(),
    }
  }

  if (value instanceof Date) {
    const millis = value.getTime()
    const seconds = Math.floor(millis / 1000)
    const nanoseconds = (millis % 1000) * 1_000_000
    return {
      _seconds: seconds,
      _nanoseconds: nanoseconds,
      toDate: () => value,
    }
  }

  if (value && typeof value === 'object') {
    const maybeSeconds = (value as { seconds?: number; _seconds?: number }).seconds
      ?? (value as { _seconds?: number })._seconds
    const maybeNanoseconds = (value as { nanoseconds?: number; _nanoseconds?: number }).nanoseconds
      ?? (value as { _nanoseconds?: number })._nanoseconds

    if (typeof maybeSeconds === 'number') {
      const seconds = maybeSeconds
      const nanoseconds = typeof maybeNanoseconds === 'number' ? maybeNanoseconds : 0
      return {
        _seconds: seconds,
        _nanoseconds: nanoseconds,
        toDate: () => new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000)),
      }
    }
  }

  return {
    _seconds: fallback.seconds,
    _nanoseconds: fallback.nanoseconds,
    toDate: () => fallback.toDate(),
  }
}

export async function getGames(): Promise<Game[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const db = getFirestore(initAdminApp())
  const gamesSnapshot = await db
    .collection('dictation_games')
    .doc(session.user.id)
    .collection('games')
    .get()

  return gamesSnapshot.docs.map(doc => {
    const data = doc.data()
    const fallbackTimestamp = doc.createTime ?? Timestamp.fromMillis(0)

    return {
      id: doc.id,
      ...data,
      createdAt: normalizeTimestamp(data.createdAt, fallbackTimestamp),
    }
  }) as Game[]
}

export async function deleteGame(id: string): Promise<boolean> {
  try {
    // Get the current user's session
    const session = await auth()
    if (!session?.user) return false

    // Initialize Firestore
    initAdminApp()
    const db = getFirestore()

    // Get the game document
    const gameDoc = await db.collection('dictation_games').doc(id).get()
    if (!gameDoc.exists) return false

    const gameData = gameDoc.data()
    if (!gameData) return false

    // Check if the user owns the game
    if (gameData.userId !== session.user.id) return false

    // Delete the game
    await db.collection('dictation_games').doc(id).delete()
    return true
  } catch (error) {
    console.error('Error deleting game:', error)
    return false
  }
}
