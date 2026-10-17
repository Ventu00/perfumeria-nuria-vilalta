import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { recomputeOpportunitiesWorkflow } from "../../../../workflows/market/workflows"

// POST /admin/market/recompute — scores every watched product again.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await recomputeOpportunitiesWorkflow(req.scope).run()
  res.json({
    products: result.scored.products,
    without_cost: result.scored.without_cost,
    created: result.saved.created,
    skipped: result.saved.skipped,
  })
}
