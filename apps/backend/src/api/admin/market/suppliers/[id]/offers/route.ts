import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { supplierOffersWithMargin } from "../../../helpers"

// GET /admin/market/suppliers/:id/offers — tariff lines with the margin each
// leaves at today's market price.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ offers: await supplierOffersWithMargin(req, req.params.id) })
}
