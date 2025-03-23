'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTranslations } from 'next-intl'

const LANGUAGES = [
  'English',
  'Hebrew',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic'
] as const

interface LanguageSelectorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  excludeLanguage?: string
  error?: string
  disabled?: boolean
}

export function LanguageSelector({
  id,
  label,
  value,
  onChange,
  excludeLanguage,
  error,
  disabled = false
}: LanguageSelectorProps) {
  const t = useTranslations('Language')

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} label={label} placeholder={label} text={label}>
          <SelectValue>{t(`languages.${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.filter(lang => lang !== excludeLanguage).map((language) => (
            <SelectItem key={language} value={language}>
              {t(`languages.${language}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
} 