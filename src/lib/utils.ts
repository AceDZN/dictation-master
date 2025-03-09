import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SUPPORTED_LANGUAGES = [
  { code: 'he', name: 'Hebrew' },
  { code: 'en', name: 'English' },
  /*
  { code: 'zh', name: 'Mandarin Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'id', name: 'Indonesian' },
  */
] as const

export function getLanguageNameFromCode(code: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
  return language?.name || code
}

export function getLanguageCodeFromName(name: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.name === name)
  return language?.code || name
}
