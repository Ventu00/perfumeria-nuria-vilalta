import { ExecArgs } from "@medusajs/framework/types"
import storeLocales from "../migration-scripts/store-locales"

// Re-applies the store languages: npx medusa exec ./src/scripts/set-store-locales.ts
export default async function setStoreLocales({ container }: ExecArgs) {
  await storeLocales({ container })
}
