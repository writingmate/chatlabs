"use client"
import { forwardRef } from "react"
import { Input, InputProps } from "@/components/ui/input"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

const Search = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <Input onChange={e => handleSearch(e.target.value)} ref={ref} {...props} />
  )
})

Search.displayName = "Search"

export default Search
