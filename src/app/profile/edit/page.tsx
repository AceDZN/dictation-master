import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "../ProfileForm"

export default async function ProfileEditPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
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