import { GameContainer } from '@/components/dictation/GameContainer'
import { getGame } from '@/lib/game'

interface PlayDictationPageProps {
  params: {
    id: string
  }
}

export default async function PlayDictationPage({ params }: PlayDictationPageProps) {
  const { id: dictationId } = await params
  
  try {
    const game = await getGame(dictationId)

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">{game.title}</h1>
        <GameContainer game={game} />
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error instanceof Error ? error.message : 'Failed to load game'}
        </div>
      </div>
    )
  }
} 