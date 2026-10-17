import { normalizeEan, parseAmount } from "./numbers"

// Reads the price and availability a shop publishes for search engines in a
// product page: schema.org JSON-LD (Product / Offer) first, then Open Graph
// product meta tags. Nothing else on the page is used.

export type Availability =
  | "in_stock"
  | "out_of_stock"
  | "limited"
  | "preorder"
  | "unknown"

export type ExtractedProduct = {
  price: number
  regular_price: number | null
  currency_code: string
  availability: Availability
  is_promo: boolean
  ean: string | null
  title: string | null
  source: "jsonld" | "opengraph"
  /** True/false when the page shows an EAN; null when it shows none. */
  ean_matches: boolean | null
}

type Json = Record<string, unknown>

const decodeEntities = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€")
    .replace(/&amp;/g, "&")

export const mapAvailability = (value: unknown): Availability => {
  if (typeof value !== "string") {
    return "unknown"
  }
  const v = value
    .toLowerCase()
    .replace(/^https?:\/\/schema\.org\//, "")
    .replace(/[\s_-]/g, "")
  if (["instock", "available", "onlineonly", "instoreonly", "disponible"].includes(v)) {
    return "in_stock"
  }
  if (["limitedavailability", "lowstock"].includes(v)) {
    return "limited"
  }
  if (["preorder", "presale", "backorder", "availablefororder"].includes(v)) {
    return "preorder"
  }
  if (
    ["outofstock", "oos", "soldout", "discontinued", "agotado", "unavailable"].includes(v)
  ) {
    return "out_of_stock"
  }
  return "unknown"
}

const asArray = <T>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v]

const hasType = (node: Json, type: string) =>
  asArray(node["@type"] as string | string[]).some(
    (t) => typeof t === "string" && t.replace(/^.*[/#]/, "") === type
  )

/** Every object in a JSON-LD tree, including @graph members and nested values. */
const walk = (value: unknown, out: Json[] = [], depth = 0): Json[] => {
  if (depth > 12 || value == null || typeof value !== "object") {
    return out
  }
  if (Array.isArray(value)) {
    value.forEach((v) => walk(v, out, depth + 1))
    return out
  }
  const node = value as Json
  out.push(node)
  for (const child of Object.values(node)) {
    if (child && typeof child === "object") {
      walk(child, out, depth + 1)
    }
  }
  return out
}

const parseJsonLoose = (raw: string): unknown => {
  const text = raw
    .trim()
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/^<!--/, "")
    .replace(/-->$/, "")
    .trim()
  try {
    return JSON.parse(text)
  } catch {
    // Some shops leave trailing commas or raw newlines inside strings.
    try {
      return JSON.parse(text.replace(/,\s*([}\]])/g, "$1").replace(/[\r\n\t]+/g, " "))
    } catch {
      return null
    }
  }
}

export const readJsonLdBlocks = (html: string): unknown[] => {
  const blocks: unknown[] = []
  const re =
    /<script\b[^>]*type\s*=\s*["']?application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const parsed = parseJsonLoose(m[1])
    if (parsed != null) {
      blocks.push(parsed)
    }
  }
  return blocks
}

const productEan = (node: Json): string | null => {
  for (const key of ["gtin13", "gtin", "gtin14", "gtin12", "gtin8", "ean", "isbn"]) {
    const v = node[key]
    if (typeof v === "string" || typeof v === "number") {
      const ean = normalizeEan(String(v))
      if (ean) {
        return ean
      }
    }
  }
  return null
}

type OfferRead = {
  price: number
  regular: number | null
  currency: string | null
  availability: Availability
}

