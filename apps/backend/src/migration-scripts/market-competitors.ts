import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKET_MODULE } from "../modules/market"
import MarketModuleService from "../modules/market/service"
import { createMarketCompetitorWorkflow } from "../workflows/market/workflows"

// Real competitors from the competitor analysis of October 2026. Product pages
// are added later from the panel; shops without a website are kept as notes.
const COMPETITORS = [
  { name: "Druni", website: "https://www.druni.es", notes: "Cadena nacional. Dos tiendas en Rubí (Avda. Barcelona y Francesc Macià), Sant Cugat y Terrassa." },
  { name: "Primor", website: "https://www.primor.eu", notes: "Cadena low cost. Sin tienda cerca; la más próxima en Barberà del Vallès." },
  { name: "Douglas", website: "https://www.douglas.es", notes: "Cadena selectiva. Descuentos del 36 % al 52 % en marcas masivas." },
  { name: "Sephora", website: "https://www.sephora.es", notes: "Prestigio y maquillaje. Tienda en ONA Sant Cugat; entrega en 5 h." },
  { name: "El Corte Inglés", website: "https://www.elcorteingles.es", notes: "Gran almacén. Centro en Sabadell; entrega en el día." },
  { name: "Notino", website: "https://www.notino.es", notes: "Solo online." },
  { name: "Amazon", website: "https://www.amazon.es", notes: "Solo online." },
  { name: "Lookfantastic", website: "https://eu.lookfantastic.com", notes: "Solo online." },
  { name: "Perfumeries Facial", website: null, notes: "Local: Sant Cugat (C/ Santa Maria 9) y C.C. Parc Vallès. Perfumería y cabina." },
  { name: "Equivalenza Rubí", website: null, notes: "Local: Pg. Francesc Macià 54. Perfumes de equivalencia." },
]

export default async function marketCompetitors({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const market: MarketModuleService = container.resolve(MARKET_MODULE)

  const existing = await market.listCompetitors({})
  const names = new Set(existing.map((c) => c.name.toLowerCase()))
  let created = 0
  for (const c of COMPETITORS) {
    if (names.has(c.name.toLowerCase())) {
      continue
    }
    await createMarketCompetitorWorkflow(container).run({ input: c })
    created++
  }
  logger.info(`Added ${created} competitors to the market analysis panel.`)
}
