'use client'

import { useEffect, useMemo, useState } from 'react'

interface PreferredVoice {
	id: string | null
	label: string | null
}

const VOICE_ID_STORAGE_KEY = 'dictation.preferredVoiceId'
const VOICE_LABEL_STORAGE_KEY = 'dictation.preferredVoiceLabel'

let cachedVoice: PreferredVoice | null = null
let hasServerBackedValue = false
let inFlightRequest: Promise<PreferredVoice | null> | null = null

const readFromStorage = (): PreferredVoice | null => {
	if (typeof window === 'undefined') {
		return null
	}

	const id = window.localStorage.getItem(VOICE_ID_STORAGE_KEY)
	const label = window.localStorage.getItem(VOICE_LABEL_STORAGE_KEY)

	if (id || label) {
		return {
			id: id || null,
			label: label || null,
		}
	}

	return null
}

const persistToStorage = (preference: PreferredVoice | null) => {
	if (typeof window === 'undefined') {
		return
	}

	if (preference?.id) {
		window.localStorage.setItem(VOICE_ID_STORAGE_KEY, preference.id)
	} else {
		window.localStorage.removeItem(VOICE_ID_STORAGE_KEY)
	}

	if (preference?.label) {
		window.localStorage.setItem(VOICE_LABEL_STORAGE_KEY, preference.label)
	} else {
		window.localStorage.removeItem(VOICE_LABEL_STORAGE_KEY)
	}
}

export const primePreferredVoiceCache = (
	preference: PreferredVoice | null,
	options?: { fromServer?: boolean },
) => {
	cachedVoice = preference
	if (options?.fromServer ?? true) {
		hasServerBackedValue = true
	}
	persistToStorage(preference)
}

const fetchPreference = async (): Promise<PreferredVoice | null> => {
	if (inFlightRequest) {
		return inFlightRequest
	}

	if (hasServerBackedValue) {
		return cachedVoice
	}

	inFlightRequest = (async () => {
		if (typeof window === 'undefined') {
			return null
		}

		try {
			const response = await fetch('/api/user/settings', {
				credentials: 'include',
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			const preference: PreferredVoice | null = data
				? {
						id: data.preferredVoiceId ?? null,
						label: data.preferredVoiceLabel ?? null,
				  }
				: null

			primePreferredVoiceCache(preference, { fromServer: true })
			return preference
		} catch (error) {
			console.error('Failed to fetch preferred voice', error)
			return readFromStorage()
		} finally {
			inFlightRequest = null
		}
	})()

	return inFlightRequest
}

export function usePreferredVoice() {
	const initialPreference = useMemo(() => {
		if (cachedVoice) {
			return cachedVoice
		}
		const fromStorage = readFromStorage()
		if (fromStorage) {
			primePreferredVoiceCache(fromStorage, { fromServer: false })
		}
		return fromStorage
	}, [])
	const [preference, setPreference] = useState<PreferredVoice | null>(initialPreference)

	useEffect(() => {
		if (hasServerBackedValue) {
			return
		}

		let isMounted = true

		const loadPreference = async () => {
			const result = await fetchPreference()
			if (!isMounted) {
				return
			}

			if (result) {
				setPreference(result)
			}
		}

		loadPreference()

		return () => {
			isMounted = false
		}
	}, [])

	const setPreferredVoice = (id: string | null, label?: string | null) => {
		const nextPreference: PreferredVoice | null = id
			? { id, label: label ?? null }
			: null

		primePreferredVoiceCache(nextPreference)
		setPreference(nextPreference)
	}

	return {
		preferredVoiceId: preference?.id ?? undefined,
		preferredVoiceLabel: preference?.label ?? undefined,
		setPreferredVoice,
	}
}

export const preferredVoiceStorageKeys = {
	id: VOICE_ID_STORAGE_KEY,
	label: VOICE_LABEL_STORAGE_KEY,
}

