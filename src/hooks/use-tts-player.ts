'use client'

import { useCallback, useEffect, useRef } from 'react'

interface UseTTSPlayerOptions {
	text?: string
	fallbackUrl?: string
	voiceId?: string
	lang?: string
	rate?: number
	pitch?: number
	volume?: number
	minDurationMs?: number
}

const DEFAULT_RATE = 1
const DEFAULT_PITCH = 1
const DEFAULT_VOLUME = 1
const DEFAULT_MIN_DURATION = 0

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
	if (typeof window === 'undefined' || !window.speechSynthesis) {
		return Promise.resolve([])
	}

	if (voicesPromise) {
		return voicesPromise
	}

	const synth = window.speechSynthesis

	voicesPromise = new Promise(resolve => {
		const availableVoices = synth.getVoices()
		if (availableVoices.length) {
			resolve(availableVoices)
			return
		}

		const handleVoicesChanged = () => {
			const voices = synth.getVoices()
			synth.removeEventListener('voiceschanged', handleVoicesChanged)
			resolve(voices)
		}

		synth.addEventListener('voiceschanged', handleVoicesChanged)

		setTimeout(() => {
			synth.removeEventListener('voiceschanged', handleVoicesChanged)
			resolve(synth.getVoices())
		}, 500)
	}).then(voices => {
		if (!voices.length) {
			voicesPromise = null
		}
		return voices
	})

	return voicesPromise
}

export function useTTSPlayer({
	text,
	fallbackUrl,
	voiceId,
	lang,
	rate = DEFAULT_RATE,
	pitch = DEFAULT_PITCH,
	volume = DEFAULT_VOLUME,
	minDurationMs = DEFAULT_MIN_DURATION,
}: UseTTSPlayerOptions) {
	const fallbackAudioRef = useRef<HTMLAudioElement | null>(null)

	useEffect(() => {
		return () => {
			fallbackAudioRef.current?.pause()
			fallbackAudioRef.current = null
			if (typeof window !== 'undefined' && window.speechSynthesis) {
				window.speechSynthesis.cancel()
			}
		}
	}, [])

	const playFallbackAudio = useCallback(async (): Promise<void> => {
		if (!fallbackUrl || typeof window === 'undefined') {
			return
		}

		return new Promise(resolve => {
			try {
				fallbackAudioRef.current?.pause()
				const audio = new Audio(fallbackUrl)
				fallbackAudioRef.current = audio
				audio.volume = Math.min(Math.max(volume, 0), 1)

				const cleanup = () => {
					audio.removeEventListener('ended', handleEnded)
					audio.removeEventListener('error', handleError)
				}

				function handleEnded() {
					cleanup()
					resolve()
				}

				function handleError(event: Event) {
					console.error('Fallback audio error', event)
					cleanup()
					resolve()
				}

				audio.addEventListener('ended', handleEnded)
				audio.addEventListener('error', handleError)
				void audio.play().catch(error => {
					console.error('Fallback audio play error', error)
					cleanup()
					resolve()
				})
			} catch (error) {
				console.error('Failed to play fallback audio', error)
				resolve()
			}
		})
	}, [fallbackUrl, volume])

	return useCallback(async () => {
		const startedAt = Date.now()
		if (!text?.trim()) {
			if (minDurationMs > 0) {
				const elapsed = Date.now() - startedAt
				if (elapsed < minDurationMs) {
					await new Promise(resolve => setTimeout(resolve, minDurationMs - elapsed))
				}
			}
			return
		}

		if (typeof window === 'undefined' || !window.speechSynthesis) {
			await playFallbackAudio()
			return
		}

		let didStartSpeaking = false

		try {
			const synth = window.speechSynthesis
			const voices = await loadVoices()

			const utterance = new SpeechSynthesisUtterance(text)
			if (voiceId) {
				const selectedVoice =
					voices.find(voice => voice.voiceURI === voiceId) ??
					voices.find(voice => voice.name === voiceId)
				if (selectedVoice) {
					utterance.voice = selectedVoice
				}
			}

			if (lang) {
				utterance.lang = lang
			}

			utterance.rate = rate
			utterance.pitch = pitch
			utterance.volume = Math.min(Math.max(volume, 0), 1)

			await new Promise<void>((resolve, reject) => {
				utterance.onstart = () => {
					didStartSpeaking = true
				}
				utterance.onend = () => resolve()
				utterance.onerror = event => {
					console.error('Speech synthesis error', event.error)
					if (event.error === 'canceled' || event.error === 'interrupted') {
						resolve()
						return
					}
					reject(event.error)
				}

				synth.cancel()
				synth.speak(utterance)
			})
		} catch (error) {
			console.warn('Speech synthesis failed', error)
			if (!didStartSpeaking) {
				await playFallbackAudio()
			}
		} finally {
			if (minDurationMs > 0) {
				const elapsed = Date.now() - startedAt
				if (elapsed < minDurationMs) {
					await new Promise(resolve => setTimeout(resolve, minDurationMs - elapsed))
				}
			}
		}
	}, [text, voiceId, lang, rate, pitch, volume, playFallbackAudio, minDurationMs])
}

