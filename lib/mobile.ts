export function isMobileScreen() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}
