import { NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { auth } from '@/lib/auth'
import { initAdminApp } from '@/lib/firebase-admin'

export async function GET() {
  try {
    // Get the current user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Firestore
    const db = getFirestore(initAdminApp())
    
    // Get user's games
    const userRef = db.collection('dictation_games').doc(session.user.id)
    const gamesSnapshot = await userRef.collection('games')
      .orderBy('createdAt', 'desc')
      .get()

    const games = gamesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
} 