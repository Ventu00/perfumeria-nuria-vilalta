import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { MARKET_MODULE } from "../../modules/market"
import MarketModuleService from "../../modules/market/service"
import {
  OpportunityResult,
  ProductInput,
  ScoringSettings,
  scoreProduct,
} from "../../modules/market/lib/scoring"
import { Availability } from "../../modules/market/lib/extract"
import { loadOurVariants } from "./catalog"

const market = (container: { resolve: (k: string) => unknown }) =>
  container.resolve(MARKET_MODULE) as MarketModuleService

// ---------------------------------------------------------------- competitors

export type CompetitorInput = {
  name: string
  website?: string | null
  is_active?: boolean
  notes?: string | null
  is_demo?: boolean
}

export const createMarketCompetitorStep = createStep(
  "create-market-competitor",
  async (input: CompetitorInput, { container }) => {
    const competitor = await market(container).createCompetitors(input)
    return new StepResponse(competitor, competitor.id)
  },
  async (id, { container }) => {
    if (id) {
      await market(container).deleteCompetitors(id)
    }
  }
)

export const updateMarketCompetitorStep = createStep(
  "update-market-competitor",
  async (input: Partial<CompetitorInput> & { id: string }, { container }) => {
    const service = market(container)
    const before = await service.retrieveCompetitor(input.id)
    const competitor = await service.updateCompetitors(input)
    return new StepResponse(competitor, {
      id: before.id,
      name: before.name,
      website: before.website,
      is_active: before.is_active,
      notes: before.notes,
    })
  },
  async (before, { container }) => {
    if (before) {
      await market(container).updateCompetitors(before)
    }
  }
)

// ------------------------------------------------------------------- listings

export type ListingInput = {
  competitor_id: string
  url: string
  ean: string
  title?: string | null
  variant_id?: string | null
  is_demo?: boolean
}

/** Links the listing to our variant with the same EAN when there is one. */
export const createCompetitorListingStep = createStep(
  "create-competitor-listing",
  async (input: ListingInput, { container }) => {
    const service = market(container)
    await service.retrieveCompetitor(input.competitor_id)
    const existing = await service.listCompetitorListings({
      competitor_id: input.competitor_id,
      url: input.url,
    })
    if (existing.length) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "Esta dirección ya está guardada para esta tienda."
      )
    }
    let variantId = input.variant_id ?? null
    if (!variantId) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "product_variant",
        fields: ["id"],
        filters: { ean: input.ean },
      })
      variantId = data[0]?.id ?? null
    }
    const listing = await service.createCompetitorListings({
      ...input,
      variant_id: variantId,
    })
    return new StepResponse(listing, listing.id)
  },
  async (id, { container }) => {
    if (id) {
      await market(container).deleteCompetitorListings(id)
    }
  }
)

export const deleteCompetitorListingStep = createStep(
  "delete-competitor-listing",
  async (id: string, { container }) => {
    await market(container).softDeleteCompetitorListings(id)
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (id) {
      await market(container).restoreCompetitorListings(id)
    }
  }
)

// ------------------------------------------------------------ price readings

export type ReadingResult = {
  listing_id: string
  status: string
  message: string
  read_at: string
  data: {
    price: number
    regular_price: number | null
    currency_code: string
    availability: Availability
    is_promo: boolean
    source: string
  } | null
}

/**
 * Reads the given listings (or every active, non-demo listing of an active
 * competitor) from the shops' public pages.
 */
export const readCompetitorListingsStep = createStep(
  "read-competitor-listings",
  async (input: { listing_ids?: string[] }, { container }) => {
    const service = market(container)
    const listings = await service.listCompetitorListings(
      input.listing_ids?.length
        ? { id: input.listing_ids }
        : { is_active: true, is_demo: false },
      { relations: ["competitor"] }
    )
    const toRead = listings.filter(
      (l) => !l.is_demo && (input.listing_ids?.length || l.competitor?.is_active)
    )
    const demo = listings.filter((l) => l.is_demo)
    const read = await service.readCompetitorPages(
      toRead.map((l) => ({ id: l.id, url: l.url, ean: l.ean }))
    )
    const results: ReadingResult[] = [
      ...read.map(({ id, result, read_at }) => ({
        listing_id: id,
        status: result.status,
        message: result.message,
        read_at: read_at.toISOString(),
        data: result.data
          ? {
              price: result.data.price,
              regular_price: result.data.regular_price,
              currency_code: result.data.currency_code,
              availability: result.data.availability,
              is_promo: result.data.is_promo,
              source: result.data.source,
            }
          : null,
      })),
      // Demo listings point at made-up addresses: never fetch them.
      ...demo.map((l) => ({
        listing_id: l.id,
        status: "demo",
        message: "Dirección de ejemplo: no se lee.",
        read_at: new Date().toISOString(),
        data: null,
      })),
    ]
    return new StepResponse(results)
  }
)

