import { getApps, initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export function initFirebaseApp() {
  if (getApps().length) return getApps()[0]
  const app = initializeApp(firebaseConfig)
  if (typeof window !== "undefined") {
    getAnalytics(app)
  }
  return app
}

// Configure Google Auth Provider with the same client ID
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
}) 