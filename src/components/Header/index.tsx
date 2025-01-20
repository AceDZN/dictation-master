import Link from 'next/link'
import Image from 'next/image'
import { auth, signOut } from '@/lib/auth'

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export async function Header() {
  const session = await auth()

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
          {session ? (
            <>
              <Link
                href="/dictation/create"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Dictation
              </Link>
              
              <div className="relative group">
                <button
                  type="button"
                  className="relative rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User avatar'}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {getInitials(session.user?.name)}
                    </div>
                  )}
                </button>
                
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    {session.user?.name || session.user?.email}
                  </div>
                  <form
                    action={async () => {
                      'use server'
                      await signOut()
                    }}
                  >
                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="relative rounded-full bg-gray-100 p-1 hover:bg-gray-200"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="sr-only">Sign in</span>
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
} 