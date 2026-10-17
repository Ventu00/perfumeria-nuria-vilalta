import { messages } from "./messages"

export type Lang = "es" | "ca" | "en"

export const LANGS: { code: Lang; locale: string; label: string }[] = [
  { code: "es", locale: "es-ES", label: "Español" },
  { code: "ca", locale: "ca-ES", label: "Català" },
  { code: "en", locale: "en-US", label: "English" },
]

// Medusa stores the locale as "ca-ES"; the UI only needs the language part.
export const toLang = (locale?: string | null): Lang => {
  const code = locale?.slice(0, 2).toLowerCase()
  return code === "ca" || code === "en" ? code : "es"
}

export const translate = (text: string, lang: Lang) => {
  if (lang === "es") {
    return text
  }
  return messages[text.replace(/\s+/g, " ").trim()]?.[lang] ?? text
}
