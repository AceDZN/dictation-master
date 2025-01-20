import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { initFirebaseApp } from "./firebase"

const storage = getStorage(initFirebaseApp())

export async function uploadProfileImage(userId: string, file: File) {
  try {
    // Create a reference to the profile image
    const storageRef = ref(storage, `users/${userId}/profile.${file.name.split('.').pop()}`)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)
    return { success: true, url: downloadURL }
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteProfileImage(userId: string, imageUrl: string) {
  try {
    // Extract the path from the URL
    const path = imageUrl.split('/o/')[1].split('?')[0]
    const decodedPath = decodeURIComponent(path)
    const storageRef = ref(storage, decodedPath)
    
    await deleteObject(storageRef)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting image:", error)
    return { success: false, error: error.message }
  }
} 