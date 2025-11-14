import { DictationGame, WordPair } from '@/lib/types'

export type LanguageDirection = 'forward' | 'reverse'

const normalizeWordPair = (pair: WordPair): WordPair => {
	const firstSentence = pair.firstSentence ?? ''
	const secondSentence = pair.secondSentence ?? pair.sentence ?? ''

	return {
		...pair,
		firstSentence,
		secondSentence,
		sentence: secondSentence || pair.sentence,
	}
}

const swapPair = (pair: WordPair): WordPair => {
	return {
		first: pair.second,
		second: pair.first,
		firstSentence: pair.secondSentence,
		secondSentence: pair.firstSentence,
		sentence: pair.firstSentence || pair.secondSentence || pair.sentence,
		firstAudioUrl: pair.secondAudioUrl,
		secondAudioUrl: pair.firstAudioUrl,
	}
}

export const getDirectedGame = (
	game: DictationGame,
	direction: LanguageDirection,
): DictationGame => {
	const normalizedPairs = game.wordPairs.map(normalizeWordPair)

	if (direction === 'forward') {
		return {
			...game,
			wordPairs: normalizedPairs,
		}
	}

	return {
		...game,
		sourceLanguage: game.targetLanguage,
		targetLanguage: game.sourceLanguage,
		wordPairs: normalizedPairs.map(swapPair),
	}
}

export const getFirstSentence = (pair: WordPair): string => {
	return pair.firstSentence ?? ''
}

export const getSecondSentence = (pair: WordPair): string => {
	return pair.secondSentence ?? pair.sentence ?? ''
}

