'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSelector } from '@/components/dictation/LanguageSelector'
import { FileUpload } from '@/components/dictation/FileUpload'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import type { WordPairsList } from '@/lib/openai'

interface DictationWizardStep2UploadProps {
	sourceLanguage: string
	targetLanguage: string
	onSourceLanguageChange: (lang: string) => void
	onTargetLanguageChange: (lang: string) => void
	onComplete: (data: WordPairsList) => void
	onCancel: () => void
}

export function DictationWizardStep2Upload({
	sourceLanguage,
	targetLanguage,
	onSourceLanguageChange,
	onTargetLanguageChange,
	onComplete,
	onCancel
}: DictationWizardStep2UploadProps) {
	const t = useTranslations('Dictation.wizard')
	const tForm = useTranslations('Dictation.form')
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState<string>()

	const handleUploadStart = () => {
		setIsUploading(true)
		setError(undefined)
	}

	const handleUploadComplete = (data: WordPairsList) => {
		setIsUploading(false)
		onComplete(data)
	}

	const handleUploadError = (errorMessage: string) => {
		setIsUploading(false)
		setError(errorMessage)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<Button
				variant="ghost"
				onClick={onCancel}
				disabled={isUploading}
				className="mb-4"
			>
				<ArrowLeftIcon className="h-4 w-4 mr-2" />
				{t('back')}
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>{t('uploadImage')}</CardTitle>
					<CardDescription>{t('uploadImageStepDescription')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
							{error}
						</div>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<LanguageSelector
							id="upload-source-language"
							label={tForm('sourceLanguage')}
							value={sourceLanguage}
							onChange={onSourceLanguageChange}
							excludeLanguage={targetLanguage}
							disabled={isUploading}
						/>
						<LanguageSelector
							id="upload-target-language"
							label={tForm('targetLanguage')}
							value={targetLanguage}
							onChange={onTargetLanguageChange}
							excludeLanguage={sourceLanguage}
							disabled={isUploading}
						/>
					</div>

					{isUploading ? (
						<div className="flex flex-col items-center justify-center py-12 space-y-4">
							<Spinner size="lg" />
							<p className="text-sm text-gray-600">{t('processingImage')}</p>
							<p className="text-xs text-gray-500 text-center">{t('processingImageDescription')}</p>
						</div>
					) : (
						<div className="space-y-2">
							<FileUpload
								onStart={handleUploadStart}
								onComplete={handleUploadComplete}
								onError={handleUploadError}
								disabled={isUploading}
								sourceLanguage={sourceLanguage}
								targetLanguage={targetLanguage}
							/>
							<p className="text-xs text-gray-500">{t('supportedFormats')}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

