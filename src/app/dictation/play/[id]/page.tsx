import { GameContainer } from '@/components/dictation/GameContainer'
import { getGame } from '@/lib/game'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { getLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { DictationGame } from '@/lib/types'

interface PlayDictationPageProps {
  params: Promise<{ id: string }>
}
const getPlayDescription = async (locale: string, game: DictationGame) => {
  const locales =  {
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
    return generateSiteMetadata(locale, {})
  }
}

export default async function PlayDictationPage({ params }: PlayDictationPageProps) {
  const { id: dictationId } = await params
  
  try {
    const game = await getGame(dictationId)

    return (
      <div className="container mx-auto px-4 py-8">
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