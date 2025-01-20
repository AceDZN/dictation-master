interface EditDictationPageProps {
  params: {
    id: string
  }
}

export default function EditDictationPage({ params }: EditDictationPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Edit Dictation</h1>
      <div>Game ID: {params.id}</div>
      {/* Edit form will be added here */}
    </div>
  )
} 