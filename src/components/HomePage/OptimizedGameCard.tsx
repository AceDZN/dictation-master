import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Game } from '@/app/actions/dictation'
import { EyeIcon, PlayIcon } from '@heroicons/react/24/outline'
import { CardWrapper } from './CardWrapper'

interface OptimizedGameCardProps {
  game: Game
  delay?: number
}

function formatDate(timestamp: Game['createdAt']) {
  // Check if there's a toDate method and it's callable
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().toLocaleDateString()
    } catch (error) {
      console.error('Error calling toDate():', error)
    }
  }
  
  // If toDate fails or doesn't exist, try using _seconds
  if (timestamp && typeof timestamp._seconds === 'number') {
    return new Date(timestamp._seconds * 1000).toLocaleDateString()
  }
  
  // Last resort fallback
  return new Date().toLocaleDateString()
}

export async function OptimizedGameCard({ game, delay = 0 }: OptimizedGameCardProps) {
  const t = await getTranslations('Dictation.card')
  
  const formattedDate = formatDate(game.createdAt)
  
  // Prepare props for static content
  /*
  const staticProps = {
    title: game.title,
    description: game.description,
    languages: `${game.sourceLanguage} → ${game.targetLanguage}`,
    playCount: game.playCount || 0,
    wordCount: game.wordPairs.length,
    formattedDate,
    wordsText: t('words', { count: game.wordPairs.length }),
    createdText: t('created'),
    id: game.id,
    delay
  }*/
  
  // The majority of the card can be rendered on the server
  return (
    <CardWrapper delay={delay}>
      <div className="p-6">
        <div className="text-xl font-bold text-center mb-4">{game.title}</div>
        {game.description && <p className="text-gray-500 mb-4">{game.description}</p>}

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-gray-500">
            <div>
              {game.sourceLanguage} → {game.targetLanguage}
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              {game.playCount || 0}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('words', { count: game.wordPairs.length })}
          </div>
          <div className="text-xs text-gray-400">
            {t('created')} {formattedDate}
          </div>
          
          <Link 
            href={`/dictation/play/${game.id}`} 
            className="w-full mt-2 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            <span>Play</span>
          </Link>
        </div>
      </div>
    </CardWrapper>
  )
} 