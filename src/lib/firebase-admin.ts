import { getApps, initializeApp, cert } from 'firebase-admin/app'

export function initAdminApp() {
  if (getApps().length) return getApps()[0]

  // Try to parse service account from environment variable
  let serviceAccount
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    if (serviceAccountStr) {
      serviceAccount = JSON.parse(serviceAccountStr)
    } else {
      // Fallback to individual environment variables
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }
    }
  } catch (error) {
    console.error('Error parsing service account:', error)
    throw new Error('Invalid service account configuration')
  }

  if (!serviceAccount.project_id) {
    throw new Error('Missing required service account field: project_id')
  }

  return initializeApp({
    credential: cert(serviceAccount)
  })
} 