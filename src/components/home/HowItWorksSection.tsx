import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

interface HowItWorksSectionProps {
  locale: string
  direction: string
}

export async function HowItWorksSection({ locale, direction }: HowItWorksSectionProps) {
  const t = await getTranslations('HowItWorks')
  
  const steps = [
    {
      id: '01',
      name: t('step1.title'),
      description: t('step1.description'),
      imageUrl: '/images/create-dictation.png',
    },
    {
      id: '02',
      name: t('step2.title'),
      description: t('step2.description'),
      imageUrl: '/images/add-words.png',
    },
    {
      id: '03',
      name: t('step3.title'),
      description: t('step3.description'),
      imageUrl: '/images/play-game.png',
    }
  ]

  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              {t('sectionTitle')}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t('sectionSubtitle')}
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {t('sectionDescription')}
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-x-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center lg:items-start">
                  {/* Step number with glowing effect */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 shadow-indigo-500/50 shadow-lg">
                    <span className="text-xl font-bold text-white">{step.id}</span>
                  </div>
                  
                  
                  {/* Image */}
                  <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner overflow-hidden w-full max-w-md">
                    <div className="p-2">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          {/* Replace with actual images once available */}
                          <span className="text-gray-800 text-xl font-bold">{t('imagePlaceholder')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Text */}
                  <div className="mt-6 max-w-md text-center lg:text-start">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">{step.name}</h3>
                    <p className="mt-2 text-base leading-7 text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 