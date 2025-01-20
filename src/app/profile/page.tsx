import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin?from=/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
      <ProfileForm 
        userId={session.user.id}
        initialName={session.user.name || ''}
        initialImage={session.user.image || ''}
      />
    </div>
  )
} 