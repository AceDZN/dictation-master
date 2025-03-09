'use server';

import {cookies} from 'next/headers';
import {Locale, defaultLocale, locales} from '@/i18n/config';

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const cookieStore = await cookies();
  const userLocale = cookieStore.get(COOKIE_NAME)?.value || defaultLocale;
  
  // If the exact locale is supported, use it
  if (locales.includes(userLocale as Locale)) {
    return userLocale;
  }
  
  // Otherwise, try to find a base locale match (e.g., 'en-gb' -> 'en')
  const baseLocale = userLocale.split('-')[0];
  if (locales.includes(baseLocale as Locale)) {
    return baseLocale;
  }
  
  // If no match is found, fallback to the default locale
  return defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}