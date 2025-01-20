import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"
import { DraftsGallery } from './DraftsGallery'

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin?from=/profile')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Your Drafts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Continue working on your saved dictation games
          </p>
        </div>

        <DraftsGallery />
      </div>
      

      {/*
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
      <ProfileForm 
        userId={session.user.id}
        initialName={session.user.name || ''}
        initialImage={session.user.image || ''}
      />*/}


    </div>
  )
} 