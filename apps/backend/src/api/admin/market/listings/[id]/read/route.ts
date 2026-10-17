import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readCompetitorPricesWorkflow } from "../../../../../../workflows/market/workflows"

// POST /admin/market/listings/:id/read — read this one page now (same polite
// rules as the nightly job: robots.txt, honest User-Agent, no retries).
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result } = await readCompetitorPricesWorkflow(req.scope).run({
    input: { listing_ids: [req.params.id] },
  })
  res.json({ result: result.results[0] ?? null })
}
