import { model } from "@medusajs/framework/utils"

// Single row with the scoring weights and minimum margin, editable in the panel.
const MarketSetting = model.define("market_setting", {
  id: model.id({ prefix: "mset" }).primaryKey(),
  weight_demand: model.float().default(0.35),
  weight_margin: model.float().default(0.3),
  weight_gap: model.float().default(0.25),
  weight_pressure: model.float().default(0.1),
  // Percent of the price without IVA (25 means 25 %).
  min_margin_pct: model.float().default(25),
})

export default MarketSetting
