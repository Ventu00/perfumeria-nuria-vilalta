import { model } from "@medusajs/framework/utils"
import Supplier from "./supplier"

// One line of a supplier tariff. Cost is per unit, without IVA.
const SupplierOffer = model
  .define("market_supplier_offer", {
    id: model.id({ prefix: "moff" }).primaryKey(),
    ean: model.text(),
    product_name: model.text().nullable(),
    brand: model.text().nullable(),
    cost: model.bigNumber(),
    min_units: model.number().default(1),
    tariff_date: model.dateTime(),
    is_demo: model.boolean().default(false),
    supplier: model.belongsTo(() => Supplier, { mappedBy: "offers" }),
  })
  .indexes([{ on: ["ean"] }])

export default SupplierOffer
