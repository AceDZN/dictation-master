'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EyeIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { deleteGame } from '@/app/actions/dictation'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Game {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: Array<{
    first: string
    second: string
    sentence?: string
  }>
  createdAt: {
    _seconds: number
    _nanoseconds: number
    toDate?: () => Date
  }
  isPublic?: boolean
  playCount?: number
  userId?: string
}

export function GameCardClient(props: Game) {
  const { 
    id, 
    title, 
    description, 
    sourceLanguage, 
    targetLanguage, 
    wordPairs, 
    createdAt,
    isPublic,
    playCount = 0,
    userId 
  } = props;
  
  const router = useRouter();
  const { data: session } = useSession();
  const isOwner = session?.user?.id === userId;
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set isLoading to false after component mounts
    setIsLoading(false);
  }, []);
  
  const t = useTranslations('Dictation.card')
  
  const formatDate = (timestamp: Game['createdAt']) => {
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

  const handleDelete = async () => {
    try {
      const success = await deleteGame(id)
      if (success) {
        toast.success('Game deleted successfully')
        router.refresh()
      } else {
        toast.error('Failed to delete game')
      }
    } catch (err) {
      toast.error('Failed to delete game: '+err)
    }
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-4"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-9 bg-gray-200 rounded animate-pulse flex-1"></div>
            <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="relative">
        {isOwner && (
            <div className="absolute top-0 left-0">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVerticalIcon className="h-8 w-8" />
                    <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dictation/edit/${id}`)}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    <span>{t('edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <TrashIcon className="h-4 w-4 mr-2" />
                    <span>{t('delete')}</span>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            )}
      <CardHeader>
        <div className="flex justify-between items-start relative">
          <div>
            {isOwner ? isPublic ? (
              <span className="flex items-center gap-1.5 text-green-600 text-xs absolute -top-6 -right-6">
                <span className="h-3 w-3 bg-green-600 rounded-tl-none rounded-b-none rounded-tr-lg rounded-bl-lg"></span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-red-600  text-xs absolute  -top-6 -right-6">
                <span className="h-3 w-3 bg-red-600 rounded-tl-none rounded-b-none rounded-tr-lg rounded-bl-lg"></span>
              </span>
            ) : null}
             
            <CardTitle className="text-xl font-bold text-center mb-4">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
         
        </div>
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
          <Link href={`/dictation/play/${id}`} className="w-full mt-2">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <PlayIcon className="h-4 w-4 mr-2" />
              Play
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 