import { createClient } from '@/lib/supabase/client'

const BUCKETS = {
  listings: 'listing-images',
  avatars: 'avatars',
  contracts: 'contracts',
  chat: 'chat-attachments',
} as const

type BucketName = keyof typeof BUCKETS

// ---------------------------------------------------------------------------
// Image compression utility (client-side via canvas API)
// Compresses images > 2MB before upload
// ---------------------------------------------------------------------------
const MAX_UNCOMPRESSED_SIZE = 2 * 1024 * 1024 // 2MB

async function compressImage(file: File, maxWidth = 1920, quality = 0.82): Promise<File> {
  // Only compress images
  if (!file.type.startsWith('image/') || file.size <= MAX_UNCOMPRESSED_SIZE) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        resolve(file) // fallback to original
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }

          const ext = file.name.split('.').pop()?.toLowerCase()
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: blob.type, lastModified: Date.now() }
          )

          // Only use compressed if it's actually smaller
          resolve(compressedFile.size < file.size ? compressedFile : file)
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Erro ao processar imagem'))
    }

    img.src = url
  })
}

// ---------------------------------------------------------------------------
// Core upload/delete functions
// ---------------------------------------------------------------------------

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  path: string
): Promise<string> {
  const supabase = createClient()

  // Compress image if needed
  const processedFile = await compressImage(file)

  const fileExt = processedFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(BUCKETS[bucket])
    .upload(fileName, processedFile, {
      cacheControl: '3600',
      upsert: bucket === 'avatars', // upsert only for avatars
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  bucket: BucketName,
  files: File[],
  path: string
): Promise<string[]> {
  const urls = await Promise.all(
    files.map(file => uploadFile(bucket, file, path))
  )
  return urls
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: BucketName,
  url: string
): Promise<void> {
  const supabase = createClient()

  // Extract path from URL
  const bucketName = BUCKETS[bucket]
  const urlParts = url.split(`/${bucketName}/`)
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (error) throw error
}

/**
 * Get the public URL for a file in a given bucket
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(path)
  return publicUrl
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  return uploadFile('avatars', file, userId)
}

/**
 * Upload listing images
 */
export async function uploadListingImages(files: File[], listingId: string): Promise<string[]> {
  return uploadFiles('listings', files, listingId)
}

/**
 * Upload contract file
 */
export async function uploadContract(file: File, listingId: string): Promise<string> {
  return uploadFile('contracts', file, listingId)
}

/**
 * Upload chat attachment
 */
export async function uploadChatAttachment(file: File, conversationId: string): Promise<string> {
  return uploadFile('chat', file, conversationId)
}

// ---------------------------------------------------------------------------
// storageService - object-style API for convenience
// ---------------------------------------------------------------------------
export const storageService = {
  uploadListingImage: async (file: File, listingId: number | string): Promise<string> => {
    return uploadFile('listings', file, String(listingId))
  },

  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    return uploadFile('avatars', file, userId)
  },

  deleteListingImage: async (url: string): Promise<void> => {
    return deleteFile('listings', url)
  },

  getPublicUrl: (bucket: BucketName, path: string): string => {
    return getPublicUrl(bucket, path)
  },
}
