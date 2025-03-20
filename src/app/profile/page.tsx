import { GameCard } from '@/components/dictation/GameCard'
import { getGames, type Game } from '@/app/actions/dictation'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PencilIcon, RocketLaunchIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
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
    <>
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 relative overflow-hidden">
            
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                {session.user.name}
              </h1>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="gap-2 rounded-lg border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                  <PencilIcon className="h-4 w-4" />
                  {t('editProfile')}
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-8">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">{t('email')}:</span> {session.user.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">{t('gamesCreated')}:</span> {games.length}
              </div>
            </div>
          </div>
          
          {/* Published Games Section */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <RocketLaunchIcon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('publishedGames')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedGames.map((game: Game) => (
                <GameCard key={game.id} {...game} />
              ))}
              {publishedGames.length === 0 && (
                <div className="col-span-full bg-gray-50 rounded-2xl border border-gray-100 py-12 px-6 text-center">
                  <p className="text-gray-500 mb-4">{t('noPublishedGames')}</p>
                  <Link href="/dictation/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg transition-all">
                      Create Your First Game
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Draft Games Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <DocumentDuplicateIcon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('draftGames')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {draftGames.map((game: Game) => (
                <GameCard 
                  key={game.id} 
                  {...game}
                />
              ))}
              {draftGames.length === 0 && (
                <div className="col-span-full bg-gray-50 rounded-2xl border border-gray-100 py-12 px-6 text-center">
                  <p className="text-gray-500">{t('noDraftGames')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
  )
} 