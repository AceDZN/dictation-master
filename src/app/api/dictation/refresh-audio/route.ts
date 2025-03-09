import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStorage } from 'firebase-admin/storage'
import { initAdminApp } from '@/lib/firebase-admin'

// Initialize Firebase storage
const storage = getStorage(initAdminApp())
const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { wordId, audioUrl } = await request.json()

    if (!wordId || !audioUrl) {
      return NextResponse.json({ error: 'Missing wordId or audioUrl' }, { status: 400 })
    }

    // Extract the file path from the URL
    // Firebase signed URLs typically have a structure like:
    // https://storage.googleapis.com/[bucket]/[filepath]?[signature]
    let filePath: string | null = null
    
    try {
      // Extract the file path from the URL
      const url = new URL(audioUrl)
      // The pathname will include a leading slash and the bucket name, so we need to extract just the file path
      const pathParts = url.pathname.split('/')
      // Remove the empty first element (from leading slash) and the bucket name
      pathParts.splice(0, 2)
      filePath = pathParts.join('/')
      
      // URL decode the path if needed
      filePath = decodeURIComponent(filePath)
    } catch (error) {
      console.error('Error parsing audio URL:', error)
      return NextResponse.json({ error: 'Invalid audio URL format' }, { status: 400 })
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'Could not extract file path from URL' }, { status: 400 })
    }

    // Get the Firebase Storage file reference
    const file = bucket.file(filePath)
    
    // Check if the file exists
    const [exists] = await file.exists()
    if (!exists) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
    }
    
    // Generate a new signed URL with extended expiration
    const [refreshedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 86400000 // 24 hours
    })

    return NextResponse.json({ 
      refreshedUrl
    })
  } catch (error) {
    console.error('Error refreshing audio URL:', error)
    return NextResponse.json({ error: 'Failed to refresh audio URL' }, { status: 500 })
  }
} 