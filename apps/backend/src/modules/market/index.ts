import { Module } from "@medusajs/framework/utils"
import MarketModuleService from "./service"

export const MARKET_MODULE = "market"

export default Module(MARKET_MODULE, {
  service: MarketModuleService,
})
