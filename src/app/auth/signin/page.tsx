import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignInForm from "./SignInForm"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  const from = typeof searchParams.from === 'string' ? searchParams.from : "/"
  
  if (session) {
    redirect(from)
  }

  return <SignInForm from={from} />
} 