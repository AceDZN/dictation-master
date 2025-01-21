import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ElementType, ComponentProps } from 'react'

interface GameCardProps {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: any[]
  createdAt: { toDate: () => Date }
  isPublic: boolean
  onDelete?: (id: string) => void
}

export function GameCard({ 
  id, 
  title, 
  description, 
  sourceLanguage, 
  targetLanguage, 
  wordPairs, 
  createdAt, 
  isPublic,
  onDelete 
}: GameCardProps) {
  const CardWrapper: ElementType = isPublic ? Link : 'div'
  const wrapperProps = isPublic ? { href: `/dictation/edit/${id}` as string } : {}

  return (
    <CardWrapper {...(wrapperProps as ComponentProps<ElementType>)}>
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
          {!isPublic && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="default" 
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/dictation/edit/${id}`
                }}
              >
                Edit
              </Button>
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete(id)
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </CardWrapper>
  )
} 