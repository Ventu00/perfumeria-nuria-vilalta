import { model } from "@medusajs/framework/utils"

// Search interest for a product (EAN) or a brand. Only the demo seed writes
// here for now; step 4 of the plan (Google Trends, Search Console) will fill
// it with real readings.
const DemandSignal = model.define("market_demand_signal", {
  id: model.id({ prefix: "mdem" }).primaryKey(),
  ean: model.text().nullable(),
  brand: model.text().nullable(),
  // 0-100, the same scale as Google Trends.
  interest: model.number(),
  // Change against the previous period, in percent (40 means +40 %).
  growth_pct: model.number().default(0),
  source: model.text(),
  read_at: model.dateTime(),
  is_demo: model.boolean().default(false),
})

export default DemandSignal
