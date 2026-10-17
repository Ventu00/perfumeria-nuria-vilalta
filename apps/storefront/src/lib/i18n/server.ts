import { getLocale } from "@lib/data/locale-actions"
import { cache } from "react"
import { Lang, toLang, translate } from "./index"

export const getLang = cache(async (): Promise<Lang> => toLang(await getLocale()))

export const getT = async () => {
  const lang = await getLang()
  return (text: string) => translate(text, lang)
}
