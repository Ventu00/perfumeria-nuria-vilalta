import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  updateShippingOptionsWorkflow,
  updateStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"

// Shipping as the shop runs it: standard and express delivery, free pickup in
// the Rubí shop and same-day delivery in Rubí. No free-shipping threshold.
export const LOCAL_DELIVERY_NAME = "Entrega hoy en Rubí"
export const PICKUP_NAME = "Recoger en la tienda de Rubí"

const SHOP_ADDRESS = {
  address_1: "Passeig de Francesc Macià, 15",
  city: "Rubí",
  postal_code: "08191",
  province: "Barcelona",
  country_code: "ES",
  phone: "936972706",
}

const ALWAYS = [
  { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
  { attribute: "is_return", value: "false", operator: "eq" as const },
]

const eur = (amount: number) => [{ currency_code: "eur", amount }]

export default async function shopShipping({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id", "fulfillment_sets.type", "fulfillment_sets.service_zones.id"],
  })
  const location = locations[0]
  if (!location) {
    logger.warn("No stock location yet; shipping setup skipped.")
    return
  }

  await updateStockLocationsWorkflow(container).run({
    input: {
      selector: { id: location.id },
      update: { name: "Perfumería Núria Vilalta (Rubí)", address: SHOP_ADDRESS },
    },
  })

  const { data: profiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  })
  const profile = profiles.find((p) => p.type === "default") ?? profiles[0]

  const options = await fulfillment.listShippingOptions(
    {},
    { relations: ["type", "service_zone"] }
  )
  const byName = (name: string) => options.find((o) => o.name === name)

  // Standard and express from the initial seed get their real prices.
  const updates = [
    { option: byName("Envío estándar"), prices: eur(3.95) },
    { option: byName("Envío urgente"), prices: eur(6.95) },
    // Re-running the script also resets the same-day price.
    { option: byName(LOCAL_DELIVERY_NAME), prices: eur(2.95) },
  ].filter((u) => u.option)
  for (const { option, prices } of updates) {
    // Replaces the seed's placeholder prices (10 USD/EUR) entirely.
    await updateShippingOptionsWorkflow(container).run({
      input: [{ id: option!.id, prices }],
    })
    logger.info(`Updated prices of "${option!.name}".`)
  }

  const shippingSet = location.fulfillment_sets?.find((s) => s?.type === "shipping")
  const shippingZoneId = shippingSet?.service_zones?.[0]?.id

  if (shippingZoneId && profile && !byName(LOCAL_DELIVERY_NAME)) {
    // Offered to every address by Medusa; the storefront only shows it for
    // Rubí postcodes (see LOCAL_DELIVERY_POSTCODES in the storefront).
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: LOCAL_DELIVERY_NAME,
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: shippingZoneId,
          shipping_profile_id: profile.id,
          type: {
            label: "Hoy",
            description: "Pedidos antes de las 13:00, de lunes a sábado.",
            code: "local-same-day",
          },
          prices: eur(2.95),
          rules: ALWAYS,
        },
      ],
    })
    logger.info(`Created "${LOCAL_DELIVERY_NAME}".`)
  }

  if (profile && !byName(PICKUP_NAME)) {
    let pickupSet = location.fulfillment_sets?.find((s) => s?.type === "pickup")
    let pickupZoneId = pickupSet?.service_zones?.[0]?.id
    if (!pickupSet) {
      const created = await fulfillment.createFulfillmentSets({
        name: "Recogida en tienda",
        type: "pickup",
        service_zones: [
          {
            name: "Tienda de Rubí",
            geo_zones: [{ country_code: "es", type: "country" }],
          },
        ],
      })
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
        [Modules.FULFILLMENT]: { fulfillment_set_id: created.id },
      })
      pickupZoneId = created.service_zones[0].id
    }
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: PICKUP_NAME,
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: pickupZoneId!,
          shipping_profile_id: profile.id,
          type: {
            label: "Recogida",
            description: "Listo en 2 horas dentro del horario de la tienda.",
            code: "pickup",
          },
          prices: eur(0),
          rules: ALWAYS,
        },
      ],
    })
    logger.info(`Created "${PICKUP_NAME}".`)
  }
}
