import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createCompetitorListingWorkflow } from "../../../../workflows/market/workflows"
import { PostListingType } from "../validators"

// POST /admin/market/listings { competitor_id, url, ean, title? }
// The listing is linked to our product with the same EAN automatically.
export async function POST(req: MedusaRequest<PostListingType>, res: MedusaResponse) {
  const { result } = await createCompetitorListingWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ listing: result })
}
