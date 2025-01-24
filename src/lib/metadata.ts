import { Metadata } from 'next'

export const defaultMetadata = {
  en: {
    title: 'Dictation Master',
    description: 'Create and manage language learning games through dictation exercises. Enhance your language skills with interactive audio-based learning.',
    keywords: ['language learning', 'dictation', 'education', 'audio learning', 'vocabulary practice'],
  },
  he: {
    title: 'מאסטר הכתבה',
    description: 'צור ונהל משחקי לימוד שפה באמצעות תרגילי הכתבה. שפר את כישורי השפה שלך עם למידה אינטראקטיבית מבוססת שמע.',
    keywords: ['לימוד שפה', 'הכתבה', 'חינוך', 'למידה קולית', 'תרגול אוצר מילים'],
  }
}

export const siteConfig = {
  name: 'Dictation Masters',
  url: 'https://dictation.acedzn.com', // Update with your actual domain
  ogImage: '/og-image.png', // Default OG image
  author: 'Dictation Masters Team',
  twitter: '@dictationmaster', // Update with your actual Twitter handle
}

export function generateMetadata(
  locale: string = 'en',
  {
    title,
    description,
    path = '',
    image,
  }: {
    title?: string
    description?: string
    path?: string
    image?: string
  } = {}
): Metadata {
  const localeData = defaultMetadata[locale as keyof typeof defaultMetadata] || defaultMetadata.en
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}`
    : localeData.title

  return {
    title: fullTitle,
    description: description || localeData.description,
    keywords: localeData.keywords,
    authors: [{ name: siteConfig.author }],
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: path,
      title: fullTitle,
      description: description || localeData.description,
      siteName: siteConfig.name,
      images: [{
        url: image || siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: fullTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || localeData.description,
      images: [image || siteConfig.ogImage],
      creator: siteConfig.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
} 