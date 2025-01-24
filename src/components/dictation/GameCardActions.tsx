'use client'

import { Button } from '@/components/ui/button'
import { TrashIcon } from '@heroicons/react/24/outline'
import { deleteGame } from '@/app/actions/dictation'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface GameCardActionsProps {
  id: string
}

export function GameCardActions({ id }: GameCardActionsProps) {
  const router = useRouter()
  const t = useTranslations('Dictation.card')

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

  return (
    <div className="flex gap-2 mt-4">
      <Button 
        variant="default" 
        className="flex-1"
        onClick={() => {
          router.push(`/dictation/edit/${id}`)
        }}
      >
        {t('edit')}
      </Button>
      <Button 
        variant="destructive" 
        size="icon"
        onClick={handleDelete}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
} 