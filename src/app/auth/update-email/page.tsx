import { redirect } from 'next/navigation'
import { getAuth, applyActionCode } from 'firebase/auth'
import { initFirebaseApp } from '@/lib/firebase'

interface PageProps {
  searchParams: Promise<{ oobCode?: string | string[] }>
}

export default async function UpdateEmailPage({ searchParams }: PageProps) {
  const { oobCode: _oobCode } = await searchParams
  const oobCode = typeof _oobCode === 'string' ? _oobCode : undefined
  let error: string | null = null

  if (!oobCode) {
    error = 'Invalid email change link'
  } else {
    try {
      const auth = getAuth(initFirebaseApp())
      await applyActionCode(auth, oobCode)
      redirect('/?emailUpdated=true')
    } catch (err: any) {
      console.error('Error updating email:', err)
      error = 'This email change link is invalid or has expired'
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Email Change Confirmation
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 