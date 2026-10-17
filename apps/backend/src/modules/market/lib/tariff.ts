import { IVA, isValidGtin, normalizeEan, parseAmount } from "./numbers"

// Turns a supplier tariff (CSV or the rows of an Excel sheet) into offers.
// Column names are matched loosely, the way Spanish suppliers usually write
// them: "EAN", "Cód. barras", "Precio neto", "Coste", "Uds. mínimas"...

export type TariffField =
  | "ean"
  | "cost"
  | "min_units"
  | "product_name"
  | "brand"
  | "tariff_date"

export type ColumnMapping = Partial<Record<TariffField, number>>

export type TariffOffer = {
  ean: string
  cost: number
  min_units: number
  product_name: string | null
  brand: string | null
  tariff_date: Date
}

export type TariffParseResult = {
  offers: TariffOffer[]
  errors: { row: number; message: string }[]
  warnings: string[]
  headers: string[]
  header_row: number
  mapping: Partial<Record<TariffField, string>>
  total_rows: number
}

type Cell = string | number | boolean | Date | null | undefined

export const normalizeHeader = (h: unknown) =>
  String(h ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

// Most specific first; the first field whose list matches wins.
const SYNONYMS: [TariffField, string[]][] = [
  [
    "ean",
    [
      "ean", "ean13", "ean 13", "ean8", "gtin", "gtin13", "upc", "codigo ean",
      "cod ean", "codigo de barras", "codigo barras", "cod barras", "cod de barras",
      "c barras", "barcode", "bar code", "cb",
    ],
  ],
  [
    "min_units",
    [
      "unidades minimas", "unidad minima", "uds minimas", "ud minima", "uds min",
      "unid min", "unid minimas", "cantidad minima", "cant minima", "cant min",
      "pedido minimo", "minimo", "min", "moq", "min units", "minimum", "lote minimo",
      "multiplo", "uds pedido",
    ],
  ],
  [
    "cost",
    [
      "coste", "costo", "coste unitario", "coste sin iva", "coste neto", "precio coste",
      "precio de coste", "precio neto", "neto", "p neto", "pvd", "precio distribuidor",
      "precio mayorista", "precio sin iva", "precio compra", "precio de compra",
      "precio tienda", "tarifa", "cost", "net price", "unit cost", "precio unitario",
      "precio", "importe", "price",
    ],
  ],
  ["brand", ["marca", "brand", "fabricante", "firma"]],
  [
    "product_name",
    [
      "descripcion", "descripcion articulo", "producto", "articulo", "nombre",
      "denominacion", "nombre producto", "description", "product", "name",
    ],
  ],
  [
    "tariff_date",
    ["fecha", "fecha tarifa", "fecha de tarifa", "vigencia", "valido desde", "desde", "date"],
  ],
]

// Retail prices must never be read as the cost.
const RETAIL = /\b(pvp|pvpr|pvr|precio venta|precio de venta|venta publico|recomendado|rrp|msrp)\b/

const matchRank = (header: string, words: string[], exact: boolean) =>
  words.findIndex((w) =>
    exact ? header === w : new RegExp(`(^| )${w}( |$)`).test(header)
  )

/**
 * For each field, the column whose title matches its most specific synonym:
 * exact titles first, then titles that contain a synonym.
 */
export const guessMapping = (headers: unknown[]): ColumnMapping => {
  const normalized = headers.map(normalizeHeader)
  const mapping: ColumnMapping = {}
  const used = new Set<number>()
  for (const exact of [true, false]) {
    for (const [field, words] of SYNONYMS) {
      if (mapping[field] !== undefined) {
        continue
      }
      let best: { index: number; rank: number } | null = null
      normalized.forEach((h, index) => {
        if (!h || used.has(index) || RETAIL.test(h)) {
          return
        }
        const rank = matchRank(h, words, exact)
        if (rank >= 0 && (!best || rank < best.rank)) {
          best = { index, rank }
        }
      })
      if (best) {
        mapping[field] = (best as { index: number }).index
        used.add((best as { index: number }).index)
      }
    }
  }
  return mapping
}

/** Detects ";" (Spanish Excel), "," or tab and splits quoted CSV. */
export const parseCsv = (text: string): string[][] => {
  const clean = text.replace(/^\uFEFF/, "")
  const firstLines = clean.split(/\r?\n/).slice(0, 5).join("\n")
  const count = (d: string) => firstLines.split(d).length - 1
  const delimiter = [";", "\t", ",", "|"].sort((a, b) => count(b) - count(a))[0]

  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (quoted) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += c
      }
    } else if (c === '"' && field === "") {
      quoted = true
    } else if (c === delimiter) {
      row.push(field)
      field = ""
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") {
        i++
      }
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += c
    }
  }
  if (field !== "" || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""))
}

