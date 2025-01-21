import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { EditDictationForm } from '@/components/dictation/EditDictationForm'

interface EditDictationPageProps {
  params: {
    id: string
  }
}

export default async function EditDictationPage({ params }: EditDictationPageProps) {
  const { id:dictationId } = await params
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Dictation</h1>
      <Suspense fallback={<div className="flex justify-center"><Spinner size="lg" /></div>}>
        <EditDictationForm id={dictationId} />
      </Suspense>
    </div>
  )
} 