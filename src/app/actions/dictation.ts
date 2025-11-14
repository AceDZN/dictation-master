'use server'

import { z } from 'zod'
import type { DictationGame } from '@/lib/types'
import { auth } from "@/lib/auth"
import { getFirestore } from 'firebase-admin/firestore'
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
    return {
      id: doc.id,
      ...data,
      createdAt: {
        _seconds: data.createdAt?.seconds || 0,
        _nanoseconds: data.createdAt?.nanoseconds || 0
      }
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
