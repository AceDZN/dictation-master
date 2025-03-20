import { LatestGames } from '@/components/dictation/LatestGames'
import { getLocale } from 'next-intl/server'
import { getLangDir } from 'rtl-detect'
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata'
import { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'

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
  const direction = getLangDir(locale)

  return (
    
      <>
      
      {/* Hero section */}
      <HeroSection  direction={direction} />
       
      {/* Features section */}
      <FeaturesSection  />
      
      {/* How it works section */}
      <HowItWorksSection/>
      
      {/* Latest Games Section */}
      <LatestGames />
      
     </>
  )
}
