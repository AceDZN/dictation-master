import { DictationForm } from "@/components/dictation/DictationForm"

export default function CreateDictationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Create New Dictation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new dictation game by filling out the form below.
          </p>
        </div>

        <DictationForm />
      </div>
    </div>
  )
} 