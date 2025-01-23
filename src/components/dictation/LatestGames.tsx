import { GameCard } from '@/components/dictation/GameCard'
import { Game } from '@/app/actions/dictation'
import { APP_URL } from '@/lib/server-constants'

interface FirebaseTimestamp {
  _seconds: number
  _nanoseconds: number
}

interface APIGame extends Omit<Game, 'createdAt'> {
  createdAt: FirebaseTimestamp
}

async function getLatestGames(): Promise<Game[]> {
  const response = await fetch(`${APP_URL}/api/dictation/latest`, {
    cache: 'no-store'
  })
  console.log('response', response,`${APP_URL}/api/dictation/latest`)
  if (!response.ok) {
    throw new Error('Failed to fetch latest games')
  }
  const data = await response.json()
  return data.games.map((game: APIGame) => ({
    ...game,
    createdAt: {
      toDate: () => new Date(game.createdAt._seconds * 1000)
    }
  }))
}

export async function LatestGames() {
  const games = await getLatestGames()
  console.log('games', games)
  if (!games.length) {
    return null
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Latest Dictation Games
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Check out the most recent public dictation games created by our community.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </section>
  )
} 