interface PlayDictationPageProps {
  params: {
    id: string
  }
}

export default function PlayDictationPage({ params }: PlayDictationPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Play Dictation</h1>
      <div>Game ID: {params.id}</div>
      {/* Game player will be added here */}
    </div>
  )
} 