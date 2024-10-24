export function getBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    `https://${process.env.VERCEL_URL}` ||
    "https://labs.writingmate.ai"
  )
}

export function getOgImageUrl(
  title?: string,
  description?: string,
  icon?: string
): string {
  const baseUrl = getBaseUrl()
  const params = new URLSearchParams()

  if (title) params.set("title", title)
  if (description) params.set("description", description)
  if (icon) params.set("logo", icon)

  console.log(`${baseUrl}/api/og?${params.toString()}`)

  return `${baseUrl}/api/og?${params.toString()}`
}
