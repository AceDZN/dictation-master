import type { CreateDictationInput } from '@/app/actions/dictation'

const DRAFT_PREFIX = 'dictation_draft_'

export interface DraftDictation extends CreateDictationInput {
  id: string
  updatedAt: string
  isPublic?: boolean
}

export function saveDraft(data: CreateDictationInput): DraftDictation {
  const id = data.id || crypto.randomUUID()
  const draft: DraftDictation = {
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }

  localStorage.setItem(DRAFT_PREFIX + id, JSON.stringify(draft))
  return draft
}

export function getDraft(id: string): DraftDictation | null {
  const data = localStorage.getItem(DRAFT_PREFIX + id)
  return data ? JSON.parse(data) : null
}

export function getAllDrafts(): DraftDictation[] {
  const drafts: DraftDictation[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(DRAFT_PREFIX)) {
      const data = localStorage.getItem(key)
      if (data) {
        drafts.push(JSON.parse(data))
      }
    }
  }
  return drafts.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function deleteDraft(id: string): void {
  localStorage.removeItem(DRAFT_PREFIX + id)
} 