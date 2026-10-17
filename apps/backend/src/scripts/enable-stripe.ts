import { ExecArgs } from "@medusajs/framework/types"
import configurePerfumeria from "../migration-scripts/perfumeria-configure"

// Run after setting STRIPE_API_KEY: npx medusa exec ./src/scripts/enable-stripe.ts
export default async function enableStripe({ container }: ExecArgs) {
  await configurePerfumeria({ container })
}
