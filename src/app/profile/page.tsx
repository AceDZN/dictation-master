'use client'

import { useEffect, useState } from 'react'
import { GameCard } from '@/components/dictation/GameCard'
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
            <GameCard key={game.id} {...game} />
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
            <GameCard 
              key={game.id} 
              {...game} 
              onDelete={handleDelete}
            />
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