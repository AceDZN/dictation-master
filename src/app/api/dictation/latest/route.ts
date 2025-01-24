import { initAdminApp } from '@/lib/firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'
import type { FirebaseGame } from '@/lib/types'
import type { Game } from '@/app/actions/dictation'

export async function GET() {
  try {
    initAdminApp()
    const db = getFirestore()
    
    // Use collectionGroup to query across all user's games subcollections
    const gamesQuery = db.collectionGroup('games')
    const snapshot = await gamesQuery
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const games = snapshot.docs.map(doc => {
      const data = doc.data() as FirebaseGame
      return {
        ...data,
        id: doc.id,
        createdAt: {
          _seconds: data.createdAt.seconds,
          _nanoseconds: data.createdAt.nanoseconds,
          toDate: () => data.createdAt.toDate()
        }
      }
    }) as Game[]

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching latest games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest games' },
      { status: 500 }
    )
  }
} 