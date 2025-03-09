export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'
import { getStorage } from 'firebase-admin/storage'
import { initAdminApp } from '@/lib/firebase-admin'
import crypto from 'crypto'
import { Readable } from 'stream'

const storage = getStorage(initAdminApp())
const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })

// Hash function to create consistent filenames
function hashWord(word: string): string {
  return crypto.createHash('md5').update(word.toLowerCase()).digest('hex')
}

// Helper function to convert Node.js Readable to Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }
  
  return Buffer.concat(chunks)
}

// Function to get or create TTS file
async function getOrCreateTTS(word: string): Promise<string> {
  const hashedWord = hashWord(word)
  const filePath = `tts/en/${hashedWord}.mp3`
  const file = bucket.file(filePath)
  
  try {
    // Check if file exists
    const [exists] = await file.exists()
    if (exists) {
      // Get signed URL that expires in 24 hours instead of 1 hour
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 86400000 // 24 hours (was 3600000 for 1 hour)
      })
      return url
    }

    // File doesn't exist, generate new TTS
    try {
      const ttsResponse = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        output_format: 'mp3_44100_128',
        language_code: 'en',
        text: word,
        model_id: 'eleven_turbo_v2_5'
      })

      // Convert stream to Buffer
      const audioBuffer = await streamToBuffer(ttsResponse)
      
      // Upload to Firebase Storage
      await file.save(audioBuffer, {
        contentType: 'audio/mp3',
        metadata: {
          language: 'en',
          word
        }
      })
      console.log('file saved')
      
      // Get signed URL with extended expiration time
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 86400000 // 24 hours (was 3600000 for 1 hour)
      })
      return url
    } catch(error) {
      console.error('Error generating TTS with ElevenLabs', error)
      throw error
    }
  } catch (error) {
    console.error('Error getting existing TTS', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { words, language } = body

    if (!words) {
      console.error('Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Only process if language is English
    if (language && language !== 'en' && language !== 'English') {
      return NextResponse.json({ 
        success: true, 
        results: Array.isArray(words) ? words.map(word => ({ word, url: null })) : [{ word: words, url: null }]
      })
    }

    // Handle single word or array of words
    const wordsArray = Array.isArray(words) ? words : [words]
    
    // Process all words and handle failures gracefully
    const settledResults = await Promise.allSettled(
      wordsArray.map(word => getOrCreateTTS(word))
    )

    // Map results, providing null URLs for failed generations
    const results = settledResults.map((result, index) => ({
      word: wordsArray[index],
      url: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason?.message : undefined
    }))

    return NextResponse.json({ 
      success: true, 
      results,
      // Include a summary of failures if any occurred
      failureCount: results.filter(r => !r.url).length
    })
  } catch (error) {
    console.error('TTS API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process TTS request' },
      { status: 500 }
    )
  }
} 