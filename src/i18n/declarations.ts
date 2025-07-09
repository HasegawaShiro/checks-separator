/** languages supported */
export enum supportLocales {
  "zh_TW" = "繁體中文(台灣)",
  "en_US" = "English"
}
export type supportLocale = keyof typeof supportLocales
/** 預設為繁體中文(台灣) */
export const DEFAULT_LOCALE: supportLocale = 'zh_TW'

/** declare all item need to be localized */
export interface Translation {
  title: string,
  member: string,
  addMember: string,
  item: string,
  addItem: string,
  itemName: string,
  amount: string,
  dollar: string,
  sheet: string,
  total: string,
  calculate: string,
  result: string,
  export: string,
  export_at: string,
  costSheet: string,

  message_itemDuplicate: string,
  message_memberDuplicate: string,
  message_amountNeedNumber: string,
}
export type i18nLabel = keyof Translation