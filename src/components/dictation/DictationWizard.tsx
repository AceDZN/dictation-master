'use client'

import { useState } from 'react'
import { DictationFormManual } from './DictationFormManual'
import { DictationWizardStep1 } from './DictationWizardStep1'
import { DictationWizardStep2Upload } from './DictationWizardStep2Upload'
import type { WordPairsList } from '@/lib/openai'
import type { CreateDictationInput } from '@/app/actions/dictation'

type WizardStep = 'choice' | 'upload' | 'manual'

interface DictationWizardProps {
	id?: string
	initialData?: CreateDictationInput & {
		id?: string
		isPublic?: boolean
	}
}

export function DictationWizard({ id, initialData }: DictationWizardProps) {
	const [currentStep, setCurrentStep] = useState<WizardStep>(id ? 'manual' : 'choice')
	const [uploadedData, setUploadedData] = useState<WordPairsList | null>(null)
	const [sourceLanguage, setSourceLanguage] = useState<string>(initialData?.sourceLanguage || 'Hebrew')
	const [targetLanguage, setTargetLanguage] = useState<string>(initialData?.targetLanguage || 'English')

	const handleChoice = (choice: 'upload' | 'manual') => {
		if (choice === 'upload') {
			setCurrentStep('upload')
		} else {
			setCurrentStep('manual')
		}
	}

	const handleUploadComplete = (data: WordPairsList) => {
		setUploadedData(data)
		setCurrentStep('manual')
	}

	const handleUploadCancel = () => {
		setCurrentStep('choice')
	}

	if (currentStep === 'choice') {
		return (
			<DictationWizardStep1
				onChoice={handleChoice}
			/>
		)
	}

	if (currentStep === 'upload') {
		return (
			<DictationWizardStep2Upload
				sourceLanguage={sourceLanguage}
				targetLanguage={targetLanguage}
				onSourceLanguageChange={setSourceLanguage}
				onTargetLanguageChange={setTargetLanguage}
				onComplete={handleUploadComplete}
				onCancel={handleUploadCancel}
			/>
		)
	}

	return (
		<DictationFormManual
			id={id}
			initialData={initialData}
			uploadedData={uploadedData}
			sourceLanguage={sourceLanguage}
			targetLanguage={targetLanguage}
			onSourceLanguageChange={setSourceLanguage}
			onTargetLanguageChange={setTargetLanguage}
		/>
	)
}

