export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null

  return (...args: any[]) => {
    const later = () => {
      if (timeout) clearTimeout(timeout)
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
