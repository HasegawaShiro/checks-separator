/** 預設為繁體中文(台灣) */
const DEFAULT_LOCALE = 'zh-TW'

/** declare all item need to be localized */
export const i18nLabels = ["title", "member", "addMember", "item", "addItem", "itemName", "amount", "dollar", "sheet", "total", "calculate", "result", "export", "export_at", "costSheet", "message_itemDuplicate", "message_memberDuplicate", "message_amountNeedNumber"] as const
type i18nLabel = typeof i18nLabels[number]

/** languages supported */
export enum supportLocales {
  "zh-TW" = "繁體中文(台灣)",
  "en-US" = "English"
}
export type supportLocale = keyof typeof supportLocales
type translationType = {
  [key in supportLocale]: {
    [itemKey in i18nLabel]: string
  }
}

/** all translations of item in every language supported */
const translations: translationType = {
  "zh-TW": { // by HasegawaShiro
    title: "分錢小工具",
    member: "成員",
    addMember: "新增成員",
    item: "品項",
    addItem: "新增品項",
    itemName: "品項名稱",
    amount: "金額",
    dollar: "元",
    sheet: "試算表",
    total: "總計",
    calculate: "計算",
    result: "結果",
    export: "輸出結果",

    export_at: "表單輸出時間",
    costSheet: "採買試算表",

    message_itemDuplicate: "品名已重複",
    message_memberDuplicate: "人員已重複",
    message_amountNeedNumber: "金額請輸入數字",
  },
  "en-US": { // by HasegawaShiro
    title: "Cost Dividing Calculator",
    member: "Members",
    addMember: "Add member",
    item: "Items",
    addItem: "Add item",
    itemName: "Name of Item",
    amount: "Price",
    dollar: "dollar",
    sheet: "Sheet",
    total: "Total",
    calculate: "Calculate",
    result: "Result",
    export: "Export",

    export_at: "Export at",
    costSheet: "Sheet of costs",

    message_itemDuplicate: "The item has duplicated.",
    message_memberDuplicate: "The member has duplicated.",
    message_amountNeedNumber: "Input number in price please.",
  },
}

export default function i18n(locale: supportLocale, item: i18nLabel): string {
  if (translations[locale] === undefined) locale = DEFAULT_LOCALE

  return translations[locale][item] || ""
}