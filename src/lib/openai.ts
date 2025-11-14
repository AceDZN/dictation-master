'use server'

import OpenAI from 'openai'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 55000, // 55 seconds timeout
  maxRetries: 2, // Limit retries to avoid hitting the timeout
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
export type WordPairsList = z.infer<typeof WordPairsList>

const normalizeWordPairsList = (data: WordPairsList): WordPairsList => {
  return {
    ...data,
    wordPairs: data.wordPairs.map(pair => ({
      ...pair,
      sentence: pair.secondSentence || pair.sentence || ''
    }))
  }
}

export async function extractWordPairsFromImage(
  base64Image: string,
  firstLanguage: string,
  secondLanguage: string,
): Promise<WordPairsList> {
  // Remove the data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  
  const imagePrompt = `Extract word pairs from the image. For each pair include:
- "first": the ${firstLanguage} word exactly as it appears
- "second": the ${secondLanguage} translation
- "firstSentence": a natural ${firstLanguage} sentence that uses the ${firstLanguage} word
- "secondSentence": a natural ${secondLanguage} sentence that uses the ${secondLanguage} word
- "imagePrompt": an English prompt that helps visualize the concept.
Use exact words if present. Translate only if a translation is missing. Include multiple ${firstLanguage} words if they map to one ${secondLanguage} word when necessary. Double-check that all relevant words are captured. If a word exists only in one language, include it and translate it to the other language. Also add a relevant title and engaging description in ${firstLanguage}, keeping them SEO-friendly. Return strict JSON.` 
  //console.log('extractWordPairsFromImage',{ firstLanguage, secondLanguage, imagePrompt })
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    response_format: zodResponseFormat(WordPairsList, 'word_pairs'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: imagePrompt,
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
    return normalizeWordPairsList(result)
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
        content: `Extract word pairs from the following text. For each pair provide:
- "first": ${firstLanguage} word exactly as in the text
- "second": ${secondLanguage} translation
- "firstSentence": ${firstLanguage} sentence using the ${firstLanguage} word
- "secondSentence": ${secondLanguage} sentence using the ${secondLanguage} word
- "imagePrompt": English visual prompt.
Use exact wording where possible, translating only when missing. Include multiple ${firstLanguage} words if needed for one ${secondLanguage} term. Keep a relevant, catchy, SEO-friendly title and description in ${firstLanguage}.

Text:
${text}`,
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
    return normalizeWordPairsList(result)
  } catch (error) {
    console.error('Error parsing OpenAI response:', error)
    throw new Error('Failed to parse word pairs from the text')
  }
} 