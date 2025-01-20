import { WordPair } from './types'

export async function parseWordPairsFile(file: File): Promise<{ wordPairs: WordPair[], error?: string }> {
  try {
    const text = await file.text()
    const lines = text.split('\n')
    const wordPairs: WordPair[] = []

    // Skip header row if CSV
    const startIndex = file.type === 'text/csv' ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      let parts: string[]
      if (file.type === 'text/csv') {
        // Handle CSV format (source_word,target_word,example_sentence)
        parts = line.split(',').map(part => part.trim())
      } else {
        // Handle TXT format (source_word\ttarget_word\texample_sentence)
        parts = line.split('\t').map(part => part.trim())
      }

      if (parts.length < 2) {
        return { 
          wordPairs: [], 
          error: `Invalid format at line ${i + 1}. Each line must have at least two words.` 
        }
      }

      wordPairs.push({
        first: parts[0],
        second: parts[1],
        sentence: parts[2] || ''
      })
    }

    if (wordPairs.length === 0) {
      return { wordPairs: [], error: 'No valid word pairs found in file' }
    }

    if (wordPairs.length > 50) {
      return { wordPairs: [], error: 'Maximum of 50 word pairs allowed' }
    }

    return { wordPairs }
  } catch (error) {
    console.error('Error parsing file:', error)
    return { wordPairs: [], error: 'Failed to parse file' }
  }
} 