import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { importSupplierTariffWorkflow } from "../../../../../../workflows/market/workflows"
import { decodeText, parseCsv, parseTariffRows } from "../../../../../../modules/market/lib/tariff"
import { marketService } from "../../../helpers"
import { PostTariffType } from "../../../validators"

type Cell = string | number | boolean | Date | null

const readRows = async (filename: string, bytes: Buffer): Promise<Cell[][]> => {
  const isZip = bytes.subarray(0, 4).toString("binary") === "PK\x03\x04"
  const ext = filename.toLowerCase().split(".").pop()
  if (ext === "xls" && !isZip) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Este Excel es del formato antiguo (.xls). Ábrelo y guárdalo como .xlsx o como CSV, y súbelo otra vez."
    )
  }
  if (isZip || ext === "xlsx") {
    try {
      const { readSheet } = await import("read-excel-file/node")
      return (await readSheet(bytes)) as unknown as Cell[][]
    } catch {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No se ha podido leer el Excel. Prueba a guardarlo como CSV y súbelo otra vez."
      )
    }
  }
  if (ext === "pdf") {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Los PDF no se pueden leer automáticamente. Pide al proveedor la tarifa en Excel o CSV."
    )
  }
  return parseCsv(decodeText(bytes))
}

// POST /admin/market/suppliers/:id/tariff
// { filename, content_base64, mapping?, tariff_date?, dry_run? }
// With dry_run the file is only read and a preview returned.
export async function POST(req: MedusaRequest<PostTariffType>, res: MedusaResponse) {
  const body = req.validatedBody
  await marketService(req).retrieveSupplier(req.params.id)

  const bytes = Buffer.from(body.content_base64, "base64")
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "El archivo está vacío o es demasiado grande (máximo 8 MB)."
    )
  }
  const rows = await readRows(body.filename, bytes)
  const parsed = parseTariffRows(rows, {
    mapping: body.mapping,
    defaultDate: body.tariff_date ? new Date(`${body.tariff_date}T00:00:00Z`) : new Date(),
  })

  const summary = {
    headers: parsed.headers,
    mapping: parsed.mapping,
    total_rows: parsed.total_rows,
    valid_rows: parsed.offers.length,
    errors: parsed.errors.slice(0, 50),
    error_count: parsed.errors.length,
    warnings: parsed.warnings.slice(0, 20),
    preview: parsed.offers.slice(0, 15),
  }

  if (body.dry_run || !parsed.offers.length) {
    res.json({ imported: false, ...summary })
    return
  }

  const { result } = await importSupplierTariffWorkflow(req.scope).run({
    input: {
      supplier_id: req.params.id,
      offers: parsed.offers.map((o) => ({ ...o, tariff_date: o.tariff_date.toISOString() })),
    },
  })
  res.json({ imported: true, created: result.created, replaced: result.replaced, ...summary })
}
