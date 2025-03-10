import posthog from 'posthog-js'

/**
 * Identifies a user in PostHog when they log in
 * 
 * @param userId The unique identifier for the user
 * @param userProperties Optional properties to associate with the user
 */
export const identifyUser = (
	userId: string,
	userProperties?: Record<string, any>
) => {
	if (typeof window !== 'undefined') {
		posthog.identify(userId, userProperties)
	}
}

/**
 * Resets the current user in PostHog when they log out
 */
export const resetUser = () => {
	if (typeof window !== 'undefined') {
		posthog.reset()
	}
}

/**
 * Track a custom event with PostHog
 * 
 * @param eventName Name of the event to track
 * @param properties Optional properties to include with the event
 */
export const trackEvent = (
	eventName: string,
	properties?: Record<string, any>
) => {
	if (typeof window !== 'undefined') {
		posthog.capture(eventName, properties)
	}
}

/**
 * Track user onboarding progress
 * 
 * @param step The onboarding step name
 * @param properties Additional properties to track
 */
export const trackOnboardingStep = (
	step: string,
	properties?: Record<string, any>
) => {
	trackEvent('onboarding_step', {
		step,
		...properties
	})
}

/**
 * Set one or more user properties
 * 
 * @param properties Properties to set for the identified user
 */
export const setUserProperties = (properties: Record<string, any>) => {
	if (typeof window !== 'undefined') {
		posthog.people.set(properties)
	}
}

/**
 * Track feature usage
 * 
 * @param feature The feature name
 * @param properties Additional properties
 */
export const trackFeatureUsage = (
	feature: string,
	properties?: Record<string, any>
) => {
	trackEvent('feature_used', {
		feature,
		...properties
	})
} 