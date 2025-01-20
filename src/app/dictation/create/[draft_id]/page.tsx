import { DraftLoader } from './DraftLoader'

interface CreateFromDraftPageProps {
  params: {
    draft_id: string
  }
}

export default function CreateFromDraftPage({ params }: CreateFromDraftPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Draft</h1>
          <p className="text-sm text-gray-500 mt-1">
            Continue working on your saved dictation game
          </p>
        </div>

        <DraftLoader draftId={params.draft_id} />
      </div>
    </div>
  )
} 