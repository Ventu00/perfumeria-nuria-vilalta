import { decodeText, guessMapping, parseCsv, parseTariffRows } from "../tariff"
import { normalizeEan, parseAmount, roundDownTo90, roundUpTo90 } from "../numbers"

describe("numbers", () => {
  it("parses Spanish and schema.org prices", () => {
    expect(parseAmount("54,90 €")).toBe(54.9)
    expect(parseAmount("1.234,56")).toBe(1234.56)
    expect(parseAmount("1,234.56")).toBe(1234.56)
    expect(parseAmount("54.90")).toBe(54.9)
    expect(parseAmount(12)).toBe(12)
    expect(parseAmount("gratis")).toBeNull()
    expect(parseAmount("-3")).toBeNull()
  })

  it("rounds to prices ending in ,90", () => {
    expect(roundDownTo90(55.4)).toBe(54.9)
    expect(roundDownTo90(54.9)).toBe(54.9)
    expect(roundUpTo90(41.23)).toBe(41.9)
    expect(roundUpTo90(41.9)).toBe(41.9)
    expect(roundUpTo90(41.91)).toBe(42.9)
  })

  it("cleans EANs from Excel", () => {
    expect(normalizeEan(2000000000015)).toBe("2000000000015")
    expect(normalizeEan("2.000000000015E+12")).toBe("2000000000015")
    expect(normalizeEan(" 2000 0000 00015 ")).toBe("2000000000015")
    // Excel dropped the leading zero of 0012345678905.
    expect(normalizeEan("012345678905")).toBe("012345678905")
    expect(normalizeEan("abc")).toBeNull()
  })
})

describe("tariff import", () => {
  it("maps Spanish headers", () => {
    expect(
      guessMapping(["Cód. barras", "Descripción", "Marca", "PVP", "Precio neto", "Uds. mínimas"])
    ).toEqual({ ean: 0, product_name: 1, brand: 2, cost: 4, min_units: 5 })
    expect(guessMapping(["EAN13", "Artículo", "Coste sin IVA", "Pedido mínimo", "Fecha tarifa"])).toEqual({
      ean: 0,
      product_name: 1,
      cost: 2,
      min_units: 3,
      tariff_date: 4,
    })
    // A plain "Precio" is the cost only when no better column exists.
    expect(guessMapping(["EAN", "Precio", "Coste"]).cost).toBe(2)
    expect(guessMapping(["EAN", "PVP recomendado", "Precio"]).cost).toBe(2)
  })

  it("reads a semicolon CSV saved by Excel in Windows-1252 with a title row", () => {
    const csv =
      "Tarifa otoño 2026 - Distribuciones Ejemplo;;;;\r\n" +
      "EAN;Descripción;Marca;Precio neto;Uds. mínimas\r\n" +
      "2000000000015;Ámbar Nocturno EDP 100 ml;Casa Demo;31,20;6\r\n" +
      '2000000000022;"Brisa de Azahar; EDT 50 ml";Casa Demo;18,75 €;3\r\n' +
      "2000000000023;EAN con dígito mal;Casa Demo;10,00;1\r\n" +
      "2000000000039;Sin coste;Casa Demo;;1\r\n" +
      ";;;;\r\n"
    const bytes = Buffer.from(csv, "latin1")
    const text = decodeText(bytes)
    expect(text).toContain("Descripción")
    const result = parseTariffRows(parseCsv(text), {
      defaultDate: new Date("2026-10-01T00:00:00Z"),
    })
    expect(result.header_row).toBe(1)
    expect(result.mapping).toMatchObject({ ean: "EAN", cost: "Precio neto", min_units: "Uds. mínimas" })
    expect(result.offers).toEqual([
      {
        ean: "2000000000015",
        cost: 31.2,
        min_units: 6,
        product_name: "Ámbar Nocturno EDP 100 ml",
        brand: "Casa Demo",
        tariff_date: new Date("2026-10-01T00:00:00Z"),
      },
      expect.objectContaining({ ean: "2000000000022", cost: 18.75, min_units: 3, product_name: "Brisa de Azahar; EDT 50 ml" }),
    ])
    expect(result.errors.map((e) => e.row)).toEqual([5, 6])
    expect(result.total_rows).toBe(4)
  })

  it("reads comma CSV, dates per row, costs with IVA and Excel-style rows", () => {
    const rows = parseCsv(
      "ean,product,cost con IVA,date\n2000000000046,Jardín 100,60.50,15/09/2026\n"
    )
    const r = parseTariffRows(rows)
    expect(r.offers[0].cost).toBe(50)
    expect(r.offers[0].tariff_date.toISOString()).toBe("2026-09-15T00:00:00.000Z")
    expect(r.warnings[0]).toMatch(/IVA/)

    const excel = parseTariffRows([
      ["EAN", "Coste", "Mínimo"],
      [2000000000053, 22.4, 12],
    ])
    expect(excel.offers[0]).toMatchObject({ ean: "2000000000053", cost: 22.4, min_units: 12 })
  })

  it("explains when it cannot find the columns", () => {
    const r = parseTariffRows(parseCsv("Referencia;Nombre\nA1;Algo\n"))
    expect(r.offers).toHaveLength(0)
    expect(r.errors[0].message).toMatch(/EAN/)
  })

  it("accepts a manual column mapping", () => {
    const r = parseTariffRows(
      [
        ["Código", "Importe A", "Importe B"],
        ["2000000000060", "9,99", "12,50"],
      ],
      { mapping: { ean: 0, cost: 2 } }
    )
    expect(r.offers[0].cost).toBe(12.5)
  })
})
