import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteCompetitorListingWorkflow } from "../../../../../workflows/market/workflows"

// DELETE /admin/market/listings/:id — stop watching this page.
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteCompetitorListingWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.json({ id: req.params.id, deleted: true })
}
