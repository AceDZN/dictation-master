'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

interface DictationWizardStep1Props {
	onChoice: (choice: 'upload' | 'manual') => void
}

export function DictationWizardStep1({ onChoice }: DictationWizardStep1Props) {
	const t = useTranslations('Dictation.wizard')

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="text-center space-y-2">
				<h2 className="text-2xl sm:text-3xl font-bold">{t('chooseMethod')}</h2>
				<p className="text-sm sm:text-base text-gray-600">{t('chooseMethodDescription')}</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
				<Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-indigo-500">
					<CardHeader>
						<CardTitle className="flex items-center gap-3">
							<PhotoIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
							{t('uploadImage')}
						</CardTitle>
						<CardDescription>{t('uploadImageDescription')}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => onChoice('upload')}
							className="w-full"
							size="lg"
						>
							{t('chooseUpload')}
						</Button>
					</CardContent>
				</Card>

				<Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-indigo-500">
					<CardHeader>
						<CardTitle className="flex items-center gap-3">
							<PencilIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
							{t('manualEntry')}
						</CardTitle>
						<CardDescription>{t('manualEntryDescription')}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => onChoice('manual')}
							variant="outline"
							className="w-full"
							size="lg"
						>
							{t('chooseManual')}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

