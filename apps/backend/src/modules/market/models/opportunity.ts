import { model } from "@medusajs/framework/utils"

export const OPPORTUNITY_ACTIONS = [
  "comprar",
  "subir_precio",
  "bajar_precio",
  "destacar",
  "no_competir",
] as const

export const OPPORTUNITY_STATUSES = ["pendiente", "hecha", "descartada"] as const

// A suggested action for one product, ranked by score (0-100).
const Opportunity = model
  .define("market_opportunity", {
    id: model.id({ prefix: "mopp" }).primaryKey(),
    ean: model.text().nullable(),
    variant_id: model.text().nullable(),
    brand: model.text().nullable(),
    product_title: model.text(),
    score: model.float(),
    action: model.enum([...OPPORTUNITY_ACTIONS]),
    // Retail price with IVA, never below cost + minimum margin.
    suggested_price: model.bigNumber().nullable(),
    reason: model.text(),
    status: model.enum([...OPPORTUNITY_STATUSES]).default("pendiente"),
    // Factor values and inputs, so the screen can explain the score.
    factors: model.json().nullable(),
    computed_at: model.dateTime(),
    decided_at: model.dateTime().nullable(),
    is_demo: model.boolean().default(false),
  })
  .indexes([{ on: ["status"] }, { on: ["ean"] }])

export default Opportunity
