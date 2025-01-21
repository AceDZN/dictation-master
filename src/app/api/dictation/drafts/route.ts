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
    
    // Get user's drafts (private dictations)
    const userRef = db.collection('dictation_games').doc(session.user.id)
    const draftsSnapshot = await userRef.collection('games')
      .where('isPublic', '==', false)
      .orderBy('updatedAt', 'desc')
      .get()

    const drafts = draftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }
} 