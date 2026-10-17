import { nextSeason, ProductInput, scoreProduct } from "../scoring"
import { IVA } from "../numbers"

const NOW = new Date("2026-10-17T10:00:00Z")

const base = (over: Partial<ProductInput> = {}): ProductInput => ({
  ean: "2000000000015",
  title: "Ámbar Nocturno 100 ml",
  brand: "Casa Demo",
  variant_id: "variant_1",
  our_price: 58,
  our_stock: 6,
  competitors: [
    { competitor: "Druni", price: 55, availability: "in_stock", is_promo: false },
    { competitor: "Primor", price: 56, availability: "in_stock", is_promo: false },
    { competitor: "Notino", price: 54, availability: "in_stock", is_promo: true },
  ],
  offers: [{ supplier: "Distribuciones Ejemplo", cost: 25, min_units: 6 }],
  demand: null,
  ...over,
})

const marginAt = (retail: number, cost: number) =>
  (retail / (1 + IVA) - cost) / (retail / (1 + IVA))

describe("scoreProduct", () => {
  it("applies the section 4 formula", () => {
    const r = scoreProduct(
      base({ demand: { interest: 80, growth_pct: 40 }, our_price: 55, our_stock: 1 }),
      undefined,
      NOW
    )!
    const f = r.factors as Record<string, number>
    expect(f.demanda).toBeCloseTo(0.7 * 80 + 0.3 * 70, 1)
    // median 55 -> 45,45 sin IVA; (45,45 - 25) / 45,45 = 45 % -> factor 90
    expect(f.margen_mercado_pct).toBeCloseTo(45, 0)
    expect(f.margen).toBeCloseTo(90, 0)
    // None out of stock, one (Primor) above our 55 -> 0.5 / 3
    expect(f.hueco).toBeCloseTo(16.7, 1)
    // All three sell it, one on promo -> 70 + 10
    expect(f.presion).toBeCloseTo(80, 1)
    const expected = f.demanda * 0.35 + f.margen * 0.3 + f.hueco * 0.25 - f.presion * 0.1
    expect(r.score).toBeCloseTo(expected, 0)
  })

  it("uses editable weights", () => {
    const a = scoreProduct(base(), undefined, NOW)
    const b = scoreProduct(
      base(),
      { weight_demand: 0, weight_margin: 1, weight_gap: 0, weight_pressure: 0, min_margin_pct: 25 },
      NOW
    )
    expect(b!.score).not.toBe(a!.score)
    expect(b!.score).toBeCloseTo((b!.factors as Record<string, number>).margen, 1)
  })

  it("destacar: competitors out of stock and we have it", () => {
    const r = scoreProduct(
      base({
        competitors: [
          { competitor: "Druni", price: 55, availability: "out_of_stock", is_promo: false },
          { competitor: "Primor", price: null, availability: "out_of_stock", is_promo: false },
          { competitor: "Notino", price: 54, availability: "in_stock", is_promo: false },
        ],
      }),
      undefined,
      NOW
    )!
    expect(r.action).toBe("destacar")
    expect(r.suggested_price).toBe(58)
    expect(r.reason).toBe(
      "Druni y Primor sin stock de Ámbar Nocturno 100 ml; tú tienes 6 → mantén el precio y destácalo en la portada."
    )
  })

  it("bajar precio: more expensive than the market with margin to spare", () => {
    const r = scoreProduct(base({ our_price: 62.5 }), undefined, NOW)!
    expect(r.action).toBe("bajar_precio")
    expect(r.suggested_price).toBe(54.9)
    expect(r.reason).toBe(
      "Eres un 14 % más caro que la media en Ámbar Nocturno 100 ml y te queda margen → baja a 54,90 €."
    )
  })

  it("subir precio: cheaper than the market", () => {
    const r = scoreProduct(base({ our_price: 49.9 }), undefined, NOW)!
    expect(r.action).toBe("subir_precio")
    expect(r.suggested_price).toBe(54.9)
    expect(r.reason).toMatch(/^Eres un 9 % más barato que la media/)
  })

  it("no competir: the market price leaves less than the minimum margin", () => {
    const r = scoreProduct(base({ offers: [{ supplier: "X", cost: 41, min_units: 1 }] }), undefined, NOW)!
    expect(r.action).toBe("no_competir")
    expect(r.reason).toMatch(/^Margen del 10 % al precio de mercado \(55,00 €\), por debajo de tu mínimo del 25 %/)
    // Floor: 41 / 0.75 * 1.21 = 66,15 -> 66,90
    expect(r.suggested_price).toBe(66.9)
    expect(marginAt(r.suggested_price!, 41)).toBeGreaterThanOrEqual(0.25)
  })

  it("comprar: demand up, good margin, little stock", () => {
    const r = scoreProduct(
      base({ our_stock: 1, demand: { interest: 70, growth_pct: 40 } }),
      undefined,
      NOW
    )!
    expect(r.action).toBe("comprar")
    expect(r.reason).toBe(
      "Búsquedas de Casa Demo +40 % este mes; margen con Distribuciones Ejemplo 45 % y te queda 1 → compra Ámbar Nocturno 100 ml antes de Black Friday (27 de noviembre), mínimo 6 unidades y véndelo a 54,90 €."
    )
  })

  it("never suggests a price below cost + minimum margin", () => {
    for (const cost of [10, 20, 30, 33, 36, 40, 45]) {
      for (const ourPrice of [30, 45, 55, 70]) {
        for (const minMargin of [15, 25, 40]) {
          const r = scoreProduct(
            base({ our_price: ourPrice, offers: [{ supplier: "X", cost, min_units: 1 }] }),
            { weight_demand: 0.35, weight_margin: 0.3, weight_gap: 0.25, weight_pressure: 0.1, min_margin_pct: minMargin },
            NOW
          )
          if (r?.suggested_price != null) {
            expect(marginAt(r.suggested_price, cost)).toBeGreaterThanOrEqual(minMargin / 100 - 1e-9)
          }
        }
      }
    }
  })

  it("gives no price advice without a supplier cost", () => {
    expect(scoreProduct(base({ our_price: 70, offers: [] }), undefined, NOW)).toBeNull()
  })

  it("returns null with no competitor data", () => {
    expect(scoreProduct(base({ competitors: [] }), undefined, NOW)).toBeNull()
  })
})

describe("nextSeason", () => {
  it("names the next peak at least three weeks away", () => {
    expect(nextSeason(NOW).name).toBe("Black Friday")
    expect(nextSeason(new Date("2026-11-20T00:00:00Z")).name).toBe("Navidad")
    expect(nextSeason(new Date("2026-12-10T00:00:00Z")).name).toBe("San Valentín")
  })
})
