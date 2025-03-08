import { getGame } from '@/lib/game'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { getLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { DictationGame } from '@/lib/types'
import { BubbleShooterGameClient } from '@/components/dictation/BubbleShooterGameClient'

interface BubbleShooterGamePageProps {
  params: Promise<{ id: string }>
}

const getPlayDescription = async (locale: string, game: DictationGame) => {
  const locales = {
    en: `Play a fun bubble shooter game with ${game.targetLanguage} words: ${game.description}`,
    he: `שחק משחק בועות מהנה עם מילים ב-${game.targetLanguage}: ${game.description}`
  }
  return locales[locale as keyof typeof locales] as string
}

export async function generateMetadata({ params }: BubbleShooterGamePageProps): Promise<Metadata> {
  const { id: dictationId } = await params
  const locale = await getLocale()
  
  try {
    const game = await getGame(dictationId)
    const description = await getPlayDescription(locale, game)
    return generateSiteMetadata(locale, {
      title: `${game.title} - Bubble Shooter Game`,
      description,
      path: `/dictation/play/${dictationId}/bubble-shooter`,
      image: `/og/play-dictation.png`
    })
  } catch (error) {
    console.error(error)
    return generateSiteMetadata(locale, {})
  }
}

export default async function BubbleShooterGamePage({ params }: BubbleShooterGamePageProps) {
  const { id: dictationId } = await params
  
  try {
    const game = await getGame(dictationId)

    return (
      <div className="container mx-auto px-4 py-8">
        <BubbleShooterGameClient game={game} />
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