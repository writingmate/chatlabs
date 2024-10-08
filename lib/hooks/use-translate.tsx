import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import "../../i18n"

const useTranslate = () => {
  const { t, i18n } = useTranslation()

  const translate = useCallback(
    (key: string) => {
      if (i18n.isInitialized) {
        return t(key)
      }
      return key
    },
    [i18n, t]
  )

  return {
    translate
  }
}

export default useTranslate
