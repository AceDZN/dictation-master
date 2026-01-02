import { APP_URL } from '@/lib/server-constants'

/**
 * Get TTS URLs for a list of words using the TTS endpoint
 * @param words Array of words to generate TTS for
 * @param language Language code for TTS generation
 * @returns Record mapping each word to its TTS URL
 */
export async function getTTSUrls(words: string[], language: string): Promise<Record<string, string>> {
  const url = `${APP_URL}/api/dictation/tts`
  console.log('getTTSUrls', { words, language, url })
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ words, language })
  })
  console.log('response', response)
  const data = await response.json()
  if (!data.success) {
    throw new Error('Failed to generate TTS')
  }

  // Create a map of word to URL
  return data.results.reduce((acc: Record<string, string>, item: { word: string, url: string }) => {
    acc[item.word] = item.url
    return acc
  }, {})
} 