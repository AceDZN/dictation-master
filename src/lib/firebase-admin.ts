import { getApps, initializeApp, cert } from 'firebase-admin/app'

export function initAdminApp() {
  if (getApps().length) return getApps()[0]

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  )

  return initializeApp({
    credential: cert(serviceAccount)
  })
} 