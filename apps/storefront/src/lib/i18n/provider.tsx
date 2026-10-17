"use client"

import { createContext, useCallback, useContext } from "react"
import { Lang, translate } from "./index"

const LangContext = createContext<Lang>("es")

export const LangProvider = ({
  lang,
  children,
}: {
  lang: Lang
  children: React.ReactNode
}) => <LangContext.Provider value={lang}>{children}</LangContext.Provider>

export const useLang = () => useContext(LangContext)

export const useT = () => {
  const lang = useLang()
  return useCallback((text: string) => translate(text, lang), [lang])
}

// Usable from server and client components: <T>Texto en español</T>
export const T = ({ children }: { children: string }) => {
  const t = useT()
  return <>{t(children)}</>
}