export const saveCompetitorReadingsStep = createStep(
  "save-competitor-readings",
  async (results: ReadingResult[], { container }) => {
    const service = market(container)
    const ok = results.filter((r) => r.data)
    const snapshots = ok.length
      ? await service.createPriceSnapshots(
          ok.map((r) => ({
            listing_id: r.listing_id,
            price: r.data!.price,
            regular_price: r.data!.regular_price,
            currency_code: r.data!.currency_code,
            availability: r.data!.availability,
            is_promo: r.data!.is_promo,
            source: r.data!.source,
            read_at: new Date(r.read_at),
          }))
        )
      : []
    const real = results.filter((r) => r.status !== "demo")
    if (real.length) {
      await service.updateCompetitorListings(
        real.map((r) => ({
          id: r.listing_id,
          last_status: r.status,
          last_message: r.message,
          last_read_at: new Date(r.read_at),
        }))
      )
    }
    return new StepResponse(
      { saved: snapshots.length, results },
      snapshots.map((s) => s.id)
    )
  },
  async (ids, { container }) => {
    if (ids?.length) {
      await market(container).deletePriceSnapshots(ids)
    }
  }
)

export type ManualSnapshotInput = {
  listing_id: string
  price: number | null
  availability: Availability
  is_promo?: boolean
  regular_price?: number | null
}

export const createManualPriceSnapshotStep = createStep(
  "create-manual-price-snapshot",
  async (input: ManualSnapshotInput, { container }) => {
    const service = market(container)
    const listing = await service.retrieveCompetitorListing(input.listing_id)
    const snapshot = await service.createPriceSnapshots({
      ...input,
      is_promo: input.is_promo ?? false,
      source: "manual",
      read_at: new Date(),
      is_demo: listing.is_demo,
    })
    return new StepResponse(snapshot, snapshot.id)
  },
  async (id, { container }) => {
    if (id) {
      await market(container).deletePriceSnapshots(id)
    }
  }
)

// ------------------------------------------------------------------ suppliers

export type SupplierInput = {
  name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  min_order_amount?: number | null
  lead_time_days?: number | null
  payment_terms?: string | null
  notes?: string | null
  is_demo?: boolean
}

export const createMarketSupplierStep = createStep(
  "create-market-supplier",
  async (input: SupplierInput, { container }) => {
    const supplier = await market(container).createSuppliers(input)
    return new StepResponse(supplier, supplier.id)
  },
  async (id, { container }) => {
    if (id) {
      await market(container).deleteSuppliers(id)
    }
  }
)

export const updateMarketSupplierStep = createStep(
  "update-market-supplier",
  async (input: Partial<SupplierInput> & { id: string }, { container }) => {
    const service = market(container)
    const before = await service.retrieveSupplier(input.id)
    const supplier = await service.updateSuppliers(input)
    return new StepResponse(supplier, {
      id: before.id,
      name: before.name,
      contact_name: before.contact_name,
      email: before.email,
      phone: before.phone,
      min_order_amount:
        before.min_order_amount == null ? null : Number(before.min_order_amount),
      lead_time_days: before.lead_time_days,
      payment_terms: before.payment_terms,
      notes: before.notes,
    })
  },
  async (before, { container }) => {
    if (before) {
      await market(container).updateSuppliers(before)
    }
  }
)

export type TariffOfferInput = {
  ean: string
  cost: number
  min_units: number
  product_name: string | null
  brand: string | null
  tariff_date: string
}

/**
 * A new tariff replaces the supplier's previous price for the same EANs and
 * keeps the rest.
 */
