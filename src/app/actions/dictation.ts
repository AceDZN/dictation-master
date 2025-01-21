'use server'

import { z } from 'zod'
import type { DictationGame } from '@/lib/types'

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
    // Validate input
    const validatedData = CreateDictationSchema.parse(data)

    // TODO: Implement actual game creation logic with Firebase
    console.log('Creating dictation:', validatedData)

    return {
      game: {
        ...validatedData,
        id: 'temp-id',
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