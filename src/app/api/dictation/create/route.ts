import { NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { auth } from '@/lib/auth'
import { initAdminApp } from '@/lib/firebase-admin'
import { z } from 'zod'

const createDictationSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  wordPairs: z.array(z.object({
    first: z.string(),
    second: z.string(),
    sentence: z.string().optional()
  })).min(1),
  quizParameters: z.object({
    globalTimeLimit: z.number(),
    globalLivesLimit: z.number(),
    activityTimeLimit: z.number(),
    quizModeEnabled: z.boolean()
  }),
  isPublic: z.boolean().default(true)
})

export async function POST(request: Request) {
  try {
    // Get the current user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await request.json()
    const validatedData = createDictationSchema.parse(body)

    // Initialize Firestore
    const db = getFirestore(initAdminApp())
    
    // Create the game document
    const timestamp = new Date()
    const gameData = {
      ...validatedData,
      userId: session.user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Create a new document with auto-generated ID
    const docRef = db.collection('dictation_games').doc(session.user.id)
    const userRef = docRef.collection('games').doc()
    await userRef.set(gameData)

    return NextResponse.json({ 
      success: true, 
      dictationId: docRef.id 
    })
  } catch (error) {
    console.error('Error creating dictation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    // Add more specific error handling
    if (error instanceof Error) {
      const firestoreError = error as any
      if (firestoreError.code === 5) {
        return NextResponse.json({ error: 'Failed to create document in Firestore. Collection might not exist.' }, { status: 500 })
      }
    }
    return NextResponse.json({ error: 'Failed to create dictation' }, { status: 500 })
  }
} 