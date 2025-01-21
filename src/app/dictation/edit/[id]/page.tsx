import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { DictationForm } from '@/components/dictation/DictationForm'

interface EditDictationPageProps {
  params: {
    id: string
  }
}

export default async function EditDictationPage({ params }: EditDictationPageProps) {
  const { id:dictationId } = await params
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Dictation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit your dictation game
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center"><Spinner size="lg" /></div>}>
          <DictationForm id={dictationId} />
        </Suspense>
      </div>
    </div>
  )
} 