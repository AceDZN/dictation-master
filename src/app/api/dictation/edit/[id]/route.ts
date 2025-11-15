import { NextRequest, NextResponse } from 'next/server'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { auth } from '@/lib/auth'
import { DictationGame } from '@/lib/types'
import { getTTSUrls } from '@/lib/server/tts'

// Initialize Firestore
const db = getFirestore(initAdminApp())

const toTimestamp = (value: unknown, fallback: Timestamp = Timestamp.now()): Timestamp => {
  if (value instanceof Timestamp) {
    return value
  }

  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    try {
      return Timestamp.fromDate((value as { toDate: () => Date }).toDate())
    } catch (error) {
      console.error('Error converting timestamp via toDate():', error)
    }
  }

  if (value instanceof Date) {
    return Timestamp.fromDate(value)
  }

  if (typeof value === 'number') {
    const millis = value > 1_000_000_000_000 ? value : value * 1000
    return Timestamp.fromMillis(millis)
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return Timestamp.fromMillis(parsed)
    }
  }

  if (value && typeof value === 'object') {
    const seconds = (value as { seconds?: number }).seconds
      ?? (value as { _seconds?: number })._seconds
    if (typeof seconds === 'number') {
      const nanoseconds = (value as { nanoseconds?: number }).nanoseconds
        ?? (value as { _nanoseconds?: number })._nanoseconds
        ?? 0
      return new Timestamp(seconds, nanoseconds)
    }
  }

  return fallback
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const normalizedCreatedAt = toTimestamp(
      data.createdAt || doc.createTime,
      doc.createTime || Timestamp.now(),
    )

    const needsRepair =
      !data.createdAt ||
      !(data.createdAt instanceof Timestamp) ||
      typeof (data.createdAt as { toDate?: () => Date }).toDate !== 'function'

    if (needsRepair) {
      await docRef.update({
        createdAt: normalizedCreatedAt,
      })
      data.createdAt = normalizedCreatedAt
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dictationId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const docRef = db.collection('dictation_games')
      .doc(session.user.id)
      .collection('games')
      .doc(dictationId)

    const doc = await docRef.get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Dictation not found' }, { status: 404 })
    }

    const currentData = doc.data() as DictationGame

    // If word pairs are being updated, generate new TTS URLs
    if (body.wordPairs) {
      // Get all unique words for source and target languages
      const sourceWords = body.wordPairs.map((pair: { first: string }) => pair.first)
      const targetWords = body.wordPairs.map((pair: { second: string }) => pair.second)

      // Generate TTS for all words in parallel
      const [sourceAudioUrls, targetAudioUrls] = await Promise.all([
        getTTSUrls(sourceWords, body.sourceLanguage || currentData.sourceLanguage),
        getTTSUrls(targetWords, body.targetLanguage || currentData.targetLanguage)
      ])

      // Add audio URLs to word pairs
      body.wordPairs = body.wordPairs.map((pair: { first: string; second: string; firstSentence?: string; secondSentence?: string; sentence?: string }) => {
        const normalizedFirstSentence = pair.firstSentence || ''
        const normalizedSecondSentence = pair.secondSentence || pair.sentence || ''
        const firstAudioUrl = sourceAudioUrls[pair.first]
        const secondAudioUrl = targetAudioUrls[pair.second]
        return {
          ...pair,
          firstSentence: normalizedFirstSentence,
          secondSentence: normalizedSecondSentence,
          sentence: normalizedSecondSentence,
          ...(firstAudioUrl ? { firstAudioUrl } : {}),
          ...(secondAudioUrl ? { secondAudioUrl } : {})
        }
      })
    }

    const {
      // createdAt: _ignoredCreatedAt,
      // updatedAt: _ignoredUpdatedAt,
      // userId: _ignoredUserId,
      ...sanitizedBody
    } = body

    const preservedCreatedAtRaw =
      currentData.createdAt ||
      doc.createTime ||
      Timestamp.now()

    const preservedCreatedAt = toTimestamp(
      preservedCreatedAtRaw,
      Timestamp.now()
    )

    const updatedData: Partial<DictationGame> = {
      ...sanitizedBody,
      createdAt: preservedCreatedAt,
      updatedAt: Timestamp.now(),
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
  { params }: { params: Promise<{ id: string }> }
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