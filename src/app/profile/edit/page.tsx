import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "../ProfileForm"
import { getTranslations } from 'next-intl/server'
import { BackgroundGradient } from '@/components/ui/background-gradient'

interface ProfileEditPageProps {
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function ProfileEditPage({ searchParams }: ProfileEditPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const t = await getTranslations('Profile')
  await searchParams // Need to await even if not using to comply with Next.js 15

  return (
    <>
      {/* Dot pattern decoration */}
      <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)] dark:bg-grid-slate-100/[0.03]" style={{
            maskSize: '100%',
            backgroundPosition: 'calc(100% - 0px) calc(100% - 0px)',
            backgroundSize: '40px 40px',
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(15 23 42 / 0.1)\'%3E%3Cpath d=\'M0 .5H31.5V32\'/%3E%3C/svg%3E")',
          }} />
        </div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-6xl relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 relative overflow-hidden">
            {/* Decorative gradient top edge */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('editTitle')}</h1>
            
            <div className="max-w-2xl mx-auto">
              <ProfileForm 
                userId={session.user.id}
                initialName={session.user.name ?? ''}
                initialImage={session.user.image ?? ''}
              />
            </div>
          </div>
        </div>
      </div>
      
    </>
  )
} 