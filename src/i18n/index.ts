import zh_TW from "./zh_TW"
import en_US from './en_US'
import { Translation, DEFAULT_LOCALE, i18nLabel, supportLocale } from "./declarations"

/** 預設為繁體中文(台灣) */
// const DEFAULT_LOCALE: supportLocale = 'zh_TW'
const i18nLabels: (keyof Translation)[] = Object.keys(zh_TW) as (i18nLabel)[]

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
export { /* DEFAULT_LOCALE, */ i18nLabels }