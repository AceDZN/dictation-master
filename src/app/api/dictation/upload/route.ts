import { NextRequest, NextResponse } from 'next/server'
import { extractWordPairsFromImage, extractWordPairsFromText, type WordPairsList } from '@/lib/openai'
import { WordPair } from '@/lib/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const firstLanguage = formData.get('firstLanguage') as string
    const secondLanguage = formData.get('secondLanguage') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!firstLanguage || !secondLanguage) {
      return NextResponse.json(
        { error: 'Languages are required' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    let result: WordPairsList

    if (file.type.startsWith('image/')) {
      // Handle image file
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      result = await extractWordPairsFromImage(base64, firstLanguage, secondLanguage)
    } else if (file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv')) {
      // Handle text/CSV file
      const text = await file.text()
      result = await extractWordPairsFromText(text, firstLanguage, secondLanguage)
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a text, CSV, or image file.' },
        { status: 400 }
      )
    }

    if (!result.wordPairs.length) {
      return NextResponse.json(
        { error: 'No word pairs could be extracted from the file' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      ...result,
      message: `Successfully extracted ${result.wordPairs.length} word pairs`
    })

  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
} 