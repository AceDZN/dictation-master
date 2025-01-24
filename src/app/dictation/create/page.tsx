import { DictationForm } from "@/components/dictation/DictationForm"
import { getTranslations } from 'next-intl/server'

interface CreateDictationPageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function CreateDictationPage({ searchParams }: CreateDictationPageProps) {
  await searchParams // Need to await even if not using to comply with Next.js 15
  const t = await getTranslations('Dictation.create')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('description')}
          </p>
        </div>

        <DictationForm />
      </div>
    </div>
  )
} 