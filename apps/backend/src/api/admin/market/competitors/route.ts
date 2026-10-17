import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createMarketCompetitorWorkflow } from "../../../../workflows/market/workflows"
import { competitionOverview } from "../helpers"
import { PostCompetitorType } from "../validators"

// GET /admin/market/competitors — shops, and every watched product with each
// shop's latest price and stock.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json(await competitionOverview(req))
}

// POST /admin/market/competitors { name, website? }
export async function POST(req: MedusaRequest<PostCompetitorType>, res: MedusaResponse) {
  const { result } = await createMarketCompetitorWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ competitor: result })
}
