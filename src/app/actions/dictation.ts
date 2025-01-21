'use server'

import { z } from 'zod'
import type { DictationGame } from '@/lib/types'
import { auth } from "@/lib/auth"
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'

const CreateDictationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(30),
  description: z.string().max(100).optional(),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  wordPairs: z.array(z.object({
    first: z.string().min(1).max(50),
    second: z.string().min(1).max(50),
    sentence: z.string().max(200).optional(),
  })).min(1).max(50),
  quizParameters: z.object({
    globalTimeLimit: z.number().min(0).max(3600),
    globalLivesLimit: z.number().min(1).max(10),
    activityTimeLimit: z.number().min(0).max(300),
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
  wordPairs: any[]
  createdAt: { toDate: () => Date }
  isPublic: boolean
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

  return gamesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Game[]
}

export async function deleteGame(id: string): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return false
    }

    const db = getFirestore(initAdminApp())
    const docRef = db
      .collection('dictation_games')
      .doc(session.user.id)
      .collection('games')
      .doc(id)
    
    const doc = await docRef.get()
    if (!doc.exists) {
      return false
    }

    await docRef.delete()
    return true
  } catch (error) {
    console.error('Error deleting game:', error)
    return false
  }
} 