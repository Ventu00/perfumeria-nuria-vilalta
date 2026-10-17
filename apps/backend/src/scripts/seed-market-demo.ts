/**
 * DEMO DATA ONLY for the "Análisis de mercado" screens.
 *
 *   npx medusa exec ./src/scripts/seed-market-demo.ts
 *
 * Creates, all marked as example data (is_demo = true, "ejemplo" in the
 * panel):
 * - 6 invented perfumes as DRAFT products (never visible in the shop), with
 *   made-up EANs from the 200-299 range, which GS1 reserves for in-store use,
 *   so they can never match a real product;
 * - the five shops we plan to watch (Druni, Primor, Notino, Douglas, El Corte
 *   Inglés) with listings that point at https://ejemplo.invalid/ addresses
 *   (never fetched) and INVENTED prices and stock: they are not real readings;
 * - two invented suppliers, one loaded from src/scripts/data/tarifa-ejemplo.csv
 *   through the same importer the panel uses;
 * - invented search-interest figures;
 * then computes the opportunities.
 *
 * Running it again replaces the previous demo market data (products are kept).
 * Pass "borrar" to remove all demo market data and the demo products:
 *
 *   npx medusa exec ./src/scripts/seed-market-demo.ts borrar
 */
import { existsSync, readFileSync } from "fs"
import { join } from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import { MARKET_MODULE } from "../modules/market"
import MarketModuleService from "../modules/market/service"
import { parseCsv, parseTariffRows } from "../modules/market/lib/tariff"
import {
  createCompetitorListingWorkflow,
  createMarketCompetitorWorkflow,
  createMarketSupplierWorkflow,
  importSupplierTariffWorkflow,
  recomputeOpportunitiesWorkflow,
} from "../workflows/market/workflows"

const HANDLE_PREFIX = "demo-mercado-"
const DEMO_NOTE = "Datos de EJEMPLO creados por seed-market-demo: precios y stock inventados."

type Stock = "in" | "out"
type ShopReading = [price: number, stock: Stock, promo?: boolean]

type DemoProduct = {
  ean: string
  title: string
  size: string
  brand: string
  /** Not in our catalogue when null. */
  ours: { price: number; stock: number } | null
  shops: Partial<Record<CompetitorName, ShopReading>>
}

const COMPETITORS = [
  { name: "Druni", website: "https://www.druni.es" },
  { name: "Primor", website: "https://www.primor.eu" },
  { name: "Notino", website: "https://www.notino.es" },
  { name: "Douglas", website: "https://www.douglas.es" },
  { name: "El Corte Inglés", website: "https://www.elcorteingles.es" },
] as const
type CompetitorName = (typeof COMPETITORS)[number]["name"]

