import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const WordPairsList = z.object({
  title: z.string().max(30),
  description: z.string().max(100).optional(),
    wordPairs: z.array(
        z.object({
        first: z.string(),
        second: z.string(),
        sentence: z.string(),
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
    sentence: z.string(),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('body', body)
    const { sourceLanguage='Hebrew', targetLanguage='English', wordPairs=[], title='NO TITLE', description='NO DESCRIPTION' } = RequestSchema.parse(body)

    const prompt = `Given these word pairs between ${sourceLanguage} and ${targetLanguage}, please:
        1. If a word is missing its translation, provide it
        2. For each pair, generate a natural, contextual example sentence in ${targetLanguage} using the ${targetLanguage} word
        3. For each pair, generate an English image prompt that would help visualize the word's meaning
        4. If required, generate a title and description for the content in ${sourceLanguage} - the title and description should be in natural language, SEO friendly, cool, and related to the topic of the words.
        Word pairs:
        ${wordPairs.map(pair => `${pair.first} - ${pair.second}`).join('\n')}
        title: ${title}
        description: ${description}
        Return a JSON object with the complete word pairs, including translations, sentences, and image prompts.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: zodResponseFormat(WordPairsList, 'word_pairs'),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3500,
    })

    const content = response.choices[0].message.content
    console.log('content', content)
    if (!content) {
      throw new Error('No content in the response')
    }

    const parsedContent = JSON.parse(content)
    return NextResponse.json(parsedContent)
  } catch (error) {
    console.error('Error generating content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 },
    )
  }
} 