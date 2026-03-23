// ============================================================
//  NOVA APP — Cloudinary Upload Service
//  FREE image/video hosting — no credit card needed
//
//  Setup (2 minutes):
//  1. Go to https://cloudinary.com and sign up free
//  2. From your Dashboard copy:
//     - Cloud Name  (e.g. "dxyz1234")
//     - Upload Preset (create one: Settings → Upload → Add preset
//       → set Signing Mode to "Unsigned" → save)
//  3. Paste them into the two constants below
// ============================================================

const CLOUD_NAME = 'dvb1jdak1'       // e.g. 'dxyz1234'
const UPLOAD_PRESET = 'nova_unsigned'// e.g. 

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`

// Generic uploader — returns { url, publicId }
const uploadToCloudinary = (file, folder, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve({ url: data.secure_url, publicId: data.public_id })
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed — check your Cloudinary config')))

    xhr.open('POST', CLOUDINARY_URL)
    xhr.send(formData)
  })
}

// Upload post image or video
export const uploadPostMedia = (file, uid, onProgress) =>
  uploadToCloudinary(file, `nova/posts/${uid}`, onProgress)

// Upload avatar / profile picture
export const uploadAvatar = async (file, uid, onProgress) => {
  const result = await uploadToCloudinary(file, `nova/avatars/${uid}`, onProgress)
  return result.url
}

// Upload story media
export const uploadStoryMedia = (file, uid, onProgress) =>
  uploadToCloudinary(file, `nova/stories/${uid}`, onProgress)

// Delete is handled via Cloudinary Admin API (server-side only)
// For client-side apps, just leave old files — free tier has 25GB
export const deleteMediaFile = async (publicId) => {
  console.log('Delete via Cloudinary Admin API if needed:', publicId)
}
