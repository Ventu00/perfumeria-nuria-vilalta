import { readFileSync } from "fs"
import { join } from "path"
import { extractProduct, looksLikeBotCheck } from "../extract"

const fixture = (name: string) =>
  readFileSync(join(__dirname, "fixtures", name), "utf8")

describe("extractProduct", () => {
  it("reads a JSON-LD Product with one Offer", () => {
    const r = extractProduct(fixture("jsonld-in-stock.html"), "2000000000015")
    expect(r).toEqual({
      price: 54.95,
      regular_price: null,
      currency_code: "eur",
      availability: "in_stock",
      is_promo: false,
      ean: "2000000000015",
      title: "Ámbar Nocturno Eau de Parfum 100 ml",
      source: "jsonld",
      ean_matches: true,
    })
  })

  it("reads a Product inside @graph with a strikethrough price and no stock", () => {
    const r = extractProduct(fixture("jsonld-graph-promo-out-of-stock.html"))
    expect(r?.price).toBe(39.95)
    expect(r?.regular_price).toBe(59)
    expect(r?.is_promo).toBe(true)
    expect(r?.availability).toBe("out_of_stock")
    expect(r?.ean).toBe("2000000000022")
  })

  it("picks the size whose EAN matches when a page lists several", () => {
    const html = fixture("jsonld-product-group-sizes.html")
    const big = extractProduct(html, "2000000000046")
    expect(big?.price).toBe(62)
    expect(big?.availability).toBe("limited")
    expect(big?.title).toBe("Jardín de Rubí EDP 100 ml")
    expect(big?.ean_matches).toBe(true)

    const small = extractProduct(html, "2000000000039")
    expect(small?.price).toBe(41.5)
    expect(small?.availability).toBe("in_stock")
  })

  it("flags an EAN mismatch instead of silently using another product", () => {
    const r = extractProduct(fixture("jsonld-product-group-sizes.html"), "2000000000107")
    expect(r?.ean_matches).toBe(false)
  })

  it("falls back to Open Graph product meta, using the sale price", () => {
    const r = extractProduct(fixture("opengraph-only.html"), "2000000000053")
    expect(r).toMatchObject({
      price: 57.8,
      regular_price: 68,
      is_promo: true,
      availability: "in_stock",
      source: "opengraph",
      title: "Cuero & Vainilla EDP 75 ml",
      ean_matches: true,
    })
  })

  it("reads og: prefixed tags with single quotes and oos", () => {
    const r = extractProduct(fixture("opengraph-out-of-stock.html"))
    expect(r).toMatchObject({
      price: 24.9,
      availability: "out_of_stock",
      is_promo: false,
      ean: null,
      ean_matches: null,
    })
  })

  it("returns null when the page has no structured price", () => {
    expect(extractProduct(fixture("no-product-data.html"))).toBeNull()
  })

  it("recognises a bot check page", () => {
    expect(extractProduct(fixture("bot-check.html"))).toBeNull()
    expect(looksLikeBotCheck(fixture("bot-check.html"))).toBe(true)
    expect(looksLikeBotCheck(fixture("jsonld-in-stock.html"))).toBe(false)
  })
})
