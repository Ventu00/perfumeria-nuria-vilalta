import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

export const STRIPE_PROVIDER_ID = "pp_stripe_stripe"

// Names the store and turns on Stripe for every region when it is configured.
// Safe to run again: scripts/enable-stripe.ts reuses it after keys are added.
export default async function configurePerfumeria({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModule = container.resolve(Modules.STORE)
  const regionModule = container.resolve(Modules.REGION)
  const paymentModule = container.resolve(Modules.PAYMENT)

  const [store] = await storeModule.listStores()
  if (store) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { name: "Perfumería Núria Vilalta" },
      },
    })
  }

  const providers = await paymentModule.listPaymentProviders({
    id: STRIPE_PROVIDER_ID,
  })
  if (!providers.length) {
    logger.info("Stripe is not configured; skipping payment setup.")
    return
  }

  const regions = await regionModule.listRegions(
    {},
    { relations: ["payment_providers"] }
  )
  for (const region of regions) {
    const current = (region.payment_providers ?? []).map((p) => p.id)
    if (current.includes(STRIPE_PROVIDER_ID)) {
      continue
    }
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: [...current, STRIPE_PROVIDER_ID] },
      },
    })
  }
  logger.info("Stripe enabled for all regions.")
}