// Each product is set up to show one kind of suggestion.
const PRODUCTS: DemoProduct[] = [
  {
    // Destacar: three shops out of stock, we have 6.
    ean: "2000000000015",
    title: "Ámbar Nocturno EDP",
    size: "100 ml",
    brand: "Casa Demo",
    ours: { price: 58.9, stock: 6 },
    shops: {
      Druni: [59.95, "out"],
      Primor: [57.9, "out"],
      Notino: [55.95, "in"],
      Douglas: [61, "in"],
      "El Corte Inglés": [62.5, "out"],
    },
  },
  {
    // Comprar: searches up, good margin, one left.
    ean: "2000000000022",
    title: "Brisa de Azahar EDT",
    size: "50 ml",
    brand: "Atelier Ficticio",
    ours: { price: 39.9, stock: 1 },
    shops: {
      Druni: [42.95, "in"],
      Primor: [43.5, "in"],
      Notino: [39.95, "in", true],
      Douglas: [44, "in"],
      "El Corte Inglés": [45, "in"],
    },
  },
  {
    // Bajar precio: we are well above the market and have margin.
    ean: "2000000000046",
    title: "Jardín de Rubí EDP",
    size: "100 ml",
    brand: "Casa Demo",
    ours: { price: 69.9, stock: 4 },
    shops: {
      Druni: [61.95, "in"],
      Primor: [60.5, "in"],
      Notino: [58.9, "in", true],
      Douglas: [64, "in"],
      "El Corte Inglés": [66, "in"],
    },
  },
  {
    // Subir precio: we are much cheaper than everyone.
    ean: "2000000000060",
    title: "Musgo Blanco Colonia",
    size: "200 ml",
    brand: "Atelier Ficticio",
    ours: { price: 21.9, stock: 8 },
    shops: {
      Druni: [26.95, "in"],
      Primor: [25.9, "in"],
      Notino: [24.99, "in"],
      Douglas: [27.5, "in"],
    },
  },
  {
    // No competir: chain bestseller on promotion everywhere, tiny margin.
    ean: "2000000000053",
    title: "Cuero y Vainilla EDP",
    size: "75 ml",
    brand: "Maison Inventada",
    ours: { price: 49.9, stock: 10 },
    shops: {
      Druni: [44.95, "in", true],
      Primor: [43.95, "in", true],
      Notino: [41.5, "in"],
      Douglas: [46, "in", true],
      "El Corte Inglés": [47.95, "in"],
    },
  },
  {
    // Comprar: we do not sell it yet, two shops are out of stock.
    ean: "2000000000077",
    title: "Rosa Mediterránea EDP",
    size: "30 ml",
    brand: "Maison Inventada",
    ours: null,
    shops: {
      Druni: [36.5, "out"],
      Primor: [35.9, "out"],
      Notino: [34.95, "in"],
    },
  },
  {
    // No supplier cost: shown under Competencia, no suggestion.
    ean: "2000000000084",
    title: "Té Verde Colonia",
    size: "100 ml",
    brand: "Atelier Ficticio",
    ours: { price: 19.9, stock: 3 },
    shops: {
      Druni: [18.95, "in"],
      Primor: [19.5, "in"],
    },
  },
]

const SECOND_SUPPLIER_OFFERS = [
  { ean: "2000000000015", cost: 26.1, min_units: 12, product_name: "Ámbar Nocturno EDP 100 ml", brand: "Casa Demo" },
  { ean: "2000000000046", cost: 27.4, min_units: 12, product_name: "Jardín de Rubí EDP 100 ml", brand: "Casa Demo" },
]

const DEMAND = [
  { brand: "Atelier Ficticio", interest: 72, growth_pct: 40 },
  { brand: "Maison Inventada", interest: 60, growth_pct: 25 },
  { brand: "Casa Demo", interest: 45, growth_pct: -5 },
]

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000)

const readTariffCsv = () => {
  for (const p of [
    join(__dirname, "data", "tarifa-ejemplo.csv"),
    join(process.cwd(), "src", "scripts", "data", "tarifa-ejemplo.csv"),
  ]) {
    if (existsSync(p)) {
      return readFileSync(p, "utf8")
    }
  }
  throw new MedusaError(MedusaError.Types.NOT_FOUND, "No encuentro src/scripts/data/tarifa-ejemplo.csv")
}

const removeDemoMarketData = async (market: MarketModuleService) => {
  const [competitors, listings, suppliers, signals, opportunities] = await Promise.all([
    market.listCompetitors({ is_demo: true }, { select: ["id"] }),
    market.listCompetitorListings({ is_demo: true }, { select: ["id"] }),
    market.listSuppliers({ is_demo: true }, { select: ["id"] }),
    market.listDemandSignals({ is_demo: true }, { select: ["id"] }),
    market.listOpportunities({ is_demo: true }, { select: ["id"] }),
  ])
  const snapshots = listings.length
    ? await market.listPriceSnapshots({ listing_id: listings.map((l) => l.id) }, { select: ["id"] })
    : []
  const offers = suppliers.length
    ? await market.listSupplierOffers({ supplier_id: suppliers.map((s) => s.id) }, { select: ["id"] })
    : []
  const ids = <T extends { id: string }>(rows: T[]) => rows.map((r) => r.id)
  await market.deletePriceSnapshots(ids(snapshots))
  await market.deleteCompetitorListings(ids(listings))
  await market.deleteSupplierOffers(ids(offers))
  await market.deleteSuppliers(ids(suppliers))
  await market.deleteDemandSignals(ids(signals))
  await market.deleteOpportunities(ids(opportunities))
  // Demo competitors are only removed when nobody added real pages to them.
  for (const c of competitors) {
    const remaining = await market.listCompetitorListings({ competitor_id: c.id }, { select: ["id"] })
    if (!remaining.length) {
      await market.deleteCompetitors(c.id)
    }
  }
}

