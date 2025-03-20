'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { setUserLocale } from '@/lib/locale'
import { Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select"

export function LanguageSelector() {
  const t = useTranslations('Language')
  const router = useRouter()

  const handleLanguageChange = async (value: string) => {
    await setUserLocale(value as 'en' | 'he')
    router.refresh()
  }

  return (
    <Select onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-12 text-center p-0" aria-label={t('language')} placeholder={t('language')} text={t('language')}>
        <Globe className="h-4 w-full" />
        
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('en')}</SelectItem>
        <SelectItem value="he">{t('he')}</SelectItem>
      </SelectContent>
    </Select>
  )
}