import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignUpForm from "./SignUpForm"

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  const from = typeof searchParams.from === 'string' ? searchParams.from : "/"

  if (session) {
    redirect(from)
  }

  return <SignUpForm from={from} />
} 