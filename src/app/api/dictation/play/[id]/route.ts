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
    const session = await auth()
    
    // First, try to find the game in all public games
    const usersSnapshot = await db.collection('dictation_games').get()
    let gameDoc = null

    for (const userDoc of usersSnapshot.docs) {
      const doc = await db
        .collection('dictation_games')
        .doc(userDoc.id)
        .collection('games')
        .doc(dictationId)
        .get()

      if (doc.exists) {
        const data = doc.data()
        // Check if the game is public or if it belongs to the current user
        if (data?.isPublic || (session?.user?.id && userDoc.id === session.user.id)) {
          gameDoc = doc
          break
        }
      }
    }

    if (!gameDoc) {
      console.log('Game not found or not accessible')
      return NextResponse.json(
        { error: 'Game not found or not accessible' },
        { status: 404 }
      )
    }
    console.log('Game found:', gameDoc.id)
    const game = {
      id: gameDoc.id,
      ...gameDoc.data()
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('Error retrieving dictation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve dictation' },
      { status: 500 }
    )
  }
} 