/** UTF-8 when valid, otherwise Windows-1252 (what Excel in Spanish saves). */
export const decodeText = (buffer: Uint8Array): string => {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder("windows-1252").decode(buffer)
  }
}

const parseDate = (value: Cell): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === "number" && value > 20000 && value < 80000) {
    // Excel serial date.
    return new Date(Math.round((value - 25569) * 86400 * 1000))
  }
  if (typeof value !== "string") {
    return null
  }
  const s = value.trim()
  let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/)
  if (m) {
    const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3])
    const d = new Date(Date.UTC(year, Number(m[2]) - 1, Number(m[1])))
    return Number.isNaN(d.getTime()) ? null : d
  }
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  }
  return null
}

const text = (value: Cell) => {
  if (value == null) {
    return null
  }
  const s = String(value).trim()
  return s || null
}

/**
 * Finds the header row (suppliers often put a title above it), maps the
 * columns and reads every line. Lines with a bad EAN or cost are reported,
 * not imported.
 */
export const parseTariffRows = (
  rows: Cell[][],
  options: { mapping?: ColumnMapping; defaultDate?: Date } = {}
): TariffParseResult => {
  const warnings: string[] = []
  let headerRow = 0
  let mapping: ColumnMapping = options.mapping ?? {}
  if (!options.mapping) {
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const guess = guessMapping(rows[i] ?? [])
      if (guess.ean !== undefined && guess.cost !== undefined) {
        headerRow = i
        mapping = guess
        break
      }
    }
  }
  const headers = (rows[headerRow] ?? []).map((h) => String(h ?? "").trim())
  const named: Partial<Record<TariffField, string>> = {}
  for (const [field, index] of Object.entries(mapping)) {
    named[field as TariffField] = headers[index as number] ?? `Columna ${(index as number) + 1}`
  }

  const result: TariffParseResult = {
    offers: [],
    errors: [],
    warnings,
    headers,
    header_row: headerRow,
    mapping: named,
    total_rows: 0,
  }
  if (mapping.ean === undefined || mapping.cost === undefined) {
    result.errors.push({
      row: 0,
      message:
        "No encuentro las columnas de EAN y de coste. Comprueba que la primera fila tenga títulos como «EAN» y «Coste» o «Precio neto».",
    })
    return result
  }

  const costHeader = normalizeHeader(headers[mapping.cost])
  const costIncludesVat = /\b(con iva|iva incluido|iva incl|ivai)\b/.test(costHeader)
  if (costIncludesVat) {
    warnings.push("La columna de coste dice incluir IVA: se ha quitado el 21 % para guardar el coste sin IVA.")
  }

  const defaultDate = options.defaultDate ?? new Date()
  const seen = new Map<string, number>()

  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] ?? []
    const line = i + 1
    const rawEan = row[mapping.ean]
    const rawCost = row[mapping.cost]
    if ((rawEan == null || String(rawEan).trim() === "") && (rawCost == null || String(rawCost).trim() === "")) {
      continue
    }
    result.total_rows++
    const ean = normalizeEan(rawEan instanceof Date ? "" : rawEan)
    if (!ean || !isValidGtin(ean)) {
      result.errors.push({ row: line, message: `EAN no válido: «${text(rawEan as Cell) ?? ""}»` })
      continue
    }
    let cost = parseAmount(rawCost)
    if (cost == null || cost <= 0) {
      result.errors.push({ row: line, message: `Coste no válido: «${text(rawCost as Cell) ?? ""}»` })
      continue
    }
    if (costIncludesVat) {
      cost = Math.round((cost / (1 + IVA)) * 100) / 100
    }
    let minUnits = 1
    if (mapping.min_units !== undefined) {
      const raw = row[mapping.min_units]
      const n = parseAmount(raw)
      if (n != null && n >= 1) {
        minUnits = Math.round(n)
      }
    }
    const date =
      (mapping.tariff_date !== undefined ? parseDate(row[mapping.tariff_date]) : null) ??
      defaultDate
    const offer: TariffOffer = {
      ean,
      cost,
      min_units: minUnits,
      product_name: mapping.product_name !== undefined ? text(row[mapping.product_name]) : null,
      brand: mapping.brand !== undefined ? text(row[mapping.brand]) : null,
      tariff_date: date,
    }
    const previous = seen.get(ean)
    if (previous !== undefined) {
      warnings.push(`El EAN ${ean} aparece dos veces (filas ${previous} y ${line}); se usa la última.`)
      result.offers = result.offers.filter((o) => o.ean !== ean)
    }
    seen.set(ean, line)
    result.offers.push(offer)
  }
  return result
}
