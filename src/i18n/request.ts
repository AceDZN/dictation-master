import { getUserLocale } from '@/lib/locale';
import {getRequestConfig} from 'next-intl/server';
import { defaultLocale } from './config';


export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  let messages = null
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (error) {
    console.warn(`Could not load messages for locale: ${locale}, falling back to default locale: ${defaultLocale}`);
    console.error(error);
    messages = (await import(`../../messages/${defaultLocale}.json`)).default
  }
  return {
    locale,
    messages
  };
});