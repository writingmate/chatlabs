export function isMobileScreen() {
  // return true if screen is narrow
  return window.innerWidth < 768
  if (typeof window === "undefined") {
    return false
  }
}
