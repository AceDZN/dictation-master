// src/components/dictation/GameCard.tsx
import { EyeIcon } from '@heroicons/react/24/outline'
import { getTranslations } from 'next-intl/server'
import { GameCardActions } from './GameCardActions'

type TimestampLike =
  | Date
  | number
  | string
  | {
    toDate?: () => Date
    seconds?: number
    nanoseconds?: number
    _seconds?: number
    _nanoseconds?: number
  }
  | undefined

interface Game {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  wordPairs: Array<{
    first: string
    second: string
    sentence?: string
  }>
  createdAt?: TimestampLike
  isPublic?: boolean
  playCount?: number
  userId?: string
}

const getDateFromTimestamp = (timestamp: TimestampLike) => {
  if (!timestamp) {
    return undefined
  }

  if (timestamp instanceof Date) {
    return timestamp
  }

  if (typeof timestamp === 'number') {
    const millis = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000
    return new Date(millis)
  }

  if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp)
    if (!Number.isNaN(parsed)) {
      return new Date(parsed)
    }
    return undefined
  }

  if (typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate()
    } catch (error) {
      console.error('Error converting timestamp via toDate:', error)
      return undefined
    }
  }

  const seconds =
    typeof timestamp.seconds === 'number'
      ? timestamp.seconds
      : typeof timestamp._seconds === 'number'
        ? timestamp._seconds
        : undefined

  if (typeof seconds === 'number') {
    const nanoseconds =
      typeof timestamp.nanoseconds === 'number'
        ? timestamp.nanoseconds
        : typeof timestamp._nanoseconds === 'number'
          ? timestamp._nanoseconds
          : 0
    return new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000))
  }

  return undefined
}

export async function GameCard({
  id,
  title,
  description,
  sourceLanguage,
  targetLanguage,
  wordPairs,
  createdAt,
  isPublic,
  playCount = 0,
  userId,
}: Game) {
  const t = await getTranslations('Dictation.card')

  const formatDate = (timestamp: TimestampLike) => {
    const date = getDateFromTimestamp(timestamp)
    return (date ?? new Date()).toLocaleDateString()
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all hover:-translate-y-1 duration-300">
      {/* Decorative gradient top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      {/* Public/Private indicator */}
      <div className="absolute top-4 right-4 z-10">
        {isPublic ? (
          <span className="flex h-3 w-3 items-center">
            <span className="animate-ping absolute h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        ) : (
          <span className="flex h-3 w-3 items-center">
            <span className="relative rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </div>

      <div className="p-6 h-full flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 text-start mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1" dir="auto">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 text-start line-clamp-2" dir="auto">
              {description}
            </p>
          )}
        </div>

        {/* Card Content */}
        <div className="mt-6 space-y-3">
          {/* Language info with glass morphism effect */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between text-sm">
              <div className="font-medium text-gray-700">
                {sourceLanguage} → {targetLanguage}
              </div>
              <div className="flex items-center gap-1 text-indigo-600">
                <EyeIcon className="h-4 w-4" />
                <span>{playCount}</span>
              </div>
            </div>
          </div>

          {/* Words count and created date */}
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <div>{t('words', { count: wordPairs.length })}</div>
            <div>{t('created')} {formatDate(createdAt)}</div>
          </div>

          {/* Actions */}
          <GameCardActions
            id={id}
            userId={userId}
          />
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  )
} 