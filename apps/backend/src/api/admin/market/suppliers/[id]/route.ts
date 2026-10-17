import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateMarketSupplierWorkflow } from "../../../../../workflows/market/workflows"
import { PostSupplierUpdateType } from "../../validators"

// POST /admin/market/suppliers/:id
export async function POST(
  req: MedusaRequest<PostSupplierUpdateType>,
  res: MedusaResponse
) {
  const { result } = await updateMarketSupplierWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })
  res.json({ supplier: result })
}
