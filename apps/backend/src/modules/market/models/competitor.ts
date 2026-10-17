import { model } from "@medusajs/framework/utils"
import CompetitorListing from "./competitor-listing"

// A shop we watch (Druni, Primor...). Only public product pages are read.
const Competitor = model
  .define("market_competitor", {
    id: model.id({ prefix: "mcomp" }).primaryKey(),
    name: model.text(),
    website: model.text().nullable(),
    is_active: model.boolean().default(true),
    notes: model.text().nullable(),
    // Rows created by the demo seed; the panel labels them "datos de ejemplo".
    is_demo: model.boolean().default(false),
    listings: model.hasMany(() => CompetitorListing, { mappedBy: "competitor" }),
  })
  .cascades({ delete: ["listings"] })

export default Competitor
