'use server'

import { signIn, signOut } from "@/lib/auth"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { initFirebaseApp } from "@/lib/firebase"

export async function handleCredentialsSignIn(email: string, password: string, redirectTo: string) {
  return signIn("credentials", { email, password, redirect: true, redirectTo })
}

export async function handleGoogleSignIn(redirectTo: string) {
  return signIn("google", { redirect: true, redirectTo })
}

export async function handleSignUp(email: string, password: string) {
  try {
    const auth = getAuth(initFirebaseApp())
    await createUserWithEmailAndPassword(auth, email, password)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function handleSignOut() {
  await signOut({ redirect: true, redirectTo: '/auth/signin' })
} 