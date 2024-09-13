import { supabase } from "@/lib/supabase/browser-client"

export const uploadGeneratedImage = async (path: string, image: File) => {
  const bucket = "generated_images"

  const imageSizeLimit = 6000000 // 6MB

  if (image.size > imageSizeLimit) {
    throw new Error(`Image must be less than ${imageSizeLimit / 1000000}MB`)
  }

  const { error } = await supabase.storage.from(bucket).upload(path, image, {
    upsert: true
  })

  if (error) {
    throw new Error("Error uploading image")
  }

  return path
}

export const getGeneratedImageFromStorage = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from("generated_images")
    .createSignedUrl(filePath, 60 * 60 * 24) // 24hrs

  if (error) {
    throw new Error("Error downloading message image")
  }

  return data.signedUrl
}