export const replaceSupplierOffersStep = createStep(
  "replace-supplier-offers",
  async (
    input: { supplier_id: string; offers: TariffOfferInput[]; is_demo?: boolean },
    { container }
  ) => {
    const service = market(container)
    await service.retrieveSupplier(input.supplier_id)
    const eans = [...new Set(input.offers.map((o) => o.ean))]
    const previous = eans.length
      ? await service.listSupplierOffers(
          { supplier_id: input.supplier_id, ean: eans },
          { select: ["id"] }
        )
      : []
    const previousIds = previous.map((o) => o.id)
    if (previousIds.length) {
      await service.softDeleteSupplierOffers(previousIds)
    }
    const created = input.offers.length
      ? await service.createSupplierOffers(
          input.offers.map((o) => ({
            ...o,
            tariff_date: new Date(o.tariff_date),
            supplier_id: input.supplier_id,
            is_demo: input.is_demo ?? false,
          }))
        )
      : []
    return new StepResponse(
      { created: created.length, replaced: previousIds.length },
      { createdIds: created.map((o) => o.id), previousIds }
    )
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const service = market(container)
    if (data.createdIds.length) {
      await service.deleteSupplierOffers(data.createdIds)
    }
    if (data.previousIds.length) {
      await service.restoreSupplierOffers(data.previousIds)
    }
  }
)

// -------------------------------------------------------------- opportunities

export const updateOpportunityStatusStep = createStep(
  "update-opportunity-status",
  async (
    input: { id: string; status: "pendiente" | "hecha" | "descartada" },
    { container }
  ) => {
    const service = market(container)
    const before = await service.retrieveOpportunity(input.id)
    const opportunity = await service.updateOpportunities({
      id: input.id,
      status: input.status,
      decided_at: input.status === "pendiente" ? null : new Date(),
    })
    return new StepResponse(opportunity, {
      id: before.id,
      status: before.status,
      decided_at: before.decided_at,
    })
  },
  async (before, { container }) => {
    if (before) {
      await market(container).updateOpportunities(before)
    }
  }
)

/**
 * Collects, per EAN we watch: our price and stock, the latest competitor
 * readings, the supplier costs and the demand signal; then scores it.
 */
export const scoreMarketOpportunitiesStep = createStep(
  "score-market-opportunities",
  async (_: void, { container }) => {
    const service = market(container)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const stored = await service.getScoringSettings()
    const settings: ScoringSettings = {
      weight_demand: stored.weight_demand,
      weight_margin: stored.weight_margin,
      weight_gap: stored.weight_gap,
      weight_pressure: stored.weight_pressure,
      min_margin_pct: stored.min_margin_pct,
    }

    const listings = await service.listCompetitorListings(
      { is_active: true },
      { relations: ["competitor"] }
    )
    const active = listings.filter((l) => l.competitor?.is_active)
    const latest = await service.latestSnapshots(active.map((l) => l.id))
    const eans = [...new Set(active.map((l) => l.ean))]
    if (!eans.length) {
      return new StepResponse({
        results: [] as OpportunityResult[],
        products: 0,
        without_cost: 0,
        is_demo: [] as string[],
      })
    }

    const [offers, suppliers, signals, ours] = await Promise.all([
      service.listSupplierOffers({ ean: eans }, { order: { tariff_date: "DESC" } }),
      service.listSuppliers({}),
      service.listDemandSignals({}, { order: { read_at: "DESC" } }),
      loadOurVariants(query, eans),
    ])
    const supplierName = new Map(suppliers.map((s) => [s.id, s.name]))

    const products: ProductInput[] = []
    const demoEans: string[] = []
    let withoutCost = 0
    for (const ean of eans) {
      const mine = active.filter((l) => l.ean === ean)
      const variant = ours.get(ean)

      // Latest tariff per supplier for this EAN.
      const bySupplier = new Map<string, (typeof offers)[number]>()
      for (const o of offers) {
        const sid = (o as unknown as { supplier_id: string }).supplier_id
        if (o.ean === ean && !bySupplier.has(sid)) {
          bySupplier.set(sid, o)
        }
      }
      if (!bySupplier.size) {
        withoutCost++
      }
      const firstOffer = [...bySupplier.values()][0]
      const brand = variant?.brand ?? firstOffer?.brand ?? null
      const signal =
        signals.find((s) => s.ean === ean) ??
        signals.find(
          (s) => !s.ean && s.brand && brand && brand.toLowerCase() === s.brand.toLowerCase()
        )

      const isDemo =
        mine.some((l) => l.is_demo) || [...bySupplier.values()].some((o) => o.is_demo)
      if (isDemo) {
        demoEans.push(ean)
      }

      products.push({
        ean,
        title:
          variant?.title ??
          firstOffer?.product_name ??
          mine.find((l) => l.title)?.title ??
          `EAN ${ean}`,
        brand,
        variant_id: variant?.id ?? null,
        our_price: variant?.price ?? null,
        our_stock: variant ? variant.stock : null,
        competitors: mine.map((l) => {
          const s = latest.get(l.id)
          return {
            competitor: l.competitor!.name,
            price: s?.price == null ? null : Number(s.price),
            availability: (s?.availability ?? "unknown") as Availability,
            is_promo: s?.is_promo ?? false,
          }
        }),
        offers: [...bySupplier.entries()].map(([sid, o]) => ({
          supplier: supplierName.get(sid) ?? "Proveedor",
          cost: Number(o.cost),
          min_units: o.min_units,
        })),
        demand: signal ? { interest: signal.interest, growth_pct: signal.growth_pct } : null,
      })
    }

    const now = new Date()
    const results = products
      .map((p) => scoreProduct(p, settings, now))
      .filter((r): r is OpportunityResult => !!r)
      .sort((a, b) => b.score - a.score)
    return new StepResponse({
      results,
      products: products.length,
      without_cost: withoutCost,
      is_demo: demoEans,
    })
  }
)

