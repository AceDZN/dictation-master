const LANGUAGE_TAGS: Record<string, string> = {
	english: 'en-US',
	'en': 'en-US',
	'en-us': 'en-US',
	'en-gb': 'en-GB',
	hebrew: 'he-IL',
	he: 'he-IL',
	'iw': 'he-IL',
	spanish: 'es-ES',
	es: 'es-ES',
	'es-es': 'es-ES',
	'es-mx': 'es-MX',
	french: 'fr-FR',
	fr: 'fr-FR',
	german: 'de-DE',
	de: 'de-DE',
	italian: 'it-IT',
	it: 'it-IT',
	portuguese: 'pt-BR',
	pt: 'pt-BR',
	'pt-br': 'pt-BR',
	'pt-pt': 'pt-PT',
	russian: 'ru-RU',
	ru: 'ru-RU',
	chinese: 'zh-CN',
	zh: 'zh-CN',
	'zh-cn': 'zh-CN',
	japanese: 'ja-JP',
	ja: 'ja-JP',
	korean: 'ko-KR',
	ko: 'ko-KR',
	arabic: 'ar-SA',
	ar: 'ar-SA',
}

const normalize = (value: string): string => value.trim().toLowerCase()

export const getLanguageBCP47Tag = (language?: string): string | undefined => {
	if (!language) {
		return undefined
	}

	return LANGUAGE_TAGS[normalize(language)] ?? undefined
}

