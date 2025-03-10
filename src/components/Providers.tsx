'use client'

import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth"
import { PostHogProvider } from "./PostHogProvider"

export function Providers({ children, session }: { children: React.ReactNode, session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </SessionProvider>
  )
} 