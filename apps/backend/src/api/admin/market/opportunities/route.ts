import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { marketService } from "../helpers"
import { GetOpportunities } from "../validators"

// GET /admin/market/opportunities?status=pendiente|hecha|descartada|todas
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = GetOpportunities.safeParse(req.query)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Estado no válido.")
  }
  const status = parsed.data.status ?? "pendiente"
  const service = marketService(req)
  const [opportunities, settings, all] = await Promise.all([
    service.listOpportunities(status === "todas" ? {} : { status }, {
      order: { score: "DESC" },
      take: 300,
    }),
    service.getScoringSettings(),
    service.listOpportunities({}, { select: ["status", "is_demo"] }),
  ])
  const counts = { pendiente: 0, hecha: 0, descartada: 0 }
  for (const o of all) {
    counts[o.status]++
  }
  res.json({
    opportunities: opportunities.map((o) => ({
      ...o,
      suggested_price: o.suggested_price == null ? null : Number(o.suggested_price),
    })),
    counts,
    has_demo: all.some((o) => o.is_demo),
    settings,
  })
}
