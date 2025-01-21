'use client'

import { useEffect, useState } from 'react'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getFirestore } from 'firebase-admin/firestore'
import { initAdminApp } from '@/lib/firebase-admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Game {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: any[]
  createdAt: { toDate: () => Date }
  isPublic: boolean
}

export default function ProfilePage() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/dictation/list')
        if (!response.ok) {
          throw new Error('Failed to fetch games')
        }
        const data = await response.json()
        setGames(data.games)
      } catch (err) {
        toast.error('Failed to load games')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/dictation/edit/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete game')
      }

      setGames(games.filter(game => game.id !== id))
      toast.success('Game deleted successfully')
    } catch (err) {
      toast.error('Failed to delete game')
    }
  }

  const publishedGames = games.filter(game => game.isPublic)
  const draftGames = games.filter(game => !game.isPublic)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-8 text-gray-500">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      
      {/* Published Games Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Published Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedGames.map((game) => (
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
                    {game?.createdAt?.toDate && (
                      <div className="text-xs mt-2">
                        Created: {new Date(game.createdAt.toDate()).toLocaleDateString()}
                      </div>
                    )}
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
          {draftGames.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-shadow">
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
                  {game?.createdAt?.toDate && (
                    <div className="text-xs mt-2">
                      Created: {new Date(game.createdAt.toDate()).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = `/dictation/edit/${game.id}`
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(game.id)
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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