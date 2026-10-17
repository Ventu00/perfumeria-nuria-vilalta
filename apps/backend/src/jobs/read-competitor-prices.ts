import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  readCompetitorPricesWorkflow,
  recomputeOpportunitiesWorkflow,
} from "../workflows/market/workflows"

// Once a night: read price and stock from each watched competitor page
// (politely, see modules/market/lib/reader.ts), then refresh the suggestions.
// Set MARKET_READER_ENABLED=false to switch it off.
export default async function readCompetitorPricesJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (process.env.MARKET_READER_ENABLED === "false") {
    logger.info("Market reader disabled (MARKET_READER_ENABLED=false).")
    return
  }
  const { result } = await readCompetitorPricesWorkflow(container).run({ input: {} })
  const byStatus = result.results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})
  logger.info(
    `Market reader: ${result.saved} readings saved (${JSON.stringify(byStatus)}).`
  )
  const { result: recomputed } = await recomputeOpportunitiesWorkflow(container).run()
  logger.info(`Market opportunities: ${recomputed.saved.created} pending suggestions.`)
}

export const config = {
  name: "read-competitor-prices",
  // 04:30 every day, when shops have the least traffic.
  schedule: "30 4 * * *",
}
