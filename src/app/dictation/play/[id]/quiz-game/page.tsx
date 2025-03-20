import { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { getGame } from '@/lib/game'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { QuizGameClient } from '@/components/dictation/QuizGameClient'
import { DictationGame } from '@/lib/types'

interface QuizGamePageProps {
  params: Promise<{ id: string }>
}

// Get localized play description
const getPlayDescription = async (locale: string, game: DictationGame) => {
  const locales = {
    en: `Test your knowledge of ${game.targetLanguage} vocabulary with this quiz: ${game.description}`,
    he: `בחן את הידע שלך במילות ה-${game.targetLanguage} עם החידון הזה: ${game.description}`
  }
  return locales[locale as keyof typeof locales] as string
}

export async function generateMetadata({ params }: QuizGamePageProps): Promise<Metadata> {
  const { id: dictationId } = await params
  const locale = await getLocale()
  
  try {
    const game = await getGame(dictationId)
    const description = await getPlayDescription(locale, game)
    return generateSiteMetadata(locale, {
      title: `${game.title} - Quiz Game`,
      description,
      path: `/dictation/play/${dictationId}/quiz-game`,
      image: `/og/play-dictation.png`
    })
  } catch (error) {
    console.error(error)
    return generateSiteMetadata(locale, {})
  }
}

export default async function QuizGamePage({ params }: QuizGamePageProps) {
  const { id: dictationId } = await params
  
  try {
    const game = await getGame(dictationId)

    return (
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <QuizGameClient game={game} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 relative overflow-hidden">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error instanceof Error ? error.message : 'Failed to load game'}
            </div>
          </div>
        </div>
      </div>
    )
  }
} 