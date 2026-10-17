import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateMarketSettingsWorkflow } from "../../../../workflows/market/workflows"
import { marketService } from "../helpers"
import { PostSettingsType } from "../validators"

// GET /admin/market/settings — scoring weights and minimum margin.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ settings: await marketService(req).getScoringSettings() })
}

// POST /admin/market/settings
export async function POST(req: MedusaRequest<PostSettingsType>, res: MedusaResponse) {
  const { result } = await updateMarketSettingsWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.json({ settings: result })
}
