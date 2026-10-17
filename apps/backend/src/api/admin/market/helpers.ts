import { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MARKET_MODULE } from "../../../modules/market"
import MarketModuleService from "../../../modules/market/service"
import { IVA, median } from "../../../modules/market/lib/numbers"
import { loadOurVariants } from "../../../workflows/market/catalog"

export const marketService = (req: MedusaRequest) =>
  req.scope.resolve(MARKET_MODULE) as MarketModuleService

const num = (v: unknown) => (v == null ? null : Number(v))

const isAvailable = (a: string | undefined) => a === "in_stock" || a === "limited"

/**
 * Everything the "Competencia" tab shows, grouped by product (EAN): our price
 * and stock, and each shop's latest price and stock.
 */
export const competitionOverview = async (req: MedusaRequest) => {
  const service = marketService(req)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const [competitors, listings] = await Promise.all([
    service.listCompetitors({}, { order: { name: "ASC" } }),
    service.listCompetitorListings({}, { relations: ["competitor"], order: { created_at: "ASC" } }),
  ])
  const latest = await service.latestSnapshots(listings.map((l) => l.id))
  const eans = [...new Set(listings.map((l) => l.ean))]
  const [ours, offers] = await Promise.all([
    loadOurVariants(query, eans),
    eans.length ? service.listSupplierOffers({ ean: eans }) : Promise.resolve([]),
  ])

  const products = eans.map((ean) => {
    const rows = listings.filter((l) => l.ean === ean)
    const variant = ours.get(ean)
    const shops = rows.map((l) => {
      const s = latest.get(l.id)
      return {
        id: l.id,
        competitor_id: l.competitor?.id ?? null,
        competitor: l.competitor?.name ?? "",
        url: l.url,
        is_demo: l.is_demo,
        last_status: l.last_status,
        last_message: l.last_message,
        last_read_at: l.last_read_at,
        latest: s
          ? {
              price: num(s.price),
              regular_price: num(s.regular_price),
              availability: s.availability,
              is_promo: s.is_promo,
              read_at: s.read_at,
              source: s.source,
            }
          : null,
      }
    })
    const inStock = shops
      .filter((s) => s.latest && isAvailable(s.latest.availability))
      .map((s) => s.latest!.price)
      .filter((p): p is number => p != null)
    const offer = offers.find((o) => o.ean === ean)
    return {
      ean,
      title:
        variant?.title ?? offer?.product_name ?? rows.find((l) => l.title)?.title ?? `EAN ${ean}`,
      in_catalog: !!variant,
      our_price: variant?.price ?? null,
      our_stock: variant?.stock ?? null,
      market_median: median(inStock),
      is_demo: rows.some((l) => l.is_demo),
      listings: shops,
    }
  })

  return {
    competitors: competitors.map((c) => ({
      id: c.id,
      name: c.name,
      website: c.website,
      is_active: c.is_active,
      is_demo: c.is_demo,
      listings: listings.filter((l) => l.competitor?.id === c.id).length,
    })),
    products: products.sort((a, b) => a.title.localeCompare(b.title, "es")),
  }
}

/**
 * Offers of one supplier with the margin each leaves at today's market
 * price, and whether this supplier is the cheapest for that product.
 */
export const supplierOffersWithMargin = async (req: MedusaRequest, supplierId: string) => {
  const service = marketService(req)
  const offers = await service.listSupplierOffers(
    { supplier_id: supplierId },
    { order: { product_name: "ASC" } }
  )
  const eans = [...new Set(offers.map((o) => o.ean))]
  if (!eans.length) {
    return []
  }
  const [all, listings] = await Promise.all([
    service.listSupplierOffers({ ean: eans }),
    service.listCompetitorListings({ ean: eans, is_active: true }),
  ])
  const latest = await service.latestSnapshots(listings.map((l) => l.id))

  return offers.map((o) => {
    const prices = listings
      .filter((l) => l.ean === o.ean)
      .map((l) => latest.get(l.id))
      .filter((s) => s && isAvailable(s.availability) && s.price != null)
      .map((s) => Number(s!.price))
    const market = median(prices)
    const cost = Number(o.cost)
    const cheapest = Math.min(...all.filter((x) => x.ean === o.ean).map((x) => Number(x.cost)))
    return {
      id: o.id,
      ean: o.ean,
      product_name: o.product_name,
      brand: o.brand,
      cost,
      min_units: o.min_units,
      tariff_date: o.tariff_date,
      is_demo: o.is_demo,
      market_price: market,
      margin_pct:
        market != null
          ? Math.round(((market / (1 + IVA) - cost) / (market / (1 + IVA))) * 1000) / 10
          : null,
      is_cheapest: cost <= cheapest,
    }
  })
}
