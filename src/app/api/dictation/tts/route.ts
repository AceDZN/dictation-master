export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getStorage } from 'firebase-admin/storage'
import { initAdminApp } from '@/lib/firebase-admin'
import crypto from 'crypto'

const storage = getStorage(initAdminApp())
const bucket = storage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Supported OpenAI TTS voices: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer',
// 'coral', 'verse', 'ballad', 'ash', 'sage', 'marin', 'cedar'
const LANGUAGE_VOICE_MAP: Record<string, { voice: string }> = {
  en: { voice: 'alloy' },
  english: { voice: 'alloy' },

  es: { voice: 'ballad' },
  spanish: { voice: 'ballad' },

  fr: { voice: 'verse' },
  french: { voice: 'verse' },

  de: { voice: 'nova' },
  german: { voice: 'nova' },

  it: { voice: 'ash' },
  italian: { voice: 'ash' },

  pt: { voice: 'coral' },
  portuguese: { voice: 'coral' },

  ru: { voice: 'onyx' },
  russian: { voice: 'onyx' },

  ja: { voice: 'marin' },
  japanese: { voice: 'marin' },

  ko: { voice: 'sage' },
  korean: { voice: 'sage' },

  he: { voice: 'alloy' },
  hebrew: { voice: 'alloy' },

  ar: { voice: 'echo' },
  arabic: { voice: 'echo' },

  zh: { voice: 'cedar' },
  chinese: { voice: 'cedar' },
}

const DEFAULT_VOICE = 'alloy'

const normalizeLanguage = (language?: string): string => {
  if (!language) return 'en'
  const lower = language.toLowerCase()
  if (LANGUAGE_VOICE_MAP[lower]) {
    return lower
  }

  // Try to extract base code (e.g., "en-US" -> "en")
  const base = lower.split(/[-_]/)[0]
  return LANGUAGE_VOICE_MAP[base] ? base : 'en'
}

type OpenAIVoice = 'alloy' | 'nova' | 'ash' | 'coral' | 'onyx' | 'sage' | 'echo' | 'fable' | 'shimmer' | 'ballad' | 'cedar' | 'verse' | 'sage'

const selectVoice = (language: string): OpenAIVoice => {
  return LANGUAGE_VOICE_MAP[language]?.voice as OpenAIVoice ?? DEFAULT_VOICE as OpenAIVoice
}

const hashKey = (text: string): string => {
  return crypto.createHash('md5').update(text).digest('hex')
}

async function getOrCreateTTS(word: string, language: string): Promise<string> {
  const normalizedLanguage = normalizeLanguage(language)
  const hashedWord = hashKey(`${normalizedLanguage}:${word}`)
  const filePath = `tts/${normalizedLanguage}/${hashedWord}.mp3`
  const file = bucket.file(filePath)

  try {
    const [exists] = await file.exists()
    if (exists) {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 86_400_000,
      })
      return url
    }

    const ttsResponse = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: selectVoice(normalizedLanguage) as any,
      response_format: 'mp3',
      input: word.toUpperCase(),
    })

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer())

    await file.save(audioBuffer, {
      contentType: 'audio/mp3',
      metadata: {
        language: normalizedLanguage,
        word,
      },
    })

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 86_400_000,
    })
    return url
  } catch (error) {
    console.error('Error generating TTS', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { words, language } = body

    if (!words || (Array.isArray(words) && !words.length)) {
      return NextResponse.json({ error: 'Missing words parameter' }, { status: 400 })
    }

    const wordsArray = Array.isArray(words) ? words : [words]
    const normalizedLanguage = normalizeLanguage(language)

    const settledResults = await Promise.allSettled(
      wordsArray.map(word => getOrCreateTTS(word, normalizedLanguage)),
    )

    const results = settledResults.map((result, index) => ({
      word: wordsArray[index],
      url: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? (result.reason as Error)?.message : undefined,
    }))

    return NextResponse.json({
      success: true,
      results,
      failureCount: results.filter(r => !r.url).length,
    })
  } catch (error) {
    console.error('TTS API Error:', error)
    return NextResponse.json({ error: 'Failed to process TTS request' }, { status: 500 })
  }
}