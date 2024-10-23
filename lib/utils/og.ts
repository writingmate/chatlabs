export function getOgImageUrl(title?: string, description?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const params = new URLSearchParams()

  if (title) params.set("title", title)
  if (description) params.set("description", description)

  return `${baseUrl}/api/og?${params.toString()}`
}
