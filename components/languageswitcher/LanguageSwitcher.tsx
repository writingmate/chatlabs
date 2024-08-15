import React from "react"
import i18n from "../../i18n"

export default function LanguageSwitcher() {
  const changeLanguage = async (locale: string) => {
    try {
      await i18n.changeLanguage(locale)
      console.log(`Language changed to ${locale}`)
    } catch (err) {
      console.error(`Failed to change language: ${err}`)
    }
  }

  return (
    <select
      onChange={e => changeLanguage(e.target.value)}
      defaultValue={i18n.language}
      className="text-md rounded-lg border border-gray-300 bg-white p-1 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
    >
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="zh">简体中文</option>
    </select>
  )
}
