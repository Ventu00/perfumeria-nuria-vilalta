import { model } from "@medusajs/framework/utils"
import SupplierOffer from "./supplier-offer"

const Supplier = model
  .define("market_supplier", {
    id: model.id({ prefix: "msup" }).primaryKey(),
    name: model.text(),
    contact_name: model.text().nullable(),
    email: model.text().nullable(),
    phone: model.text().nullable(),
    // Minimum order in euros without IVA.
    min_order_amount: model.bigNumber().nullable(),
    lead_time_days: model.number().nullable(),
    payment_terms: model.text().nullable(),
    notes: model.text().nullable(),
    is_demo: model.boolean().default(false),
    offers: model.hasMany(() => SupplierOffer, { mappedBy: "supplier" }),
  })
  .cascades({ delete: ["offers"] })

export default Supplier
