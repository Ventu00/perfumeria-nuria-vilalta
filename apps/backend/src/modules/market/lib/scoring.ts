import { Availability } from "./extract"
import {
  clamp,
  formatEuros,
  IVA,
  joinNames,
  median,
  roundDownTo90,
  roundUpTo90,
} from "./numbers"

// Opportunity score, as in section 4 of estrategia-analisis-mercado.md:
//
//   Puntuación = Demanda x 0,35 + Margen x 0,30 + Hueco x 0,25 - Presión x 0,10
//
// Every factor is 0-100. Retail prices (ours and the competitors') include
// 21 % IVA; supplier costs do not. The suggested price is the higher of the
// minimum price (cost + minimum margin) and a price just under the market
// median, so it is never below cost + minimum margin.

export type OpportunityAction =
  | "comprar"
  | "subir_precio"
  | "bajar_precio"
  | "destacar"
  | "no_competir"

export type ScoringSettings = {
  weight_demand: number
  weight_margin: number
  weight_gap: number
  weight_pressure: number
  /** Percent of the price without IVA, e.g. 25. */
  min_margin_pct: number
}

export const DEFAULT_SETTINGS: ScoringSettings = {
  weight_demand: 0.35,
  weight_margin: 0.3,
  weight_gap: 0.25,
  weight_pressure: 0.1,
  min_margin_pct: 25,
}

export type CompetitorReading = {
  competitor: string
  /** Price with IVA; null when the page showed none. */
  price: number | null
  availability: Availability
  is_promo: boolean
}

export type SupplierCost = {
  supplier: string
  /** Unit cost without IVA. */
  cost: number
  min_units: number
}

export type ProductInput = {
  ean: string
  title: string
  brand: string | null
  variant_id: string | null
  /** Our retail price with IVA, when we sell it. */
  our_price: number | null
  /** Units available in our stock; null when we do not stock it. */
  our_stock: number | null
  competitors: CompetitorReading[]
  offers: SupplierCost[]
  demand: { interest: number; growth_pct: number } | null
}

export type OpportunityResult = {
  ean: string
  variant_id: string | null
  brand: string | null
  product_title: string
  action: OpportunityAction
  score: number
  suggested_price: number | null
  reason: string
  factors: Record<string, unknown>
}

const isAvailable = (a: Availability) => a === "in_stock" || a === "limited"

const round1 = (n: number) => Math.round(n * 10) / 10

/** Next Spanish selling peak at least three weeks away, to say "compra antes de...". */
export const nextSeason = (now: Date) => {
  const year = now.getUTCFullYear()
  const nthWeekday = (y: number, month: number, weekday: number, n: number) => {
    const first = new Date(Date.UTC(y, month, 1))
    const offset = (weekday - first.getUTCDay() + 7) % 7
    return new Date(Date.UTC(y, month, 1 + offset + (n - 1) * 7))
  }
  const peaks = [year, year + 1].flatMap((y) => [
    { name: "San Valentín", date: new Date(Date.UTC(y, 1, 14)) },
    { name: "el Día del Padre", date: new Date(Date.UTC(y, 2, 19)) },
    { name: "el Día de la Madre", date: nthWeekday(y, 4, 0, 1) },
    {
      name: "Black Friday",
      date: new Date(nthWeekday(y, 10, 4, 4).getTime() + 86400000),
    },
    { name: "Navidad", date: new Date(Date.UTC(y, 11, 24)) },
  ])
  const limit = now.getTime() + 21 * 86400000
  const next = peaks
    .filter((p) => p.date.getTime() >= limit)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  const label = next.date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  })
  return { name: next.name, date: next.date, label }
}

