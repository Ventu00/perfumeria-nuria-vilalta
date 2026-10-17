import { model } from "@medusajs/framework/utils"
import Competitor from "./competitor"
import PriceSnapshot from "./price-snapshot"

// One competitor product page, matched to our catalogue by EAN and, when we
// sell it, to one of our product variants.
const CompetitorListing = model
  .define("market_competitor_listing", {
    id: model.id({ prefix: "mlist" }).primaryKey(),
    url: model.text(),
    ean: model.text(),
    title: model.text().nullable(),
    variant_id: model.text().nullable(),
    is_active: model.boolean().default(true),
    // Result of the last automatic read: ok, sin_datos, bloqueado, robots, error.
    last_status: model.text().nullable(),
    last_message: model.text().nullable(),
    last_read_at: model.dateTime().nullable(),
    is_demo: model.boolean().default(false),
    competitor: model.belongsTo(() => Competitor, { mappedBy: "listings" }),
    snapshots: model.hasMany(() => PriceSnapshot, { mappedBy: "listing" }),
  })
  .indexes([{ on: ["ean"] }])
  .cascades({ delete: ["snapshots"] })

export default CompetitorListing
