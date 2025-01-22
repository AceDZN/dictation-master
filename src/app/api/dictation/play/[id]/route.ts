import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { auth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // First check if the game is public
    if (gameData.isPublic) {
      return NextResponse.json({
        id: gameDoc.id,
        ...gameData
      })
    }

    // If game is private, verify user session
    const session = await auth()
    const userId = session?.user?.id
    console.log('userId', userId)
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