'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  PlayIcon,
  ShareIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteGame } from '@/app/actions/dictation'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useGameShare } from './GameShare'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GameCardActionsProps {
  id: string
  userId?: string
  title: string
  description?: string
}

export function GameCardActions({ id, userId, title, description }: GameCardActionsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isOwner = session?.user?.id === userId
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const t = useTranslations('Dictation.card')
  const { handleShareClick, shareDialog } = useGameShare({ id, title, description })

  useEffect(() => {
    // Set isLoading to false after component mounts
    setIsLoading(false)
  }, [])

  const handleDeleteClick = () => {
    // Small delay to ensure dropdown closes before dialog opens
    setTimeout(() => {
      setIsConfirmOpen(true)
    }, 100)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const success = await deleteGame(id)
      if (success) {
        toast.success(t('deleteSuccess'))
        setIsConfirmOpen(false)
        router.refresh()
      } else {
        toast.error(t('deleteError'))
      }
    } catch (err) {
      console.error('Failed to delete game:', err)
      toast.error(t('deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!isDeleting) {
      setIsConfirmOpen(open)
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-2 mt-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0 rounded-lg border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg shadow-lg border-gray-100">
              <DropdownMenuItem
                onSelect={handleShareClick}
                className="hover:bg-indigo-50 flex items-center gap-2"
              >
                <ShareIcon className="h-4 w-4 text-indigo-500" />
                <span>{t('share')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dictation/edit/${id}`)}
                className="hover:bg-indigo-50 flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4 text-indigo-500" />
                <span>{t('edit')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDeleteClick}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" />
                <span>{t('delete')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            className="h-10 flex-shrink-0 rounded-lg border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 flex items-center justify-center gap-2 px-4"
            onClick={handleShareClick}
          >
            <ShareIcon className="h-4 w-4" />
            {t('share')}
          </Button>
        )}

        <Link href={`/dictation/play/${id}`} className="flex-1">
          <Button className="w-full h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-md hover:shadow-lg text-white font-medium">
            <PlayIcon className="h-4 w-4 mr-2" />
            {t('play')}
          </Button>
        </Link>
        {shareDialog}
      </div>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={handleDialogClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('deleteConfirmDescription', { title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isDeleting}
            >
              {t('deleteConfirmCancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {t('deleteConfirmAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}