import { PostHog } from 'posthog-node'

/**
 * Creates and returns a PostHog client for server-side usage
 */
export default function PostHogClient() {
	const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
		host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		flushAt: 1,
		flushInterval: 0
	})
	return posthogClient
}

/**
 * Helper function to capture server-side events with proper shutdown
 * 
 * @param distinctId User's distinct ID (user ID or anonymous ID)
 * @param event Event name to capture
 * @param properties Optional properties to include with the event
 */
export async function captureServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, any>
) {
	const posthog = PostHogClient()
	
	try {
		await posthog.capture({
			distinctId,
			event,
			properties
		})
	} finally {
		// Always ensure we shut down the client
		await posthog.shutdown()
	}
}

/**
 * Helper function to get feature flags for a user on the server
 * 
 * @param distinctId User's distinct ID
 * @returns Object containing all feature flags for the user
 */
export async function getServerFeatureFlags(distinctId: string) {
	const posthog = PostHogClient()
	
	try {
		return await posthog.getAllFlags(distinctId)
	} finally {
		// Always ensure we shut down the client
		await posthog.shutdown()
	}
} 