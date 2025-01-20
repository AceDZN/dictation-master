'use server'

import { auth } from "@/lib/auth"
import { getAuth } from "firebase-admin/auth"
import { initAdminApp } from "@/lib/firebase-admin"
import { uploadProfileImage, deleteProfileImage } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    profileImage?: File
    currentImageUrl?: string
  }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.id !== userId) {
      throw new Error("Unauthorized")
    }

    const adminAuth = getAuth(initAdminApp())
    const updates: { displayName?: string; photoURL?: string } = {}

    // Update name if provided
    if (data.firstName || data.lastName) {
      const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
      if (displayName) {
        updates.displayName = displayName
      }
    }

    // Handle profile image update
    if (data.profileImage) {
      // Upload new image
      const uploadResult = await uploadProfileImage(userId, data.profileImage)
      if (!uploadResult.success) {
        throw new Error(uploadResult.error)
      }

      // Delete old image if exists
      if (data.currentImageUrl) {
        await deleteProfileImage(userId, data.currentImageUrl)
      }

      updates.photoURL = uploadResult.url
    }

    // Update user profile using Admin SDK
    if (Object.keys(updates).length > 0) {
      await adminAuth.updateUser(userId, updates)

      // Get the updated user data
      const updatedUser = await adminAuth.getUser(userId)

      // Force revalidation of the profile page
      revalidatePath('/profile')

      return { 
        success: true,
        user: {
          name: updatedUser.displayName || null,
          image: updatedUser.photoURL || null,
        }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }
} 