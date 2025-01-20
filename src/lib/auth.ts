import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getAuth, signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth"
import { initFirebaseApp } from "./firebase"

export const {
  handlers/*: { GET, POST }*/,
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        
        if (!email || !password) return null
        
        try {
          const auth = getAuth(initFirebaseApp())
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          )
          const user = userCredential.user
          if (user) {
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName,
              image: user.photoURL,
            }
          }
          return null
        } catch (error) {
          console.error("Error:", error)
          return null
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const auth = getAuth(initFirebaseApp())
          // Set persistence to LOCAL to persist the Firebase session
          await setPersistence(auth, browserLocalPersistence)
          
          // Create a Google credential with the token
          const credential = GoogleAuthProvider.credential(
            account.id_token,
            account.access_token
          )
          
          // Sign in to Firebase with the credential
          const result = await signInWithCredential(auth, credential)
          
          // Update the Next Auth user ID to match Firebase
          user.id = result.user.uid
          
          return true
        } catch (error) {
          console.error("Error syncing with Firebase:", error)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, account, trigger, session }) {
      console.log('JWT Callback:', { trigger, hasUser: !!user, hasSession: !!session })
      
      if (user) {
        // Always use the user object's ID as it will be the Firebase UID
        token.id = user.id
        if (account?.provider === "google") {
          token.name = user.name
          token.email = user.email
          token.picture = user.image
        }
      }

      // Handle updates to the session
      if (trigger === "update" && session?.user) {
        console.log('Updating token with:', session.user)
        token.name = session.user.name
        token.picture = session.user.image
      }

      console.log('Returning token:', token)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Always use the token's ID which will be the Firebase UID
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }
      return session
    }
  },
}) 