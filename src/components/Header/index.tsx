"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { handleSignOut } from '@/app/auth/actions'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useTranslations } from 'next-intl'
/*
function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
*/
function UserButton() {
  const { data: session } = useSession()
  const t = useTranslations('Header')

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="relative rounded-full bg-gray-100 p-1 hover:bg-gray-200"
      >
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="sr-only">{t('signIn')}</span>
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
    )
  }

  return (
    <div className="relative group">
      <Link
        href="/profile"
        className="relative rounded-full bg-gray-100 p-1 hover:bg-gray-200 block"
      >
        <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
          {session.user.name || session.user.email}
        </div>
        <Link
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {t('profile')}
        </Link>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            {t('signOut')}
          </button>
        </form>
      </div>
    </div>
  )
}

export function Header() {
  const t = useTranslations('Header')
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt={t('appName')}
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-semibold text-xl ltr:-ml-[5px] rtl:mr-[5px]">{t('appName')}</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {UserButton()}
        </div>
      </div>
    </header>
  )
} 