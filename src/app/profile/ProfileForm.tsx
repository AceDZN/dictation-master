"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useFormStatus } from "react-dom"
import { updateUserProfile } from "./actions"
import { useSession } from "next-auth/react"
import { useTranslations } from 'next-intl'

function SubmitButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('Profile')
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('saving')}
        </div>
      ) : (
        t('saveChanges')
      )}
    </button>
  )
}

interface ProfileFormProps {
  userId: string
  initialName: string
  initialImage: string
}

export default function ProfileForm({ userId, initialName, initialImage }: ProfileFormProps) {
  const { update } = useSession()
  const t = useTranslations('Profile')
  const [previewImage, setPreviewImage] = useState<string>(initialImage)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [firstName, setFirstName] = useState(initialName.split(' ')[0] || '')
  const [lastName, setLastName] = useState(initialName.split(' ')[1] || '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('imageSizeError'))
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit() {
    setError(null)
    setSuccess(false)

    const file = fileInputRef.current?.files?.[0]
    const result = await updateUserProfile(userId, {
      firstName,
      lastName,
      profileImage: file,
      currentImageUrl: initialImage
    })

    if (result.success) {
      setSuccess(true)
      // Update the session and UI
      if (result.user) {
        // Pass the new data to trigger the update
        await update({
          user: {
            name: result.user.name,
            image: result.user.image
          }
        })
        // Update local state
        setFirstName(result.user.name?.split(' ')[0] || '')
        setLastName(result.user.name?.split(' ')[1] || '')
        if (result.user.image) {
          setPreviewImage(result.user.image)
        }
      }
    } else {
      setError(result.error || t('updateError'))
    }
  }

  return (
    <form action={handleSubmit} className="max-w-xl">
      <div className="space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('profileImage')}</label>
          <div className="mt-2 flex items-center space-x-6">
            <div 
              onClick={handleImageClick}
              className="relative h-24 w-24 cursor-pointer rounded-full overflow-hidden ring-2 ring-gray-200 hover:ring-indigo-500"
            >
              <Image
                src={previewImage || '/default-avatar.png'}
                alt={t('profileImage')}
                fill
                className="object-cover"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('change')}
            </button>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              {t('firstName')}
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              {t('lastName')}
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{t('updateSuccess')}</div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
} 