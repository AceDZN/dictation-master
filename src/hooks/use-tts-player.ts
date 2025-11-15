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
	disableSpeech?: boolean
}

const DEFAULT_RATE = 1
const DEFAULT_PITCH = 1
const DEFAULT_VOLUME = 1
const DEFAULT_MIN_DURATION = 0

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null
let playbackQueue: Promise<void> = Promise.resolve()
const UTTERANCE_TIMEOUT_MS = 5000

const wait = (ms: number) =>
	new Promise<void>(resolve => {
		window.setTimeout(resolve, ms)
	})

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
	if (typeof window === 'undefined' || !window.speechSynthesis) {
		return Promise.resolve([])
	}

	if (voicesPromise) {
		return voicesPromise
	}

	const synth = window.speechSynthesis

	voicesPromise = new Promise<SpeechSynthesisVoice[]>(resolve => {
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

		window.setTimeout(() => {
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
	disableSpeech = false,
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

	const playFallbackAudio = useCallback(async (): Promise<boolean> => {
		if (!fallbackUrl || typeof window === 'undefined') {
			return false
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
					resolve(true)
				}

				function handleError(event: Event) {
					console.error('Fallback audio error', event)
					cleanup()
					resolve(false)
				}

				audio.addEventListener('ended', handleEnded)
				audio.addEventListener('error', handleError)
				void audio.play().catch(error => {
					console.error('Fallback audio play error', error)
					cleanup()
					resolve(false)
				})
			} catch (error) {
				console.error('Failed to play fallback audio', error)
				resolve(false)
			}
		})
	}, [fallbackUrl, volume])

	const waitForSynthIdle = useCallback(async (synth: SpeechSynthesis) => {
		const start = Date.now()
		while (synth.speaking || synth.pending) {
			if (Date.now() - start > 750) {
				break
			}
			await wait(40)
		}
	}, [])

	const ensureSynthReady = useCallback(
		async (synth: SpeechSynthesis) => {
			if (synth.speaking || synth.pending) {
				synth.cancel()
				await waitForSynthIdle(synth)
			}
			if (synth.paused && typeof synth.resume === 'function') {
				try {
					synth.resume()
				} catch (error) {
					console.warn('Failed to resume speech synthesis', error)
				}
			}
		},
		[waitForSynthIdle],
	)

	const playSpeech = useCallback(async () => {
		const startedAt = Date.now()
		const trimmedText = text?.trim()
		if (!trimmedText) {
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
			await ensureSynthReady(synth)

			const utterance = new SpeechSynthesisUtterance(trimmedText)
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
				const cleanup = () => {
					window.clearTimeout(timeoutId)
				}
				utterance.onend = () => {
					cleanup()
					resolve()
				}
				utterance.onerror = event => {
					console.error('Speech synthesis error', event.error)
					if (event.error === 'canceled' || event.error === 'interrupted') {
						cleanup()
						resolve()
						return
					}
					cleanup()
					reject(event.error)
				}

				const timeoutId = window.setTimeout(() => {
					console.warn('Speech synthesis timeout, forcing cancel')
					try {
						synth.cancel()
					} catch (error) {
						console.error('Failed to cancel speech synthesis after timeout', error)
					}
					resolve()
				}, UTTERANCE_TIMEOUT_MS)

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
	}, [text, voiceId, lang, rate, pitch, volume, playFallbackAudio, minDurationMs, ensureSynthReady])

	return useCallback(async () => {
		const shouldUseSpeech = !disableSpeech && !!text?.trim()

		if (fallbackUrl) {
			const playedAudio = await playFallbackAudio()
			if (playedAudio || !shouldUseSpeech) {
				return
			}
		}

		if (!shouldUseSpeech) {
			return
		}

		playbackQueue = playbackQueue
			.catch(error => {
				console.error('Previous TTS playback failed', error)
			})
			.then(() => playSpeech())

		return playbackQueue
	}, [disableSpeech, fallbackUrl, playFallbackAudio, playSpeech, text])
}

