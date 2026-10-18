import { Lang } from "@lib/i18n"
import { LEGAL, SHIPPING, SHOP, isPending } from "@lib/shop-info"
import ca from "./ca"
import en from "./en"
import es from "./es"
import { INFO_SLUGS, InfoContent, InfoContext, InfoSlug } from "./types"

export { INFO_SLUGS }
export type { InfoSlug }

const LOCALES: Record<Lang, string> = { es: "es-ES", ca: "ca-ES", en: "en-GB" }

const formatEur = (amount: number, lang: Lang) =>
  new Intl.NumberFormat(LOCALES[lang], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)

const buildContext = (lang: Lang): InfoContext => {
  const eur = (n: number) => formatEur(n, lang)

  return {
    name: SHOP.name,
    company: LEGAL.companyName,
    nif: LEGAL.nif,
    registry: LEGAL.registry,
    arbitration: LEGAL.consumerArbitration,
    address: `${SHOP.street}, ${SHOP.city}`,
    phone: `[[${SHOP.phoneHref}|${SHOP.phone}]]`,
    email: isPending(LEGAL.email)
      ? LEGAL.email
      : `[[mailto:${LEGAL.email}|${LEGAL.email}]]`,
    standard: eur(SHIPPING.standardPrice),
    standardFreeFrom: eur(SHIPPING.standardFreeFrom),
    express: eur(SHIPPING.expressPrice),
    rubi: eur(SHIPPING.rubiSameDayPrice),
    rubiFreeFrom: eur(SHIPPING.rubiSameDayFreeFrom),
    cutoff: SHIPPING.rubiSameDayCutoff,
    returnDays: SHIPPING.returnDays,
  }
}

const BUILDERS: Record<Lang, (c: InfoContext) => InfoContent> = { es, ca, en }

export const getInfoContent = (lang: Lang): InfoContent =>
  BUILDERS[lang](buildContext(lang))

export const isInfoSlug = (slug: string): slug is InfoSlug =>
  (INFO_SLUGS as readonly string[]).includes(slug)

// Footer labels that are not in the shared messages dictionary.
export const INFO_LABELS: Record<
  Lang,
  { faq: string; terms: string; legal: string; cookies: string }
> = {
  es: {
    faq: "Preguntas frecuentes",
    terms: "Condiciones de venta",
    legal: "Aviso legal",
    cookies: "Política de cookies",
  },
  ca: {
    faq: "Preguntes freqüents",
    terms: "Condicions de venda",
    legal: "Avís legal",
    cookies: "Política de galetes",
  },
  en: {
    faq: "FAQ",
    terms: "Terms of sale",
    legal: "Legal notice",
    cookies: "Cookie policy",
  },
}
