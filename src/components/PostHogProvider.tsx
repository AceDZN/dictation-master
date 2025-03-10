'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePostHogUser } from '@/hooks/usePostHogUser'

export function PostHogPageview(): React.ReactNode {
	const pathname = usePathname()
	const searchParams = useSearchParams()

	useEffect(() => {
		if (pathname) {
			let url = window.origin + pathname
			if (searchParams?.toString()) {
				url = url + `?${searchParams.toString()}`
			}
			posthog.capture('$pageview', {
				$current_url: url,
			})
		}
	}, [pathname, searchParams])

	return <></>
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	// Use the hook for auto user identification
	usePostHogUser()

	useEffect(() => {
		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
			person_profiles: 'identified_only',
			capture_pageview: false, // We'll capture pageviews manually
		})
	}, [])

	return (
		<PHProvider client={posthog}>
			<PostHogPageview />
			{children}
		</PHProvider>
	)
} 