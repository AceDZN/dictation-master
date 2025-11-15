import { getTranslations } from 'next-intl/server'
import {
  ArrowUpTrayIcon,
  BoltIcon,
  BookOpenIcon,
  GlobeAltIcon,
  MicrophoneIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'


export async function FeaturesSection() {
  const t = await getTranslations('Features')

  const features = [
    {
      name: t('dictationBuilder.title'),
      description: t('dictationBuilder.description'),
      icon: BookOpenIcon,
    },
    {
      name: t('practiceModes.title'),
      description: t('practiceModes.description'),
      icon: BoltIcon,
    },
    {
      name: t('instantAudio.title'),
      description: t('instantAudio.description'),
      icon: MicrophoneIcon,
    },
    {
      name: t('languageControls.title'),
      description: t('languageControls.description'),
      icon: GlobeAltIcon,
    },
    {
      name: t('sharing.title'),
      description: t('sharing.description'),
      icon: UserGroupIcon,
    },
    {
      name: t('fastImport.title'),
      description: t('fastImport.description'),
      icon: ArrowUpTrayIcon,
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
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
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative rounded-2xl bg-white p-8 shadow-md ring-1 ring-gray-200/50 hover:shadow-lg hover:ring-indigo-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute -inset-px z-10 rounded-2xl opacity-0 transition group-hover:opacity-100" aria-hidden="true">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-white"></div>
                  </div>

                  <div className="relative z-20 flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                    <feature.icon className="h-8 w-8" aria-hidden="true" />
                  </div>

                  <div className="relative z-20 mt-6">
                    <h3 className="text-lg font-semibold leading-8 text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                      {feature.description}
                    </p>
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