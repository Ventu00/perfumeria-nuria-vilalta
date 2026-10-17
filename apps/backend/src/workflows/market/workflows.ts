import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  CompetitorInput,
  createMarketCompetitorStep,
  createCompetitorListingStep,
  createManualPriceSnapshotStep,
  createMarketSupplierStep,
  deleteCompetitorListingStep,
  ListingInput,
  ManualSnapshotInput,
  readCompetitorListingsStep,
  replaceSupplierOffersStep,
  saveMarketOpportunitiesStep,
  saveCompetitorReadingsStep,
  saveMarketSettingsStep,
  scoreMarketOpportunitiesStep,
  SettingsInput,
  SupplierInput,
  TariffOfferInput,
  updateMarketCompetitorStep,
  updateOpportunityStatusStep,
  updateMarketSupplierStep,
} from "./steps"

export const createMarketCompetitorWorkflow = createWorkflow(
  "create-market-competitor",
  (input: CompetitorInput) => new WorkflowResponse(createMarketCompetitorStep(input))
)

export const updateMarketCompetitorWorkflow = createWorkflow(
  "update-market-competitor",
  (input: Partial<CompetitorInput> & { id: string }) =>
    new WorkflowResponse(updateMarketCompetitorStep(input))
)

export const createCompetitorListingWorkflow = createWorkflow(
  "create-competitor-listing",
  (input: ListingInput) => new WorkflowResponse(createCompetitorListingStep(input))
)

export const deleteCompetitorListingWorkflow = createWorkflow(
  "delete-competitor-listing",
  (input: { id: string }) => new WorkflowResponse(deleteCompetitorListingStep(input.id))
)

/** Reads competitor pages and stores price and stock. Used by the nightly job. */
export const readCompetitorPricesWorkflow = createWorkflow(
  "read-competitor-prices",
  (input: { listing_ids?: string[] }) => {
    const results = readCompetitorListingsStep(input)
    return new WorkflowResponse(saveCompetitorReadingsStep(results))
  }
)

export const recordPriceSnapshotWorkflow = createWorkflow(
  "record-price-snapshot",
  (input: ManualSnapshotInput) => new WorkflowResponse(createManualPriceSnapshotStep(input))
)

export const createMarketSupplierWorkflow = createWorkflow(
  "create-market-supplier",
  (input: SupplierInput) => new WorkflowResponse(createMarketSupplierStep(input))
)

export const updateMarketSupplierWorkflow = createWorkflow(
  "update-market-supplier",
  (input: Partial<SupplierInput> & { id: string }) =>
    new WorkflowResponse(updateMarketSupplierStep(input))
)

export const importSupplierTariffWorkflow = createWorkflow(
  "import-supplier-tariff",
  (input: { supplier_id: string; offers: TariffOfferInput[]; is_demo?: boolean }) =>
    new WorkflowResponse(replaceSupplierOffersStep(input))
)

export const updateOpportunityStatusWorkflow = createWorkflow(
  "update-opportunity-status",
  (input: { id: string; status: "pendiente" | "hecha" | "descartada" }) =>
    new WorkflowResponse(updateOpportunityStatusStep(input))
)

/** Scores every watched product and replaces the pending suggestions. */
export const recomputeOpportunitiesWorkflow = createWorkflow(
  "recompute-opportunities",
  () => {
    const scored = scoreMarketOpportunitiesStep()
    const saved = saveMarketOpportunitiesStep(scored)
    return new WorkflowResponse({ scored, saved })
  }
)

export const updateMarketSettingsWorkflow = createWorkflow(
  "update-market-settings",
  (input: SettingsInput) => new WorkflowResponse(saveMarketSettingsStep(input))
)
