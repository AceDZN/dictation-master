import { GameCard } from '@/components/dictation/GameCard'
import { getGames, type Game } from '@/app/actions/dictation'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PencilIcon } from '@heroicons/react/24/outline'
import { getTranslations } from 'next-intl/server'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/api/auth/signin')
  }
  
  const games = await getGames()
  const t = await getTranslations('Profile')

  const publishedGames = games.filter((game: Game) => game.isPublic)
  const draftGames = games.filter((game: Game) => !game.isPublic)

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href="/profile/edit">
          <Button variant="outline" size="sm" className="gap-2">
            <PencilIcon className="h-4 w-4" />
            {t('editProfile')}
          </Button>
        </Link>
      </div>
      
      {/* Published Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('publishedGames')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedGames.map((game: Game) => (
            <GameCard key={game.id} {...game} />
          ))}
          {publishedGames.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t('noPublishedGames')}
            </div>
          )}
        </div>
      </div>

      {/* Draft Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('draftGames')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draftGames.map((game: Game) => (
            <GameCard 
              key={game.id} 
              {...game}
            />
          ))}
          {draftGames.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              {t('noDraftGames')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 