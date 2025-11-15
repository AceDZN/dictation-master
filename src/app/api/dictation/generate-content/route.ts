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
    const { sourceLanguage = 'Hebrew', targetLanguage = 'English', wordPairs = [], title = 'NO TITLE', description = 'NO DESCRIPTION' } = RequestSchema.parse(body)

    // Build prompt with existing data, marking what needs to be generated
    const wordPairsWithStatus = wordPairs.map((pair, index) => {
      const needsFirstSentence = !pair.firstSentence || pair.firstSentence.trim().length === 0
      const needsSecondSentence = !pair.secondSentence || pair.secondSentence.trim().length === 0
      const needsTranslation = !pair.first || !pair.second

      return {
        index,
        first: pair.first || '',
        second: pair.second || '',
        existingFirstSentence: pair.firstSentence || '',
        existingSecondSentence: pair.secondSentence || pair.sentence || '',
        needsFirstSentence,
        needsSecondSentence,
        needsTranslation,
      }
    })

    const needsTitle = !title || title === 'NO TITLE' || title.trim().length < 3
    const needsDescription = !description || description === 'NO DESCRIPTION' || description.trim().length === 0

    const prompt = `You are helping to populate missing data for a dictation game between ${sourceLanguage} and ${targetLanguage}.

${needsTitle ? `Generate a catchy, SEO-friendly title in ${sourceLanguage}.` : `Use the existing title: "${title}"`}
${needsDescription ? `Generate a helpful description in ${sourceLanguage} that describes what learners will practice.` : `Use the existing description: "${description}"`}

For each word pair below, ONLY generate what is marked as missing. Preserve existing sentences exactly as provided.

Word pairs:
${wordPairsWithStatus.map(pair => {
      let pairInfo = `${pair.index + 1}. ${pair.first || '[MISSING]'} - ${pair.second || '[MISSING]'}`
      if (pair.needsTranslation) {
        pairInfo += '\n   → NEEDS: Complete missing translation'
      }
      if (pair.existingFirstSentence) {
        pairInfo += `\n   → Existing ${sourceLanguage} sentence: "${pair.existingFirstSentence}"`
      } else if (pair.needsFirstSentence) {
        pairInfo += `\n   → NEEDS: Generate ${sourceLanguage} example sentence using "${pair.first}"`
      }
      if (pair.existingSecondSentence) {
        pairInfo += `\n   → Existing ${targetLanguage} sentence: "${pair.existingSecondSentence}"`
      } else if (pair.needsSecondSentence) {
        pairInfo += `\n   → NEEDS: Generate ${targetLanguage} example sentence using "${pair.second}"`
      }
      pairInfo += '\n   → NEEDS: Generate English imagePrompt for visualization'
      return pairInfo
    }).join('\n\n')}

CRITICAL: Return strict JSON matching the schema. For each word pair:
- If an existing sentence is shown above, you MUST use that exact sentence in your response (do NOT generate a new one)
- Only generate sentences for items marked "NEEDS: Generate"
- Always generate imagePrompt for visualization
- Set sentence field to match secondSentence
- Preserve the exact order - pair 1 in your response must match pair 1 in the input, etc.
- If a translation is missing (marked [MISSING]), generate the missing word`

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

    // Merge generated content with existing data, preserving existing sentences
    const mergedWordPairs = wordPairs.map((existingPair, index) => {
      const generatedPair = parsedContent.wordPairs[index]
      if (!generatedPair) {
        return existingPair
      }

      // Preserve existing sentences if they exist, otherwise use generated ones
      const existingFirstSentence = existingPair.firstSentence?.trim()
      const existingSecondSentence = existingPair.secondSentence?.trim() || existingPair.sentence?.trim()

      return {
        first: existingPair.first || generatedPair.first || '',
        second: existingPair.second || generatedPair.second || '',
        firstSentence: existingFirstSentence || generatedPair.firstSentence || '',
        secondSentence: existingSecondSentence || generatedPair.secondSentence || '',
        sentence: existingSecondSentence || generatedPair.secondSentence || generatedPair.sentence || '',
        firstAudioUrl: existingPair.firstAudioUrl,
        secondAudioUrl: existingPair.secondAudioUrl,
        imagePrompt: generatedPair.imagePrompt || '',
      }
    })

    const normalizedContent = {
      title: needsTitle ? parsedContent.title : title,
      description: needsDescription ? parsedContent.description : description,
      wordPairs: mergedWordPairs,
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