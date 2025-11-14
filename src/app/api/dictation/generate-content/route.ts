import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const WordPairsList = z.object({
  title: z.string(),
  description: z.string().optional(),
  wordPairs: z.array(
    z.object({
      first: z.string(),
      second: z.string(),
      firstSentence: z.string(),
      secondSentence: z.string(),
      sentence: z.string().optional(),
      imagePrompt: z.string(),
    }),
  ),
})

const RequestSchema = z.object({
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  title: z.string(),
  description: z.string(),
  wordPairs: z.array(z.object({
    first: z.string(),
    second: z.string(),
    firstSentence: z.string().optional(),
    secondSentence: z.string().optional(),
    sentence: z.string().optional(),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    //console.log('body', body)
    const { sourceLanguage='Hebrew', targetLanguage='English', wordPairs=[], title='NO TITLE', description='NO DESCRIPTION' } = RequestSchema.parse(body)

    const prompt = `Given these word pairs between ${sourceLanguage} and ${targetLanguage}, please:
1. Complete any missing translations.
2. Provide a natural, contextual example sentence in ${sourceLanguage} that uses the ${sourceLanguage} word ("firstSentence").
3. Provide a natural, contextual example sentence in ${targetLanguage} that uses the ${targetLanguage} word ("secondSentence").
4. Include an English "imagePrompt" for each pair that helps visualize the concept.
5. If needed, generate a catchy, SEO-friendly title and description in ${sourceLanguage}.

Existing word pairs:
${wordPairs.map(pair => `${pair.first} - ${pair.second}`).join('\n')}

Title: ${title}
Description: ${description}

Return strict JSON that matches the schema with firstSentence, secondSentence, sentence (same as secondSentence), and imagePrompt.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: zodResponseFormat(WordPairsList, 'word_pairs'),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10000,
    })

    const content = response.choices[0].message.content
    
    if (!content) {
      throw new Error('No content in the response')
    }
    
    const parsedContent = JSON.parse(content)
    const normalizedContent = {
      ...parsedContent,
      wordPairs: parsedContent.wordPairs.map((pair: { secondSentence?: string; sentence?: string }) => ({
        ...pair,
        sentence: pair.secondSentence || pair.sentence || ''
      }))
    }
    return NextResponse.json(normalizedContent)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 },
    )
  }
} 