import { getFirestore, Timestamp } from 'firebase-admin/firestore'

import { initAdminApp } from '@/lib/firebase-admin'

export interface UserSettings {
	preferredVoiceId?: string | null
	preferredVoiceLabel?: string | null
	updatedAt?: Timestamp
}

const COLLECTION_NAME = 'user_settings'

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
	if (!userId) {
		return null
	}

	const db = getFirestore(initAdminApp())
	const doc = await db.collection(COLLECTION_NAME).doc(userId).get()

	if (!doc.exists) {
		return null
	}

	return doc.data() as UserSettings
}

export async function updateUserSettings(
	userId: string,
	settings: Partial<UserSettings>,
): Promise<void> {
	if (!userId) {
		throw new Error('Missing user id for settings update')
	}

	const db = getFirestore(initAdminApp())
	await db
		.collection(COLLECTION_NAME)
		.doc(userId)
		.set(
			{
				...settings,
				updatedAt: Timestamp.now(),
			},
			{ merge: true },
		)
}

