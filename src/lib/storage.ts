import { createClient } from '@/lib/supabase/client'

const BUCKETS = {
  listings: 'listing-images',
  avatars: 'avatars',
  contracts: 'contracts',
  chat: 'chat-attachments',
} as const

type BucketName = keyof typeof BUCKETS

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: BucketName,
  file: File,
  path: string
): Promise<string> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${path}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { error } = await supabase.storage
    .from(BUCKETS[bucket])
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(fileName)

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
 * Upload avatar image with auto-resize path
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
