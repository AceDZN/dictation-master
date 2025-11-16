import { GameContainer } from '@/components/dictation/GameContainer'
import { GameShareButton } from '@/components/dictation/GameShare'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { getGame } from '@/lib/game'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { DictationGame } from '@/lib/types'
import Link from 'next/link'
import { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

interface PlayDictationPageProps {
  params: Promise<{ id: string }>
}
const getPlayDescription = async (locale: string, game: DictationGame) => {
  const locales = {
    en: `Practice your ${game.targetLanguage} skills with this dictation exercise: ${game.description}`,
    he: `תרגל את כישורי ה-${game.targetLanguage} שלך עם תרגיל ההכתבה הזה: ${game.description}`
  }
  return locales[locale as keyof typeof locales] as string
}


export async function generateMetadata({ params }: PlayDictationPageProps): Promise<Metadata> {
  const { id: dictationId } = await params
  const locale = await getLocale()

  try {
    const game = await getGame(dictationId)
    const description = await getPlayDescription(locale, game)
    return generateSiteMetadata(locale, {
      title: game.title,
      description,
      path: `/dictation/play/${dictationId}`,
      image: `/og/play-dictation.png` // Dynamic OG image endpoint we'll create later
    })
  } catch (error) {
    console.error(error)
    return generateSiteMetadata(locale, {})
  }
}

export default async function PlayDictationPage({ params }: PlayDictationPageProps) {
  const { id: dictationId } = await params
  const cardTranslations = await getTranslations('Dictation.card')
  const session = await auth()

  try {
    const game = await getGame(dictationId)
    const isOwner = session?.user?.id === game.userId
    const editHref = `/dictation/edit/${game.id ?? dictationId}`

    return (

      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 border border-gray-100 relative overflow-hidden">
            <div className="flex flex-wrap justify-end gap-3 mb-4 sm:mb-6">
              {isOwner && (
                <Button
                  asChild
                  variant="outline"
                  className="rounded-lg border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <Link href={editHref}>
                    {cardTranslations('edit')}
                  </Link>
                </Button>
              )}
              <GameShareButton
                id={game.id ?? dictationId}
                title={game.title}
                description={game.description}
                label={cardTranslations('share')}
                className="h-10"
              />
            </div>
            <GameContainer game={game} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 border border-gray-100 relative overflow-hidden">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error instanceof Error ? error.message : 'Failed to load game'}
            </div>
          </div>
        </div>
      </div>
    )
  }
} 