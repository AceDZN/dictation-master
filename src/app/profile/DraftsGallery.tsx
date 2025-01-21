'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { TrashIcon } from 'lucide-react'
import type { DictationGame } from '@/lib/types'

export function DraftsGallery() {
  const [drafts, setDrafts] = useState<DictationGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const savedId = searchParams.get('saved')

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch('/api/dictation/drafts')
        if (!response.ok) {
          throw new Error('Failed to fetch drafts')
        }
        const data = await response.json()
        setDrafts(data.drafts)
      } catch (err) {
        toast.error('Failed to load drafts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrafts()
  }, [])

  useEffect(() => {
    if (savedId) {
      toast.success('Draft saved successfully')
    }
  }, [savedId])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/dictation/edit/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      setDrafts(drafts.filter(d => d.id !== id))
      toast.success('Draft deleted')
    } catch (err) {
      toast.error('Failed to delete draft')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading drafts...
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No drafts saved yet
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map(draft => (
        <Card key={draft.id} className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg truncate">{draft.title || 'Untitled'}</h3>
            <p className="text-sm text-gray-500 truncate">{draft.description || 'No description'}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-500">Languages: </span>
              <span>{draft.sourceLanguage} → {draft.targetLanguage}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Words: </span>
              <span>{draft.wordPairs.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Last updated: </span>
              <span>{draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => router.push(`/dictation/create/${draft.id || ''}`)}
            >
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => draft.id && handleDelete(draft.id)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 