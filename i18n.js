import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

i18n
    .use(HttpApi) // loads translations from your backend server
    .use(LanguageDetector) // detects user language
    .use(initReactI18next) // passes the i18n instance to react-i18next
    .init({
        fallbackLng: 'en', // default language
        supportedLngs: [
            "ar",
            "bn",
            "de",
            "en",
            "es",
            "fr",
            "he",
            "id",
            "it",
            "ja",
            "ko",
            "pt",
            "ru",
            "si",
            "sv",
            "te",
            "vi",
            "zh"
        ], // supported languages
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // path to translation files
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain', 'classname'],
            caches: ['cookie'],
        },
        interpolation: {
            escapeValue: false, // React already does escaping
        },
    })

export default i18n
