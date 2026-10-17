import { MedusaService } from "@medusajs/framework/utils"
import Competitor from "./models/competitor"
import CompetitorListing from "./models/competitor-listing"
import DemandSignal from "./models/demand-signal"
import MarketSetting from "./models/market-setting"
import Opportunity from "./models/opportunity"
import PriceSnapshot from "./models/price-snapshot"
import Supplier from "./models/supplier"
import SupplierOffer from "./models/supplier-offer"
import { buildUserAgent, PriceReader, ReadResult } from "./lib/reader"
import { DEFAULT_SETTINGS, ScoringSettings } from "./lib/scoring"

export type MarketModuleOptions = {
  /** Email or web page shown in the reader's User-Agent so shops can reach us. */
  readerContact?: string
  /** Wait between two requests to the same shop, in milliseconds (minimum 3000). */
  readerDelayMs?: number
}

/** Readings older than this are ignored when scoring. */
export const SNAPSHOT_MAX_AGE_DAYS = 14

type PageToRead = { id: string; url: string; ean: string }

class MarketModuleService extends MedusaService({
  Competitor,
  CompetitorListing,
  PriceSnapshot,
  Supplier,
  SupplierOffer,
  DemandSignal,
  Opportunity,
  MarketSetting,
}) {
  protected options_: MarketModuleOptions

  constructor(container: Record<string, unknown>, options: MarketModuleOptions = {}) {
    super(...arguments)
    this.options_ = options ?? {}
  }

  /** Scoring weights and minimum margin, with defaults when never saved. */
  async getScoringSettings(): Promise<ScoringSettings & { id: string | null }> {
    const [row] = await this.listMarketSettings({}, { take: 1 })
    if (!row) {
      return { id: null, ...DEFAULT_SETTINGS }
    }
    return {
      id: row.id,
      weight_demand: row.weight_demand,
      weight_margin: row.weight_margin,
      weight_gap: row.weight_gap,
      weight_pressure: row.weight_pressure,
      min_margin_pct: row.min_margin_pct,
    }
  }

  /**
   * Reads competitor pages politely: one queue per shop, several seconds
   * between two requests to the same shop, robots.txt first. Shops are read
   * in parallel with each other.
   */
  async readCompetitorPages(
    pages: PageToRead[]
  ): Promise<{ id: string; result: ReadResult; read_at: Date }[]> {
    const reader = new PriceReader({
      userAgent: buildUserAgent(this.options_.readerContact),
      minDelayMs: Math.max(3000, this.options_.readerDelayMs ?? 6000),
    })
    const byHost = new Map<string, PageToRead[]>()
    for (const page of pages) {
      let host = "invalid"
      try {
        host = new URL(page.url).host
      } catch {
        // reader.read reports the invalid address
      }
      byHost.set(host, [...(byHost.get(host) ?? []), page])
    }
    const results: { id: string; result: ReadResult; read_at: Date }[] = []
    await Promise.all(
      [...byHost.values()].map(async (queue) => {
        for (const page of queue) {
          const result = await reader.read(page.url, page.ean)
          results.push({ id: page.id, result, read_at: new Date() })
        }
      })
    )
    return results
  }

  /** Latest reading per listing, ignoring readings older than two weeks. */
  async latestSnapshots(listingIds: string[]) {
    if (!listingIds.length) {
      return new Map<string, Awaited<ReturnType<typeof this.listPriceSnapshots>>[number]>()
    }
    const since = new Date(Date.now() - SNAPSHOT_MAX_AGE_DAYS * 86400000)
    const snapshots = await this.listPriceSnapshots(
      { listing_id: listingIds, read_at: { $gte: since } },
      { order: { read_at: "DESC" } }
    )
    const latest = new Map<string, (typeof snapshots)[number]>()
    for (const s of snapshots) {
      const key = (s as unknown as { listing_id: string }).listing_id
      if (!latest.has(key)) {
        latest.set(key, s)
      }
    }
    return latest
  }
}

export default MarketModuleService
