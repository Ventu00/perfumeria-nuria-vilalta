import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateMarketCompetitorWorkflow } from "../../../../../workflows/market/workflows"
import { PostCompetitorUpdateType } from "../../validators"

// POST /admin/market/competitors/:id { name?, website?, is_active?, notes? }
export async function POST(
  req: MedusaRequest<PostCompetitorUpdateType>,
  res: MedusaResponse
) {
  const { result } = await updateMarketCompetitorWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })
  res.json({ competitor: result })
}
