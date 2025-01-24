import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { DictationForm } from '@/components/dictation/DictationForm'
import { getTranslations } from 'next-intl/server'

interface EditDictationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDictationPage({ params }: EditDictationPageProps) {
  const { id: dictationId } = await params
  const t = await getTranslations('Dictation.edit')
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('description')}
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center"><Spinner size="lg" /></div>}>
          <DictationForm id={dictationId} />
        </Suspense>
      </div>
    </div>
  )
} 