export default async function seedMarketDemo({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const market = container.resolve(MARKET_MODULE) as MarketModuleService

  logger.info("[demo mercado] Removing previous demo market data...")
  await removeDemoMarketData(market)

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: PRODUCTS.map((p) => `${HANDLE_PREFIX}${slug(p.title)}`) },
  })

  if (args?.[0] === "borrar") {
    if (existingProducts.length) {
      await deleteProductsWorkflow(container).run({
        input: { ids: existingProducts.map((p) => p.id) },
      })
    }
    logger.info("[demo mercado] Demo data removed.")
    return
  }

  // 1. Our demo products (drafts), with price and stock.
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const [salesChannel] = await salesChannelModule.listSalesChannels({}, { take: 1 })
  const [location] = await stockLocationModule.listStockLocations({}, { take: 1 })
  const have = new Set(existingProducts.map((p) => p.handle))
  const toCreate = PRODUCTS.filter(
    (p) => p.ours && !have.has(`${HANDLE_PREFIX}${slug(p.title)}`)
  )
  if (toCreate.length) {
    const { result: created } = await createProductsWorkflow(container).run({
      input: {
        products: toCreate.map((p) => ({
          title: p.title,
          subtitle: p.brand,
          handle: `${HANDLE_PREFIX}${slug(p.title)}`,
          description:
            "PRODUCTO DE EJEMPLO creado por seed-market-demo para enseñar el análisis de mercado. No existe; bórralo cuando quieras.",
          status: ProductStatus.DRAFT,
          options: [{ title: "Tamaño", values: [p.size] }],
          sales_channels: salesChannel ? [{ id: salesChannel.id }] : [],
          variants: [
            {
              title: p.size,
              sku: `DEMO-${p.ean}`,
              ean: p.ean,
              manage_inventory: true,
              options: { Tamaño: p.size },
              prices: [{ amount: p.ours!.price, currency_code: "eur" }],
            },
          ],
        })),
      },
    })
    if (location) {
      const { data: variants } = await query.graph({
        entity: "product_variant",
        fields: ["ean", "inventory_items.inventory_item_id"],
        filters: { product_id: created.map((p) => p.id) },
      })
      const levels = variants.flatMap((v) => {
        const product = PRODUCTS.find((p) => p.ean === v.ean)
        return (v.inventory_items ?? []).map((item) => ({
          inventory_item_id: item!.inventory_item_id,
          location_id: location.id,
          stocked_quantity: product?.ours?.stock ?? 0,
        }))
      })
      if (levels.length) {
        await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: levels } })
      }
    } else {
      logger.warn("[demo mercado] No stock location found: demo products have no stock.")
    }
    logger.info(`[demo mercado] Created ${created.length} draft demo products.`)
  }

  // 2. Competitors, reusing a shop that already exists with the same name.
  const existingCompetitors = await market.listCompetitors({})
  const competitorId = new Map<string, string>()
  for (const c of COMPETITORS) {
    const found = existingCompetitors.find((e) => e.name.toLowerCase() === c.name.toLowerCase())
    if (found) {
      competitorId.set(c.name, found.id)
      continue
    }
    const { result } = await createMarketCompetitorWorkflow(container).run({
      input: { name: c.name, website: c.website, notes: DEMO_NOTE, is_demo: true },
    })
    competitorId.set(c.name, result.id)
  }

  // 3. Listings at made-up addresses, with three invented readings each.
  let readings = 0
  for (const p of PRODUCTS) {
    for (const [shop, reading] of Object.entries(p.shops) as [CompetitorName, ShopReading][]) {
      const { result: listing } = await createCompetitorListingWorkflow(container).run({
        input: {
          competitor_id: competitorId.get(shop)!,
          url: `https://ejemplo.invalid/${slug(shop)}/${slug(p.title)}-${slug(p.size)}`,
          ean: p.ean,
          title: `${p.title} ${p.size}`,
          is_demo: true,
        },
      })
      const [price, stock, promo] = reading
      await market.createPriceSnapshots([
        { days: 6, factor: 1.04, availability: "in_stock" as const, is_promo: false },
        { days: 3, factor: 1.02, availability: "in_stock" as const, is_promo: false },
        {
          days: 0,
          factor: 1,
          availability: stock === "in" ? ("in_stock" as const) : ("out_of_stock" as const),
          is_promo: !!promo,
        },
      ].map((r) => ({
        listing_id: listing.id,
        price: Math.round(price * r.factor * 100) / 100,
        regular_price: r.is_promo ? Math.round(price * 1.2 * 100) / 100 : null,
        availability: r.availability,
        is_promo: r.is_promo,
        source: "demo",
        read_at: daysAgo(r.days),
        is_demo: true,
      })))
      readings += 3
    }
  }
  logger.info(`[demo mercado] Created listings with ${readings} invented price readings.`)

  // 4. Suppliers: one through the CSV importer, one by hand.
  const { result: supplier } = await createMarketSupplierWorkflow(container).run({
    input: {
      name: "Distribuciones Ejemplo S.L. (ejemplo)",
      contact_name: "Contacto inventado",
      min_order_amount: 300,
      lead_time_days: 5,
      payment_terms: "30 días",
      notes: DEMO_NOTE,
      is_demo: true,
    },
  })
  const parsed = parseTariffRows(parseCsv(readTariffCsv()), { defaultDate: daysAgo(10) })
  if (parsed.errors.length) {
    logger.warn(`[demo mercado] Tariff lines with errors: ${JSON.stringify(parsed.errors)}`)
  }
  await importSupplierTariffWorkflow(container).run({
    input: {
      supplier_id: supplier.id,
      is_demo: true,
      offers: parsed.offers.map((o) => ({ ...o, tariff_date: o.tariff_date.toISOString() })),
    },
  })
  const { result: second } = await createMarketSupplierWorkflow(container).run({
    input: {
      name: "Perfumes Mayorista (ejemplo)",
      min_order_amount: 600,
      lead_time_days: 10,
      payment_terms: "Pago al pedido",
      notes: DEMO_NOTE,
      is_demo: true,
    },
  })
  await importSupplierTariffWorkflow(container).run({
    input: {
      supplier_id: second.id,
      is_demo: true,
      offers: SECOND_SUPPLIER_OFFERS.map((o) => ({ ...o, tariff_date: daysAgo(20).toISOString() })),
    },
  })
  logger.info(`[demo mercado] Imported ${parsed.offers.length + SECOND_SUPPLIER_OFFERS.length} supplier offers.`)

  // 5. Invented search interest per brand.
  await market.createDemandSignals(
    DEMAND.map((d) => ({ ...d, source: "ejemplo", read_at: daysAgo(1), is_demo: true }))
  )

  // 6. Score.
  const { result } = await recomputeOpportunitiesWorkflow(container).run()
  logger.info(
    `[demo mercado] ${result.saved.created} opportunities from ${result.scored.products} products (${result.scored.without_cost} without supplier cost). ALL OF THIS IS DEMO DATA.`
  )
}
