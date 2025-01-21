import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Game } from '@/app/actions/dictation'
import { GameCardActions } from './GameCardActions'

interface GameCardProps extends Game {}

export function GameCard({ 
  id, 
  title, 
  description, 
  sourceLanguage, 
  targetLanguage, 
  wordPairs, 
  createdAt, 
  isPublic,
}: GameCardProps) {
  return (
    <div>
      {isPublic ? (
        <Link href={`/dictation/edit/${id}`}>
          <GameCardContent
            title={title}
            description={description}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguage}
            wordPairs={wordPairs}
            createdAt={createdAt}
            isPublic={isPublic}
          />
        </Link>
      ) : (
        <GameCardContent
          title={title}
          description={description}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          wordPairs={wordPairs}
          createdAt={createdAt}
          isPublic={isPublic}
          actions={<GameCardActions id={id} />}
        />
      )}
    </div>
  )
}

interface GameCardContentProps extends Omit<GameCardProps, 'id'> {
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
  actions
}: GameCardContentProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isPublic && <EyeIcon className="h-5 w-5 text-gray-500" />}
        </div>
        <CardDescription>
          {description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          <div>Words: {wordPairs.length}</div>
          <div>From: {sourceLanguage}</div>
          <div>To: {targetLanguage}</div>
          {createdAt?.toDate && (
            <div className="text-xs mt-2">
              Created: {new Date(createdAt.toDate()).toLocaleDateString()}
            </div>
          )}
        </div>
        {actions}
      </CardContent>
    </Card>
  )
} 