const readOffer = (offer: Json): OfferRead | null => {
  let price: number | null = null
  let regular: number | null = null
  let currency =
    typeof offer.priceCurrency === "string" ? offer.priceCurrency : null

  for (const spec of asArray(offer.priceSpecification as Json | Json[])) {
    if (!spec || typeof spec !== "object") {
      continue
    }
    const amount = parseAmount(spec.price)
    if (amount == null) {
      continue
    }
    const kind = String(spec.priceType ?? "").replace(/^.*[/#]/, "")
    if (kind === "StrikethroughPrice" || kind === "ListPrice" || kind === "MSRP") {
      regular = amount
    } else if (price == null) {
      price = amount
      currency = currency ?? (typeof spec.priceCurrency === "string" ? spec.priceCurrency : null)
    }
  }

  price = parseAmount(offer.price) ?? price ?? parseAmount(offer.lowPrice)
  if (price == null || price <= 0) {
    return null
  }
  return {
    price,
    regular: regular != null && regular > price ? regular : null,
    currency,
    availability: mapAvailability(offer.availability),
  }
}

const offersOf = (product: Json): OfferRead[] =>
  asArray(product.offers as Json | Json[])
    .flatMap((o) =>
      o && typeof o === "object" && hasType(o, "AggregateOffer") && o.offers
        ? [o, ...asArray(o.offers as Json | Json[])]
        : [o]
    )
    .filter((o): o is Json => !!o && typeof o === "object")
    .map(readOffer)
    .filter((o): o is OfferRead => !!o)

type Candidate = {
  title: string | null
  ean: string | null
  offers: OfferRead[]
}

const fromJsonLd = (html: string): Candidate[] => {
  const nodes = readJsonLdBlocks(html).flatMap((b) => walk(b))
  const candidates: Candidate[] = []
  for (const node of nodes) {
    if (!hasType(node, "Product")) {
      continue
    }
    const offers = offersOf(node)
    if (!offers.length) {
      continue
    }
    candidates.push({
      title: typeof node.name === "string" ? decodeEntities(node.name) : null,
      ean: productEan(node),
      offers,
    })
  }
  return candidates
}

export const readMetaTags = (html: string): Record<string, string> => {
  const meta: Record<string, string> = {}
  const tagRe = /<meta\b([^>]*)>/gi
  const attrRe = /([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let tag: RegExpExecArray | null
  while ((tag = tagRe.exec(html))) {
    const attrs: Record<string, string> = {}
    let a: RegExpExecArray | null
    while ((a = attrRe.exec(tag[1]))) {
      attrs[a[1].toLowerCase()] = decodeEntities(a[3] ?? a[4] ?? a[5] ?? "")
    }
    const key = (attrs.property ?? attrs.name ?? attrs.itemprop)?.toLowerCase()
    if (key && attrs.content !== undefined && !(key in meta)) {
      meta[key] = attrs.content.trim()
    }
  }
  return meta
}

const fromOpenGraph = (html: string): Candidate | null => {
  const meta = readMetaTags(html)
  const listed = parseAmount(meta["product:price:amount"] ?? meta["og:price:amount"])
  const sale = parseAmount(meta["product:sale_price:amount"])
  const original = parseAmount(
    meta["product:original_price:amount"] ?? meta["og:price:standard_amount"]
  )
  const price = sale != null && listed != null && sale < listed ? sale : listed ?? sale
  if (price == null || price <= 0) {
    return null
  }
  const regularCandidates = [original, sale != null ? listed : null].filter(
    (n): n is number => n != null && n > price
  )
  const ean = normalizeEan(
    meta["product:ean"] ?? meta["product:gtin"] ?? meta["og:upc"] ?? meta["product:upc"] ?? ""
  )
  return {
    title: meta["og:title"] ?? null,
    ean,
    offers: [
      {
        price,
        regular: regularCandidates.length ? Math.max(...regularCandidates) : null,
        currency:
          meta["product:price:currency"] ?? meta["og:price:currency"] ?? null,
        availability: mapAvailability(
          meta["product:availability"] ?? meta["og:availability"]
        ),
      },
    ],
  }
}

/**
 * Extracts price and stock for the product with `expectedEan` (when the page
 * lists several sizes) from a product page. Returns null when the page carries
 * no structured product data.
 */
export const extractProduct = (
  html: string,
  expectedEan?: string | null
): ExtractedProduct | null => {
  const want = expectedEan ? normalizeEan(expectedEan) : null
  const jsonLd = fromJsonLd(html)
  let source: ExtractedProduct["source"] = "jsonld"
  let candidates = jsonLd
  if (!candidates.length) {
    const og = fromOpenGraph(html)
    candidates = og ? [og] : []
    source = "opengraph"
  }
  if (!candidates.length) {
    return null
  }

  const chosen =
    (want && candidates.find((c) => c.ean === want)) ||
    // A page with one size and no EAN, or several sizes and none matching:
    // take the first product, and report the EAN mismatch.
    candidates[0]

  // Several offers (sellers or sizes) for one product: prefer one in stock,
  // then the cheapest.
  const offers = [...chosen.offers].sort((a, b) => {
    const rank = (o: OfferRead) =>
      o.availability === "in_stock" || o.availability === "limited" ? 0 : 1
    return rank(a) - rank(b) || a.price - b.price
  })
  const offer = offers[0]

  return {
    price: offer.price,
    regular_price: offer.regular,
    currency_code: (offer.currency ?? "EUR").toLowerCase(),
    availability: offer.availability,
    is_promo: offer.regular != null,
    ean: chosen.ean,
    title: chosen.title,
    source,
    ean_matches: want && chosen.ean ? chosen.ean === want : null,
  }
}

/** Signs that the shop answered with a bot check instead of the product page. */
export const looksLikeBotCheck = (html: string) =>
  /captcha|cf-chl|challenge-platform|just a moment\.\.\.|access denied|are you a robot|px-captcha|datadome/i.test(
    html.slice(0, 20000)
  )
