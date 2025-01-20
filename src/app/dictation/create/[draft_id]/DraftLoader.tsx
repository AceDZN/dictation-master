'use client'

import { useEffect, useState } from 'react'
import { CreateDictationForm } from '@/components/dictation/CreateDictationForm'
import { getDraft } from '@/lib/draft-storage'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DraftLoaderProps {
  draftId: string
}

export function DraftLoader({ draftId }: DraftLoaderProps) {
  const [draft, setDraft] = useState<ReturnType<typeof getDraft>>(null)
  const router = useRouter()

  useEffect(() => {
    const draftData = getDraft(draftId)
    if (!draftData) {
      toast.error('Draft not found')
      router.push('/profile')
      return
    }
    setDraft(draftData)
  }, [draftId, router])

  if (!draft) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading draft...
      </div>
    )
  }

  return <CreateDictationForm initialData={draft} />
} 