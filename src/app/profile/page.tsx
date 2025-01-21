import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

async function getCreatedGames(userId: string) {
  const db = getFirestore(initAdminApp())
  const gamesRef = db.collection('dictation_games').doc(userId).collection('games')
  const snapshot = await gamesRef
    .orderBy('createdAt', 'desc')
    .get()
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const games = await getCreatedGames(session.user.id)
  const publishedGames = games.filter((game: any) => game.isPublic)
  const draftGames = games.filter((game: any) => !game.isPublic)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      {/* Published Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Published Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedGames.map((game: any) => (
            <Link href={`/dictation/edit/${game.id}`} key={game.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <CardDescription>
                    {game.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    <div>Words: {game.wordPairs.length}</div>
                    <div>From: {game.sourceLanguage}</div>
                    <div>To: {game.targetLanguage}</div>
                    {game?.createdAt && game?.createdAt?.toDate ? (
                      <div className="text-xs mt-2">
                        Created: {new Date(game.createdAt.toDate()).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {publishedGames.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              You haven't published any games yet.
            </div>
          )}
        </div>
      </div>

      {/* Draft Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Draft Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {draftGames.map((game: any) => (
            <Link href={`/dictation/edit/${game.id}`} key={game.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {game.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    <div>Words: {game.wordPairs.length}</div>
                    <div>From: {game.sourceLanguage}</div>
                    <div>To: {game.targetLanguage}</div>
                    <div className="text-xs mt-2">
                      Created: {new Date(game.createdAt.toDate()).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {draftGames.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              You don't have any drafts.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 