const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Uploads a file to Cloudinary using an unsigned preset.
 * @param {File} file
 * @returns {Promise<{secureUrl: string, deleteToken: string | null}>}
 */
export async function uploadToCloudinary(file) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', PRESET)
  fd.append('return_delete_token', 'true')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Cloudinary upload failed')
  }

  const data = await res.json()
  return {
    secureUrl: data.secure_url,
    deleteToken: data.delete_token || null,
  }
}

/**
 * Deletes an uploaded asset using a short-lived delete token.
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(token) {
  if (!token) return

  const body = new URLSearchParams()
  body.set('token', token)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/delete_by_token`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error('Cloudinary cleanup failed')
  }
}
