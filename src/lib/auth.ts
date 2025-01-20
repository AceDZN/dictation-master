import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { initFirebaseApp } from "./firebase"

export const {
  handlers/*: { GET, POST }*/,
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt"
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
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // If it's a Google sign in, update the token with additional user info
        if (account?.provider === "google") {
          token.name = user.name
          token.email = user.email
          token.picture = user.image
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Ensure we have the latest user info from the token
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }
      return session
    }
  },
}) 