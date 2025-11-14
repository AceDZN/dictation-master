export const revalidate = 0
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { auth } from '@/lib/auth'
import { getTTSUrls } from '@/lib/server/tts'

// Define the word pair interface based on the application's structure
interface WordPair {
  first: string
  second: string
  firstSentence?: string
  secondSentence?: string
  sentence?: string
  firstAudioUrl?: string
  secondAudioUrl?: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dictationId } = await params
    const db = getFirestore(initAdminApp())
    
    // Get all games and find the one with matching ID
    const gamesQuery = await db.collectionGroup('games').get()
    const gameDoc = gamesQuery.docs.find(doc => doc.id === dictationId)

    if (!gameDoc) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    const gameData = gameDoc.data()
    // Check auth for private games
    if (!gameData.isPublic) {
      // If game is private, verify user session
      const session = await auth()
      const userId = session?.user?.id
      // If no session and game is private, deny access
      if (!userId) {
        return NextResponse.json(
          { error: 'Game not accessible' },
          { status: 403 }
        )
      }

      // Check if user owns the game
      if (gameDoc.ref.parent.parent?.id !== userId) {
        return NextResponse.json(
          { error: 'Game not accessible' },
          { status: 403 }
        )
      }
    }
    
    
    // Normalize sentence fields before generating audio
    if (gameData.wordPairs && gameData.wordPairs.length > 0) {
      gameData.wordPairs = gameData.wordPairs.map((pair: WordPair) => {
        const normalizedFirstSentence = pair.firstSentence || ''
        const normalizedSecondSentence = pair.secondSentence || pair.sentence || ''
        return {
          ...pair,
          firstSentence: normalizedFirstSentence,
          secondSentence: normalizedSecondSentence,
          sentence: normalizedSecondSentence
        }
      })
    }

    // Refresh the TTS URLs for all word pairs in the game
    if (gameData.wordPairs && gameData.wordPairs.length > 0) {
      // Extract all unique words from the word pairs
      const sourceWords = gameData.wordPairs.map((pair: WordPair) => pair.first)
      const targetWords = gameData.wordPairs.map((pair: WordPair) => pair.second)
      
      // Generate fresh TTS URLs for all words in parallel
      const [sourceResult, targetResult] = await Promise.allSettled([
        getTTSUrls(sourceWords, gameData.sourceLanguage),
        getTTSUrls(targetWords, gameData.targetLanguage)
      ])
      
      //console.log('sourceResult', {sourceWords, gameData.sourceLanguage, sourceResult})
      //console.log('targetResult', {targetWords, targetLanguage:gameData.targetLanguage, targetResult})
      
      // Initialize empty URL objects in case of failures
      const sourceAudioUrls: Record<string, string> = {}
      const targetAudioUrls: Record<string, string> = {}
      
      // Extract results if promises were fulfilled
      if (sourceResult.status === 'fulfilled') {
       Object.assign(sourceAudioUrls, sourceResult.value)
      } else {
       console.error('Error generating source language TTS:', sourceResult.reason)
      }
      
      if (targetResult.status === 'fulfilled') {
        Object.assign(targetAudioUrls, targetResult.value)
      } else {
        console.error('Error generating target language TTS:', targetResult.reason)
      }

      
      
      // Update word pairs with fresh URLs when available
      gameData.wordPairs = gameData.wordPairs.map((pair: WordPair) => ({
        ...pair,
        firstAudioUrl: sourceAudioUrls[pair.first] || pair.firstAudioUrl,
        secondAudioUrl: targetAudioUrls[pair.second] || pair.secondAudioUrl
      }))
    }

    // Return the game data with refreshed URLs
    return NextResponse.json({
      id: gameDoc.id,
      ...gameData
    })

  } catch (error) {
    console.error('Error retrieving dictation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve dictation' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dictationId } = await params
    const db = getFirestore(initAdminApp())
    
    // Get all games and find the one with matching ID
    const gamesQuery = await db.collectionGroup('games').get()
    const gameDoc = gamesQuery.docs.find(doc => doc.id === dictationId)

    if (!gameDoc) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    // Increment the play count
    await gameDoc.ref.update({
      playCount: (gameDoc.data().playCount || 0) + 1
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating play count:', error)
    return NextResponse.json(
      { error: 'Failed to update play count' },
      { status: 500 }
    )
  }
} 