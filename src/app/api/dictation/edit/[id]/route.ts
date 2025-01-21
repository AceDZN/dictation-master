import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { auth } from '@/lib/auth'
import { DictationGame } from '@/lib/types'

// Initialize Firestore
const db = getFirestore(initAdminApp())

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dictationId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the correct nested collection structure
    const docRef = db.collection('dictation_games')
      .doc(session.user.id)
      .collection('games')
      .doc(dictationId)

    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Dictation not found' }, { status: 404 })
    }

    const data = doc.data() as DictationGame
    // No need to check userId since we're already in the user's collection
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error retrieving dictation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve dictation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dictationId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    // Use the correct nested collection structure
    const docRef = db.collection('dictation_games')
      .doc(session.user.id)
      .collection('games')
      .doc(dictationId)

    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Dictation not found' }, { status: 404 })
    }

    // No need to check userId since we're already in the user's collection
    const updatedData: Partial<DictationGame> = {
      ...body,
      updatedAt: new Date(),
    }

    await docRef.update(updatedData)

    return NextResponse.json({ message: 'Dictation updated successfully' })
  } catch (error) {
    console.error('Error updating dictation:', error)
    return NextResponse.json(
      { error: 'Failed to update dictation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: dictationId } = await params
    // Get the current user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Firestore
    const db = getFirestore(initAdminApp())
    
    // Get reference to the game document
    const userRef = db.collection('dictation_games').doc(session.user.id)
    const gameRef = userRef.collection('games').doc(dictationId)

    // Check if the game exists and belongs to the user
    const game = await gameRef.get()
    if (!game.exists) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Delete the game
    await gameRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
} 