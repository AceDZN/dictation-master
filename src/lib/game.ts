import { APP_URL } from './server-constants'
import { DictationGame } from './types'
import { cookies } from 'next/headers'

export async function getGame(id: string): Promise<DictationGame> {
  const cookieStore = await cookies()
  const gamePlayUrl = `${APP_URL}/api/dictation/play/${id}`

  try {
    const response = await fetch(gamePlayUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieStore.toString()
      },
      cache: 'no-store',
    })
  
    if (!response.ok) {
      throw new Error('Failed to fetch game')
    }
    const game = await response.json()
    
    return game
  } catch (error) {
    console.error('Error fetching game:', error)
    throw new Error(`Failed to fetch game ${APP_URL}/api/dictation/play/${id}`)
  }
} 