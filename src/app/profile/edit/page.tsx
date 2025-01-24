import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "../ProfileForm"
import { getTranslations } from 'next-intl/server'

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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t('editTitle')}</h1>
      <div className="max-w-2xl mx-auto">
        <ProfileForm 
          userId={session.user.id}
          initialName={session.user.name ?? ''}
          initialImage={session.user.image ?? ''}
        />
      </div>
    </div>
  )
} 