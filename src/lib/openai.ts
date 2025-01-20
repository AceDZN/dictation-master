'use server'

import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { WordPair } from '@/lib/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})


const WordPairsList = z.object({
  title: z.string(),
  description: z.string(),
  wordPairs: z.array(
    z.object({
      first: z.string(),
      second: z.string(),
      sentence: z.string(),
      imagePrompt: z.string(),
    }),
  ),
})
export type WordPairsList = z.infer<typeof WordPairsList>

export async function extractWordPairsFromImage(
  base64Image: string,
  firstLanguage: string,
  secondLanguage: string,
): Promise<WordPairsList> {
  // Remove the data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  console.log('extractWordPairsFromImage',{ firstLanguage, secondLanguage })
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    response_format: zodResponseFormat(WordPairsList, 'word_pairs'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract word pairs from image. For each: 'first' in ${firstLanguage}, 'second' in ${secondLanguage}, ${secondLanguage} 'sentence' using word, 'imagePrompt' (always in English) for visualization. Use exact words if present. Only translate if no translation found. Include multiple ${firstLanguage} words if given for one ${secondLanguage} word. make sure to use the words exactly as they appear in the image. Return JSON array. double check that you have all the words, no matter how much words are in the image. If you are not sure, Check the image again. if there are words only in one of the specified languages, make sure to use and TRANSLATE the words to the other language. Also, add a title and description which are related to the words in the image.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    max_tokens: 3500,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content in the response')
  }

  try {
    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error('Error parsing OpenAI response:', error)
    throw new Error('Failed to parse word pairs from the image')
  }
}

export async function extractWordPairsFromText(
  text: string,
  firstLanguage: string,
  secondLanguage: string,
): Promise<WordPairsList> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    response_format: zodResponseFormat(WordPairsList, 'word_pairs'),
    messages: [
      {
        role: 'user',
        content: `Extract word pairs from the following text. For each pair: 'first' in ${firstLanguage}, 'second' in ${secondLanguage}, ${secondLanguage} 'sentence' using the word, 'imagePrompt' (always in English) for visualization. Use exact words if present. Only translate if no translation is given. Include multiple ${firstLanguage} words if given for one ${secondLanguage} word. Make sure to use the words exactly as they appear in the text. Also, add a title and description which are related to the words in the text.\n\nText:\n${text}`,
      },
    ],
    max_tokens: 3500,
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No content in the response')
  }

  try {
    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error('Error parsing OpenAI response:', error)
    throw new Error('Failed to parse word pairs from the text')
  }
} 