export const scoreProduct = (
  input: ProductInput,
  settings: ScoringSettings = DEFAULT_SETTINGS,
  now: Date = new Date()
): OpportunityResult | null => {
  const readings = input.competitors.filter(
    (c) => c.price != null || c.availability !== "unknown"
  )
  const n = readings.length
  if (!n) {
    return null
  }

  const available = readings.filter((c) => isAvailable(c.availability))
  const outOfStock = readings.filter((c) => !isAvailable(c.availability))
  const promo = available.filter((c) => c.is_promo)
  const pricesInStock = available
    .map((c) => c.price)
    .filter((p): p is number => p != null)
  const allPrices = readings
    .map((c) => c.price)
    .filter((p): p is number => p != null)
  const marketMedian = median(pricesInStock.length ? pricesInStock : allPrices)

  const best = [...input.offers].sort((a, b) => a.cost - b.cost)[0] ?? null
  const minMargin = settings.min_margin_pct / 100
  const minPrice = best ? roundUpTo90((best.cost / (1 - minMargin)) * (1 + IVA)) : null
  const marketMarginPct =
    best && marketMedian
      ? ((marketMedian / (1 + IVA) - best.cost) / (marketMedian / (1 + IVA))) * 100
      : null

  // Factors, 0-100.
  const demandKnown = !!input.demand
  const demand = input.demand
    ? clamp(
        0.7 * clamp(input.demand.interest) +
          0.3 * clamp(50 + input.demand.growth_pct / 2)
      )
    : 50
  const margin = marketMarginPct != null ? clamp(marketMarginPct * 2) : 0
  const higherThanUs =
    input.our_price != null
      ? available.filter((c) => c.price != null && c.price > input.our_price!)
      : []
  const gap = clamp((100 * (outOfStock.length + 0.5 * higherThanUs.length)) / n)
  const pressure = clamp(
    100 * (0.7 * (available.length / n) + 0.3 * (promo.length / n))
  )

  const score = round1(
    clamp(
      demand * settings.weight_demand +
        margin * settings.weight_margin +
        gap * settings.weight_gap -
        pressure * settings.weight_pressure
    )
  )

  const nearMedian = marketMedian ? roundDownTo90(marketMedian) : null
  const suggested =
    minPrice != null && nearMedian != null
      ? Math.max(minPrice, nearMedian)
      : null

  const name = input.title
  const factors = {
    demanda: round1(demand),
    demanda_conocida: demandKnown,
    margen: round1(margin),
    hueco: round1(gap),
    presion: round1(pressure),
    pesos: settings,
    mediana_mercado: marketMedian,
    margen_mercado_pct: marketMarginPct != null ? round1(marketMarginPct) : null,
    mejor_coste: best?.cost ?? null,
    mejor_proveedor: best?.supplier ?? null,
    unidades_minimas: best?.min_units ?? null,
    precio_minimo: minPrice,
    nuestro_precio: input.our_price,
    nuestro_stock: input.our_stock,
    competidores: readings.length,
    sin_stock: outOfStock.map((c) => c.competitor),
    en_promocion: promo.map((c) => c.competitor),
  }
  const base = {
    ean: input.ean,
    variant_id: input.variant_id,
    brand: input.brand,
    product_title: name,
    score,
    factors,
  }
  const pct = (x: number) => `${Math.round(Math.abs(x))} %`
  const stock = input.our_stock ?? 0

  // 1. Competitors without stock while we have it: keep the price, show it.
  if (stock > 0 && outOfStock.length >= Math.max(1, Math.ceil(n / 2))) {
    const keep =
      input.our_price != null
        ? minPrice != null
          ? Math.max(input.our_price, minPrice)
          : input.our_price
        : suggested
    const raise =
      input.our_price != null && keep != null && keep > input.our_price
        ? ` y sube a ${formatEuros(keep)} para cubrir tu margen mínimo`
        : ""
    return {
      ...base,
      action: "destacar",
      suggested_price: keep,
      reason: `${joinNames(outOfStock.map((c) => c.competitor))} sin stock de ${name}; tú tienes ${stock} → ${
        raise ? "destácalo en la portada" : "mantén el precio y destácalo en la portada"
      }${raise}.`,
    }
  }

  // Without a supplier cost there is no margin, so no price advice.
  if (!best || marketMedian == null || marketMarginPct == null || minPrice == null) {
    return null
  }

  // 2. The market price leaves less than the minimum margin.
  if (marketMarginPct < settings.min_margin_pct) {
    return {
      ...base,
      action: "no_competir",
      suggested_price: minPrice,
      reason: `Margen del ${pct(marketMarginPct)} al precio de mercado (${formatEuros(
        marketMedian
      )}), por debajo de tu mínimo del ${pct(settings.min_margin_pct)} → no compitas online con ${name}; si lo vendes en tienda, no bajes de ${formatEuros(minPrice)}.`,
    }
  }

  // 3. Little or no stock, enough margin, and demand or a gap to fill: buy.
  const demandUp = demandKnown && demand >= 55
  if (stock <= 2 && (demandUp || outOfStock.length > 0)) {
    const season = nextSeason(now)
    const why =
      demandUp && input.demand
        ? `Búsquedas de ${input.brand ?? name} ${input.demand.growth_pct >= 0 ? "+" : "−"}${pct(
            input.demand.growth_pct
          )} este mes`
        : `${joinNames(outOfStock.map((c) => c.competitor))} sin stock`
    const have = input.our_stock == null ? "no lo tienes" : stock === 0 ? "no te queda" : stock === 1 ? "te queda 1" : `te quedan ${stock}`
    return {
      ...base,
      action: "comprar",
      suggested_price: suggested,
      reason: `${why}; margen con ${best.supplier} ${pct(marketMarginPct)} y ${have} → compra ${name} antes de ${season.name} (${season.label})${
        best.min_units > 1 ? `, mínimo ${best.min_units} unidades` : ""
      } y véndelo a ${formatEuros(suggested!)}.`,
    }
  }

  // 4. Price adjustments for products we sell.
  if (input.our_price != null && suggested != null) {
    const diff = ((input.our_price - marketMedian) / marketMedian) * 100
    if (input.our_price < minPrice) {
      return {
        ...base,
        action: "subir_precio",
        suggested_price: suggested,
        reason: `A ${formatEuros(input.our_price)}, ${name} te deja menos del ${pct(
          settings.min_margin_pct
        )} de margen → sube a ${formatEuros(suggested)}.`,
      }
    }
    if (diff > 5 && suggested < input.our_price - 0.5) {
      return {
        ...base,
        action: "bajar_precio",
        suggested_price: suggested,
        reason: `Eres un ${pct(diff)} más caro que la media en ${name} y te queda margen → baja a ${formatEuros(suggested)}.`,
      }
    }
    if (diff < -5 && suggested > input.our_price + 0.5) {
      return {
        ...base,
        action: "subir_precio",
        suggested_price: suggested,
        reason: `Eres un ${pct(diff)} más barato que la media en ${name} → sube a ${formatEuros(
          suggested
        )} y sigues en precio de mercado.`,
      }
    }
  }

  return null
}

export const ACTION_LABELS: Record<OpportunityAction, string> = {
  comprar: "Comprar",
  subir_precio: "Subir precio",
  bajar_precio: "Bajar precio",
  destacar: "Destacar",
  no_competir: "No competir",
}
