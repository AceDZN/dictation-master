import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { TypewriterEffect } from '@/components/ui/typewriter-effect'

interface HeroSectionProps {
  direction: string
}

export async function HeroSection({  direction }: HeroSectionProps) {
  const t = await getTranslations('HomePage')

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-12 sm:pb-32 sm:pt-12 lg:px-8">
      {/* Decorative blurred circles */}
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl relative">
          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16 items-center">
            {/* Hero content */}
            <div className="text-center lg:text-start relative z-10">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                <p className="text-sm font-medium text-indigo-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                  {t('newVersionAvailable')}
                </p>
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-64l mb-8 sm:min-h-[80px] min-h-[200px]">
                <TypewriterEffect text={t('title')} />
              </h1>
              
              <p className="mt-2 text-xl leading-8 text-gray-600">
                {t('description')}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/dictation/create"
                  className="rounded-lg bg-indigo-600 px-5 py-3 text-md font-semibold text-white shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-500 hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t('createGame')}
                </Link>
                <Link 
                  href="#features" 
                  className="text-md font-semibold leading-6 text-gray-900 flex items-center justify-center px-5 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                >
                  {t('learnMore')} <span aria-hidden="true" className="ml-2">{direction === 'rtl' ? '←' : '→'}</span>
                </Link>
              </div>
            </div>
            
            {/* Hero cards grid */}
            <div className="relative z-10">
              <div className="grid grid-cols-1  sm:grid-cols-2 sm:grid-rows-2 gap-4">
                {[
                  { icon: '🔤', text: t('hero.card1'), color: 'from-blue-500 to-indigo-600' },
                  { icon: '🗣️', text: t('hero.card2'), color: 'from-indigo-500 to-purple-600' },
                  { icon: '🧠', text: t('hero.card3'), color: 'from-purple-500 to-pink-600' },
                  { icon: '🎮', text: t('hero.card4'), color: 'from-pink-500 to-rose-600' }
                ].map((card, i) => (
                  <div
                    key={i}
                    className="group relative h-32 sm:h-48 rounded-2xl p-6 flex flex-col items-center justify-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/png;base64,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")'}}></div>
                    
                    <div className="relative z-10 text-center">
                      <span className="text-4xl mb-3 block">{card.icon}</span>
                      <p className="text-2xl font-bold text-white">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Decorative gradient lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
                <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 