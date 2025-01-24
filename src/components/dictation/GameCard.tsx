import { EyeIcon, PlayIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Game } from '@/app/actions/dictation'
import { GameCardActions } from '@/components/dictation/GameCardActions'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function GameCard({ 
  id, 
  title, 
  description, 
  sourceLanguage, 
  targetLanguage, 
  wordPairs, 
  createdAt,
  isPublic,
  playCount = 0,
}: Game) {
  return (
    <div>
      {isPublic ? (
        <GameCardContent
          title={title}
          description={description}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          wordPairs={wordPairs}
          createdAt={createdAt}
          isPublic={isPublic}
          playCount={playCount}
          actions={
            <div className="flex gap-2 mt-4">
              <Link href={`/dictation/play/${id}`}>
                <Button 
                  variant="default"
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <GameCardContent
          title={title}
          description={description}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          wordPairs={wordPairs}
          createdAt={createdAt}
          isPublic={isPublic}
          playCount={playCount}
          actions={
            <GameCardActions id={id} />
          }
        />
      )}
    </div>
  )
}

interface GameCardContentProps extends Omit<Game, 'id'> {
  actions?: React.ReactNode
}

function GameCardContent({
  title,
  description,
  sourceLanguage,
  targetLanguage,
  wordPairs,
  createdAt,
  isPublic,
  playCount = 0,
  actions
}: GameCardContentProps) {
  const t = useTranslations('Dictation.card')
  const formatDate = (timestamp: Game['createdAt']) => {
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString()
    }
    // Handle raw timestamp
    return new Date(timestamp._seconds * 1000).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-gray-500">
            <div>
              {sourceLanguage} → {targetLanguage}
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="h-4 w-4" />
              {playCount}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('words', { count: wordPairs.length })}
          </div>
          <div className="text-xs text-gray-400">
            {t('created')} {formatDate(createdAt)}
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  )
} 