// app/gallery/page.js
import ImageGallery from "@/components/image/image-gallery"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { BookImage } from "lucide-react"

const ITEMS_PER_PAGE = 9

async function fetchImages(searchTerm = "", page = 1) {
  "use server"
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const supabase = createClient(cookies())

  let query = supabase
    .from("messages")
    .select("annotation, content", { count: "exact" })
    .not("annotation", "is", null)
    .neq("annotation", "{}")
    .range(from, to)

  if (searchTerm) {
    query = query.textSearch("content", searchTerm)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching images:", error)
    return { data: [], count: 0 }
  }
  function findImageUrlInAnnotation(annotations: any) {
    const imageAnnotations = [
      "flux1Pro__imageGenerationViaFluxPro",
      "stableDiffusion3__imageGenerationViaStableDiffusion3",
      "imageGenerator__generateImage"
    ]

    for (const annotation of annotations) {
      for (const imageAnnotation of imageAnnotations) {
        if (annotation[imageAnnotation]) {
          const ann = annotation[imageAnnotation]

          if (typeof ann.result === "string") {
            // parse url or base64 from markdown image tag
            const match = ann.result.match(/!\[.*\]\((.*)\)/)
            if (match) {
              return match[1]
            }
          }

          if (ann.result?.url) {
            return ann.result.url
          }
        }

        return null
      }
    }
  }

  const imageUrls: string[] | undefined = data
    ?.map(x => findImageUrlInAnnotation(x.annotation))
    .filter(Boolean) // Adjust based on your JSON structure
  return { data: imageUrls || [], count: count || 0 }
}

export default async function GalleryPage() {
  const { data: initialImages, count } = await fetchImages()
  const initialTotalPages = Math.ceil((count || 1) / ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="p-6 text-center text-3xl font-bold">Image Gallery</h1>
      <ImageGallery
        initialImages={initialImages}
        initialTotalPages={initialTotalPages}
        fetchImages={fetchImages}
      />
    </div>
  )
}
