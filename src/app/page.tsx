import { LatestGames } from '@/components/dictation/LatestGames'
import { getLocale, getTranslations } from 'next-intl/server'
import { getLangDir } from 'rtl-detect'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { BackgroundGradient } from '@/components/ui/background-gradient'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { HowItWorksSection } from '@/components/home/HowItWorksSection'
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return generateSiteMetadata(locale, {
    path: '/',
    image: '/og/home.png' // Static image for home page
  })
}

export default async function Home() {
  const locale = await getLocale()
  const t = await getTranslations()
  const direction = getLangDir(locale)

  return (
    
      <>
      
      {/* Hero section */}
      <HeroSection locale={locale} direction={direction} />
       
      {/* Features section */}
      <FeaturesSection locale={locale} />
      
      {/* How it works section */}
      <HowItWorksSection locale={locale} direction={direction} />
      
      {/* Latest Games Section */}
      <LatestGames />
      
     </>
  )
}
