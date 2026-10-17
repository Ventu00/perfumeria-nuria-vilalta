import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { recordPriceSnapshotWorkflow } from "../../../../../../workflows/market/workflows"
import { marketService } from "../../../helpers"
import { PostManualSnapshotType } from "../../../validators"

// GET /admin/market/listings/:id/snapshots — price history of one page.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const snapshots = await marketService(req).listPriceSnapshots(
    { listing_id: req.params.id },
    { order: { read_at: "DESC" }, take: 120 }
  )
  res.json({
    snapshots: snapshots.map((s) => ({
      ...s,
      price: s.price == null ? null : Number(s.price),
      regular_price: s.regular_price == null ? null : Number(s.regular_price),
    })),
  })
}

// POST /admin/market/listings/:id/snapshots — price typed by hand, for shops
// whose pages cannot be read automatically.
export async function POST(
  req: MedusaRequest<PostManualSnapshotType>,
  res: MedusaResponse
) {
  const { result } = await recordPriceSnapshotWorkflow(req.scope).run({
    input: { listing_id: req.params.id, ...req.validatedBody },
  })
  res.status(201).json({ snapshot: result })
}