/**
 * Replaces the pending suggestions with the new ones. Suggestions the shop
 * already marked done or dismissed in the last 30 days are not repeated.
 */
export const saveMarketOpportunitiesStep = createStep(
  "save-market-opportunities",
  async (input: { results: OpportunityResult[]; is_demo: string[] }, { container }) => {
    const service = market(container)
    const pending = await service.listOpportunities({ status: "pendiente" }, { select: ["id"] })
    const pendingIds = pending.map((o) => o.id)
    if (pendingIds.length) {
      await service.softDeleteOpportunities(pendingIds)
    }
    const since = new Date(Date.now() - 30 * 86400000)
    const decided = await service.listOpportunities({
      status: ["hecha", "descartada"],
      decided_at: { $gte: since },
    })
    const skip = new Set(decided.map((o) => `${o.ean}|${o.action}`))
    const demo = new Set(input.is_demo)
    const now = new Date()
    const fresh = input.results.filter((r) => !skip.has(`${r.ean}|${r.action}`))
    const created = fresh.length
      ? await service.createOpportunities(
          fresh.map((r) => ({
            ean: r.ean,
            variant_id: r.variant_id,
            brand: r.brand,
            product_title: r.product_title,
            score: r.score,
            action: r.action,
            suggested_price: r.suggested_price,
            reason: r.reason,
            factors: r.factors,
            computed_at: now,
            is_demo: demo.has(r.ean),
          }))
        )
      : []
    return new StepResponse(
      { created: created.length, skipped: input.results.length - fresh.length },
      { createdIds: created.map((o) => o.id), pendingIds }
    )
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const service = market(container)
    if (data.createdIds.length) {
      await service.deleteOpportunities(data.createdIds)
    }
    if (data.pendingIds.length) {
      await service.restoreOpportunities(data.pendingIds)
    }
  }
)

// ------------------------------------------------------------------- settings

export type SettingsInput = {
  weight_demand: number
  weight_margin: number
  weight_gap: number
  weight_pressure: number
  min_margin_pct: number
}

export const saveMarketSettingsStep = createStep(
  "save-market-settings",
  async (input: SettingsInput, { container }) => {
    const service = market(container)
    const current = await service.getScoringSettings()
    let before: SettingsInput | null = null
    let saved: { id: string } & SettingsInput
    if (current.id) {
      before = {
        weight_demand: current.weight_demand,
        weight_margin: current.weight_margin,
        weight_gap: current.weight_gap,
        weight_pressure: current.weight_pressure,
        min_margin_pct: current.min_margin_pct,
      }
      saved = await service.updateMarketSettings({ id: current.id, ...input })
    } else {
      saved = await service.createMarketSettings(input)
    }
    return new StepResponse(saved, { id: saved.id, before })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const service = market(container)
    if (data.before) {
      await service.updateMarketSettings({ id: data.id, ...data.before })
    } else {
      await service.deleteMarketSettings(data.id)
    }
  }
)
