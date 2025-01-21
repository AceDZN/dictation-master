'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { DictationGame } from '@/lib/types'
import { CreateDictationForm } from '@/components/dictation/CreateDictationForm'

interface DraftLoaderProps {
  draftId: string
}

export function DraftLoader({ draftId }: DraftLoaderProps) {
  const [draft, setDraft] = useState<DictationGame | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const response = await fetch(`/api/dictation/edit/${draftId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch draft')
        }
        const data = await response.json()
        setDraft(data)
      } catch (err) {
        toast.error('Draft not found')
        router.push('/profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDraft()
  }, [draftId, router])

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading draft...
      </div>
    )
  }

  if (!draft) {
    return null
  }

  return <CreateDictationForm initialData={draft} />
} 