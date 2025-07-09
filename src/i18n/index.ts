import zh_TW from "./zh_TW"
import en_US from './en_US'

type translationType = {
  [key in supportLocale]: Translation
}

/** all translations of items in every language supported */
const translations: translationType = {
  zh_TW, en_US,
}

export default function i18n(locale: supportLocale, item: i18nLabel): string {
  if (translations[locale] === undefined) locale = DEFAULT_LOCALE

  return translations[locale][item] || ""
}