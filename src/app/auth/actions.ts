'use server'

import { signIn, signOut } from "@/lib/auth"
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, verifyBeforeUpdateEmail } from "firebase/auth"
import { initFirebaseApp } from "@/lib/firebase"
import { APP_URL } from "@/lib/server-constants"

// Common action code settings
const getActionCodeSettings = (action: string) => ({
  url: `${APP_URL}/auth/${action}`,
  handleCodeInApp: true,
  // Optional settings
  iOS: {
    bundleId: 'com.acedzn.dictation'
  },
  android: {
    packageName: 'com.acedzn.dictation',
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: 'acedzn.xyz'
})

export async function handleCredentialsSignIn(email: string, password: string, redirectTo: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo
    })

    if (result?.error) {
      // Map Firebase error codes to user-friendly messages
      const errorCode = result.error
      let errorMessage = 'An error occurred during sign in'

      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password'
          break
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later'
          break
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection'
          break
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled'
          break
        case 'auth/requires-recent-login':
          errorMessage = 'Please sign in again to continue'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign in is not enabled'
          break
      }

      return {
        success: false,
        error: errorMessage,
        errorCode // Include the error code for debugging
      }
    }

    return { success: true, redirectTo }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again',
      errorCode: error?.code || 'unknown'
    }
  }
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

export async function handlePasswordReset(email: string) {
  try {
    const auth = getAuth(initFirebaseApp())
    await sendPasswordResetEmail(
      auth, 
      email, 
      getActionCodeSettings('reset-password')
    )
    return { 
      success: true,
      message: 'Password reset email sent successfully'
    }
  } catch (error: any) {
    console.error('Password reset error:', error)
    
    // Map Firebase error codes to user-friendly messages
    let errorMessage = 'Failed to send password reset email'
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address'
        break
      case 'auth/user-not-found':
        // For security reasons, we don't want to reveal if a user exists or not
        errorMessage = 'If an account exists with this email, you will receive a password reset link'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please try again later'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your internet connection'
        break
      case 'auth/unauthorized-continue-uri':
        errorMessage = 'The continue URL provided is not whitelisted'
        console.error('The domain needs to be whitelisted in Firebase Console')
        break
    }

    return {
      success: false,
      error: errorMessage,
      errorCode: error.code
    }
  }
}

export async function handleEmailVerification(user: any) {
  try {
    await sendEmailVerification(
      user,
      getActionCodeSettings('verify-email')
    )
    return {
      success: true,
      message: 'Verification email sent successfully'
    }
  } catch (error: any) {
    console.error('Email verification error:', error)
    return {
      success: false,
      error: 'Failed to send verification email',
      errorCode: error.code
    }
  }
}

export async function handleEmailChange(user: any, newEmail: string) {
  try {
    await verifyBeforeUpdateEmail(
      user,
      newEmail,
      getActionCodeSettings('update-email')
    )
    return {
      success: true,
      message: 'Email change verification sent successfully'
    }
  } catch (error: any) {
    console.error('Email change error:', error)
    let errorMessage = 'Failed to initiate email change'
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already associated with an account'
        break
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address'
        break
      case 'auth/requires-recent-login':
        errorMessage = 'Please sign in again to change your email'
        break
    }

    return {
      success: false,
      error: errorMessage,
      errorCode: error.code
    }
  }
} 