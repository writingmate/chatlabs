import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import HttpApi from "i18next-http-backend"

// Custom language detector
const classnameDetector = {
  name: "classname",
  lookup(options) {
    let found
    if (typeof document !== "undefined") {
      const htmlElement = document.documentElement
      const classNames = htmlElement.className.split(" ")
      classNames.forEach(className => {
        if (className.startsWith("lang-")) {
          found = className.replace("lang-", "")
        }
      })
    }
    return found
  },
  cacheUserLanguage(lng) {
    if (typeof document !== "undefined") {
      const htmlElement = document.documentElement
      const classNames = htmlElement.className
        .split(" ")
        .filter(c => !c.startsWith("lang-"))
      classNames.push(`lang-${lng}`)
      htmlElement.className = classNames.join(" ")
    }
  }
}

i18n
  .use(HttpApi) // loads translations from your backend server
  .use(LanguageDetector) // detects user language
  .use(initReactI18next) // passes the i18n instance to react-i18next
  .init({
    fallbackLng: "en", // default language
    supportedLngs: ["en", "jp", "kr", "zh"], // supported languages
    backend: {
      loadPath: "/locales/{{lng}}/translation.json" // path to translation files
    },
    detection: {
      order: [
        "classname",
        "querystring",
        "cookie",
        "localStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain"
      ],
      caches: ["cookie"]
    },
    interpolation: {
      escapeValue: false // React already does escaping
    }
  })

// Add the custom detector
i18n.services.languageDetector.addDetector(classnameDetector)

export default i18n
