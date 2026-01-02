import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Type } from '@google/genai'
import { z } from 'zod'

const TIMEOUT_DURATION = 55000 // 55 seconds (slightly less than Vercel's 60s limit)

const RequestSchema = z.object({
    text: z.string().min(1, 'Text is required'),
    sourceLanguage: z.string().min(1, 'Source language is required'),
    targetLanguage: z.string().min(1, 'Target language is required'),
})

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

// Define the response schema for structured output
const wordPairsResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'A catchy, SEO-friendly title for the word list',
        },
        description: {
            type: Type.STRING,
            description: 'An engaging description of the word list',
        },
        wordPairs: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    first: {
                        type: Type.STRING,
                        description: 'The word in the source language',
                    },
                    second: {
                        type: Type.STRING,
                        description: 'The translation in the target language',
                    },
                    firstSentence: {
                        type: Type.STRING,
                        description: 'A natural example sentence using the source language word',
                    },
                    secondSentence: {
                        type: Type.STRING,
                        description: 'A natural example sentence using the target language word',
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: 'An English prompt that helps visualize the concept',
                    },
                },
                propertyOrdering: ['first', 'second', 'firstSentence', 'secondSentence', 'imagePrompt'],
                required: ['first', 'second', 'firstSentence', 'secondSentence', 'imagePrompt'],
            },
            description: 'Array of word pairs with translations and example sentences',
        },
    },
    propertyOrdering: ['title', 'description', 'wordPairs'],
    required: ['title', 'wordPairs'],
}

interface WordPair {
    first: string
    second: string
    firstSentence: string
    secondSentence: string
    sentence?: string
    imagePrompt: string
}

interface WordPairsResult {
    title: string
    description?: string
    wordPairs: WordPair[]
}

async function extractWordPairsWithGemini(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
): Promise<WordPairsResult> {
    const prompt = `Extract word pairs from the following text. For each pair provide:
- "first": the ${sourceLanguage} word exactly as it appears in the text
- "second": the ${targetLanguage} translation
- "firstSentence": a natural ${sourceLanguage} sentence that uses the ${sourceLanguage} word
- "secondSentence": a natural ${targetLanguage} sentence that uses the ${targetLanguage} word
- "imagePrompt": an English prompt that helps visualize the concept

Use exact wording where possible, translating only when missing. Include multiple ${sourceLanguage} words if they map to one ${targetLanguage} term. 
Also provide a relevant, catchy, SEO-friendly title and description in ${sourceLanguage}.

Text to extract from:
${text}`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: wordPairsResponseSchema,
        },
    })

    const content = response.text
    if (!content) {
        throw new Error('No content in the response')
    }

    const result = JSON.parse(content) as WordPairsResult

    // Normalize: add sentence field (same as secondSentence) for compatibility
    return {
        ...result,
        wordPairs: result.wordPairs.map(pair => ({
            ...pair,
            sentence: pair.secondSentence || '',
        })),
    }
}

export async function POST(req: NextRequest) {
    try {
        // Add timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timeout - Processing is taking longer than expected'))
            }, TIMEOUT_DURATION)
        })

        const body = await req.json()
        const { text, sourceLanguage, targetLanguage } = RequestSchema.parse(body)

        if (text.length > 10000) {
            return NextResponse.json(
                { error: 'Text is too long. Please limit to 10,000 characters.' },
                { status: 400 }
            )
        }

        // Race between the actual processing and timeout
        const result = await Promise.race([
            extractWordPairsWithGemini(text, sourceLanguage, targetLanguage),
            timeoutPromise
        ]) as WordPairsResult

        if (!result.wordPairs.length) {
            return NextResponse.json(
                { error: 'No word pairs could be extracted from the text' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            ...result,
            message: `Successfully extracted ${result.wordPairs.length} word pairs`
        })

    } catch (error) {
        console.error('Error extracting from text:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to extract word pairs from text' },
            { status: 500 }
        )
    }
}
