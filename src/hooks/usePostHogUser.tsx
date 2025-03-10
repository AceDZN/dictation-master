'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { identifyUser, resetUser } from '@/lib/posthog-utils'

/**
 * Hook to automatically identify users with PostHog when they log in
 * and reset identification when they log out
 */
export function usePostHogUser() {
	const { data: session } = useSession()

	useEffect(() => {
		if (session?.user) {
			// Identify the user in PostHog with their ID and properties
			identifyUser(
				// Use user ID or email as the distinct ID
				session.user.id || session.user.email || 'anonymous',
				{
					email: session.user.email,
					name: session.user.name,
					// Add any other user properties you want to track
					signedUp: new Date().toISOString(),
				}
			)
		} else {
			// Reset user identification when logged out
			resetUser()
		}
	}, [session])

	return null
} 