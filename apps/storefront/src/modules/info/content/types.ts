// Inline text in blocks supports two markers:
//   [[target|label]]  a link. target is an info page slug (e.g. "privacidad"),
//                     a site path starting with "/", or an http(s)/mailto/tel URL.
//   [Texto]           a pending value, shown highlighted (e.g. "[NIF pendiente]").
export type Block =
  | string
  | { ul: string[] }
  | { h3: string }
  // Shown as one card per row, which reads well on a phone.
  | { cards: { head: string[]; rows: string[][] } }
  // A framed box, e.g. the model withdrawal form.
  | { box: string[] }

export type InfoSection = {
  heading: string
  blocks: Block[]
}

export type InfoPage = {
  title: string
  description: string
  intro?: string
  sections: InfoSection[]
}

export const INFO_SLUGS = [
  "envios-y-devoluciones",
  "preguntas-frecuentes",
  "condiciones-de-venta",
  "aviso-legal",
  "privacidad",
  "cookies",
] as const

export type InfoSlug = (typeof INFO_SLUGS)[number]

export type InfoContent = {
  updated: string
  otherPages: string
  pages: Record<InfoSlug, InfoPage>
}

// Values shared by the three languages, already formatted for that language.
export type InfoContext = {
  name: string
  company: string
  nif: string
  registry: string
  arbitration: string
  address: string
  phone: string
  // A mailto link, or the pending placeholder.
  email: string
  standard: string
  express: string
  rubi: string
  cutoff: string
  returnDays: number
}
