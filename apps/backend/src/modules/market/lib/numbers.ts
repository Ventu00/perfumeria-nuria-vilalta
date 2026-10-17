// Small number helpers shared by the price reader, the tariff importer and the
// scoring. Kept free of Medusa imports so they can be unit-tested directly.

export const IVA = 0.21

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Reads a price written the Spanish way ("1.234,56 €", "54,90") or the
 * schema.org way ("54.90", 54.9). Returns null when it is not a positive
 * number.
 */
export const parseAmount = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? round2(value) : null
  }
  if (typeof value !== "string") {
    return null
  }
  let s = value.replace(/[^0-9.,-]/g, "")
  if (!s || s === "-" || s.startsWith("-")) {
    return null
  }
  const lastComma = s.lastIndexOf(",")
  const lastDot = s.lastIndexOf(".")
  if (lastComma >= 0 && lastDot >= 0) {
    // The last separator is the decimal one.
    s =
      lastComma > lastDot
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "")
  } else if (lastComma >= 0) {
    // "54,90" is decimal; "1,234" (three digits after) is a thousands mark.
    s = /,\d{3}$/.test(s) && s.split(",").length === 2 && !/^0,/.test(s)
      ? s.replace(/,/g, "")
      : s.replace(/,/g, ".")
    if (s.split(".").length > 2) {
      return null
    }
  } else if ((s.match(/\./g) ?? []).length > 1) {
    // "1.234.567" can only be thousands marks.
    s = s.replace(/\./g, "")
  }
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? round2(n) : null
}

export const toCents = (n: number) => Math.round(n * 100)

/** Highest price ending in ,90 that is not above `n` (55,40 -> 54,90). */
export const roundDownTo90 = (n: number) => {
  const cents = toCents(n)
  return (Math.floor((cents + 10) / 100) * 100 - 10) / 100
}

/** Lowest price ending in ,90 that is not below `n` (41,23 -> 41,90). */
export const roundUpTo90 = (n: number) => {
  const cents = Math.ceil(n * 100 - 1e-6)
  return (Math.ceil((cents + 10) / 100) * 100 - 10) / 100
}

export const median = (values: number[]): number | null => {
  if (!values.length) {
    return null
  }
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[mid]
    : round2((sorted[mid - 1] + sorted[mid]) / 2)
}

export const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n))

/** "54,90 €" */
export const formatEuros = (n: number) =>
  `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`

/** "Druni", "Druni y Primor", "Druni, Primor y Notino" */
export const joinNames = (names: string[]) =>
  names.length <= 1
    ? names.join("")
    : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`

/** True when the digits form a valid EAN-8, UPC-A, EAN-13 or GTIN-14. */
export const isValidGtin = (code: string) => {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) {
    return false
  }
  const digits = code.split("").map(Number)
  const check = digits.pop()!
  const sum = digits
    .reverse()
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check
}

/**
 * Cleans an EAN typed or exported from Excel: keeps the digits, turns numbers
 * like 8.4101e12 back into text and restores a leading zero Excel dropped.
 */
export const normalizeEan = (value: unknown): string | null => {
  let s: string
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null
    }
    s = BigInt(Math.round(value)).toString()
  } else if (typeof value === "string") {
    s = value.trim()
    if (/^\d+(\.\d+)?e\+?\d+$/i.test(s)) {
      s = BigInt(Math.round(Number(s))).toString()
    }
    s = s.replace(/[\s-]/g, "")
    if (!/^\d+$/.test(s)) {
      return null
    }
  } else {
    return null
  }
  if (s.length === 12 && !isValidGtin(s) && isValidGtin(`0${s}`)) {
    s = `0${s}`
  }
  return s
}
