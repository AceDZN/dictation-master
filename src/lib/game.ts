import { DictationGame } from './types'
import { cookies } from 'next/headers'

export async function getGame(id: string): Promise<DictationGame> {
  const cookieStore = await cookies()
  const response = await fetch(`${process.env.APP_URL}/api/dictation/play/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieStore.toString()
    },
    // This ensures the request is made from the server side
    cache: 'no-store',
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch game')
  }

  return response.json()
} 