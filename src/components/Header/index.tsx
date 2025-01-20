import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Dictation Master Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-semibold text-xl">Dictation Master</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link
            href="/dictation/create"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Dictation
          </Link>
          
          <button
            type="button"
            className="relative rounded-full bg-gray-100 p-1 hover:bg-gray-200"
          >
            <span className="sr-only">View profile</span>
            <div className="h-8 w-8 rounded-full bg-gray-300">
              <span className="sr-only">User avatar</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
} 