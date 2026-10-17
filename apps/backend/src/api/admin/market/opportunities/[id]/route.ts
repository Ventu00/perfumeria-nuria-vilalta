import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateOpportunityStatusWorkflow } from "../../../../../workflows/market/workflows"
import { PostOpportunityStatusType } from "../../validators"

// POST /admin/market/opportunities/:id  { status: "hecha" | "descartada" | "pendiente" }
export async function POST(
  req: MedusaRequest<PostOpportunityStatusType>,
  res: MedusaResponse
) {
  const { result } = await updateOpportunityStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: req.validatedBody.status },
  })
  res.json({ opportunity: result })
}
