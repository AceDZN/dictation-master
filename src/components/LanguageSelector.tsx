'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { setUserLocale } from '@/lib/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={t('select')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('en')}</SelectItem>
        <SelectItem value="he">{t('he')}</SelectItem>
      </SelectContent>
    </Select>
  )
}