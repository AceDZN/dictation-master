import { DictationForm } from "@/components/dictation/DictationForm"
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { getTranslations, getLocale } from 'next-intl/server'
import { Metadata } from 'next'

interface CreateDictationPageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

const getCreateTitle = (locale: string) => {
  const locales =  {
    en: 'Create New Dictation',
    he: 'צור תרגיל הכתבה חדש'
  }
  return locales[locale as keyof typeof locales] as string
}

const getCreateDescription = (locale: string) => {
  const locales =  {
    en: 'Create a new dictation exercise to help others learn languages through interactive text-based learning.',
    he: `צור תרגיל הכתבה חדש כדי לעזור לאחרים ללמוד שפות דרך למידה אינטראקטיבית מבוססת טקסט.`
  }
  return locales[locale as keyof typeof locales] as string
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSiteMetadata(locale, {
    title: getCreateTitle(locale),
    description: getCreateDescription(locale),
    path: '/dictation/create',
    image: '/og/create-dictation.png' // Static image for create page
  })
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