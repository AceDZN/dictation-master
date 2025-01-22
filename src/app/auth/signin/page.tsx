import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignInForm from "./SignInForm"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  const session = await auth()
  const { from: _from } = await searchParams
  const from = typeof _from === 'string' ? _from : "/"
  
  if (session) {
    redirect(from)
  }

  return <SignInForm from={from} />
} 