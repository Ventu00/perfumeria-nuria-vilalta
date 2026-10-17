import { model } from "@medusajs/framework/utils"
import CompetitorListing from "./competitor-listing"

// Price and stock of a competitor listing at one moment. Prices include IVA,
// as shown to shoppers.
const PriceSnapshot = model
  .define("market_price_snapshot", {
    id: model.id({ prefix: "msnap" }).primaryKey(),
    price: model.bigNumber().nullable(),
    regular_price: model.bigNumber().nullable(),
    currency_code: model.text().default("eur"),
    availability: model
      .enum(["in_stock", "out_of_stock", "limited", "preorder", "unknown"])
      .default("unknown"),
    is_promo: model.boolean().default(false),
    // jsonld, opengraph, manual or demo
    source: model.text(),
    read_at: model.dateTime(),
    is_demo: model.boolean().default(false),
    listing: model.belongsTo(() => CompetitorListing, { mappedBy: "snapshots" }),
  })
  .indexes([{ on: ["listing_id", "read_at"] }])

export default PriceSnapshot
