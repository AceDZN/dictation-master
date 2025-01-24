export type Locale = (typeof locales)[number];

export const locales = ['en', 'he'] as const;
export const defaultLocale: Locale = 'en';