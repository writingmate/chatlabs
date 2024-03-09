import { useEffect } from "react"

export function useClickOutside(
  ref: React.RefObject<(HTMLElement | null) | (HTMLElement | null)[]>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current) {
        return
      }

      const elements: (HTMLElement | null)[] = Array.isArray(ref.current)
        ? ref.current
        : [ref.current]

      for (const element of elements) {
        if (!element) {
          continue
        }
        if (element && element.contains(event.target as Node)) {
          return
        }
      }

      handler(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}
