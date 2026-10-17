import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createMarketSupplierWorkflow } from "../../../../workflows/market/workflows"
import { marketService } from "../helpers"
import { PostSupplierType } from "../validators"

// GET /admin/market/suppliers
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = marketService(req)
  const [suppliers, offers] = await Promise.all([
    service.listSuppliers({}, { order: { name: "ASC" } }),
    service.listSupplierOffers({}, { select: ["id", "supplier_id", "tariff_date"] }),
  ])
  res.json({
    suppliers: suppliers.map((s) => {
      const mine = offers.filter(
        (o) => (o as unknown as { supplier_id: string }).supplier_id === s.id
      )
      const last = mine
        .map((o) => new Date(o.tariff_date).getTime())
        .sort((a, b) => b - a)[0]
      return {
        ...s,
        min_order_amount: s.min_order_amount == null ? null : Number(s.min_order_amount),
        offers: mine.length,
        last_tariff_date: last ? new Date(last).toISOString() : null,
      }
    }),
  })
}

// POST /admin/market/suppliers
export async function POST(req: MedusaRequest<PostSupplierType>, res: MedusaResponse) {
  const { result } = await createMarketSupplierWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ supplier: result })
}
