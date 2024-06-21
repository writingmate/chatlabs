type NameTitleWithHashID = {
  name?: string
  title?: string
  hashid: string
}

const MAX_SLUG_LENGTH = 100

export function slugify(item: NameTitleWithHashID): string {
  if (!item.hashid) {
    throw new Error("hashid is required")
  }
  if (!item.name && !item.title) {
    throw new Error("name or title is required")
  }
  const nameDash = (item.name || item.title)
    ?.trim()
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .slice(0, MAX_SLUG_LENGTH)
  return `${item.hashid}-${nameDash}`
}
