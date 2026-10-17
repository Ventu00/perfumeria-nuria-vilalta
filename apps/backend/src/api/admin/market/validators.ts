import { z } from "@medusajs/framework/zod"
import { isValidGtin, normalizeEan } from "../../../modules/market/lib/numbers"

const optionalText = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform((v) => (v ? v : null))

export const eanSchema = z
  .union([z.string(), z.number()])
  .transform((v) => normalizeEan(v) ?? "")
  .refine((v) => isValidGtin(v), {
    message: "El EAN no es válido: deben ser 8 o 13 números (el código de barras).",
  })

const webUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (v) => {
      try {
        const u = new URL(v)
        return u.protocol === "https:" || u.protocol === "http:"
      } catch {
        return false
      }
    },
    { message: "Pega la dirección completa de la página, empezando por https://" }
  )

export const PostCompetitor = z.object({
  name: z.string().trim().min(1, "Escribe el nombre de la tienda.").max(120),
  website: webUrl.nullish(),
  notes: optionalText,
})

export const PostCompetitorUpdate = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  website: webUrl.nullish(),
  is_active: z.boolean().optional(),
  notes: optionalText.optional(),
})

export const PostListing = z.object({
  competitor_id: z.string().min(1, "Elige la tienda."),
  url: webUrl,
  ean: eanSchema,
  title: optionalText,
  variant_id: z.string().nullish(),
})

const availability = z.enum(["in_stock", "out_of_stock", "limited", "preorder", "unknown"])

export const PostManualSnapshot = z
  .object({
    price: z.number().positive().max(100000).nullable(),
    regular_price: z.number().positive().max(100000).nullish(),
    availability,
    is_promo: z.boolean().optional(),
  })
  .refine((v) => v.price != null || v.availability === "out_of_stock", {
    message: "Escribe el precio, o marca que está agotado.",
  })

export const PostSupplier = z.object({
  name: z.string().trim().min(1, "Escribe el nombre del proveedor.").max(160),
  contact_name: optionalText,
  email: z
    .union([z.literal(""), z.string().trim().email("El email no es válido.")])
    .nullish()
    .transform((v) => v || null),
  phone: optionalText,
  min_order_amount: z.number().min(0).max(1_000_000).nullish(),
  lead_time_days: z.number().int().min(0).max(365).nullish(),
  payment_terms: optionalText,
  notes: optionalText,
})

export const PostSupplierUpdate = PostSupplier.partial()

const columnIndex = z.number().int().min(0).max(200)

export const PostTariff = z.object({
  filename: z.string().trim().min(1).max(260),
  /** The file, base64 encoded (CSV or XLSX). */
  content_base64: z.string().min(1).max(11_000_000),
  /** Optional manual column choice (0-based), when the guess is wrong. */
  mapping: z
    .object({
      ean: columnIndex,
      cost: columnIndex,
      min_units: columnIndex.optional(),
      product_name: columnIndex.optional(),
      brand: columnIndex.optional(),
      tariff_date: columnIndex.optional(),
    })
    .optional(),
  /** Date of the tariff when the file has no date column (YYYY-MM-DD). */
  tariff_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  /** true: only show what would be imported. */
  dry_run: z.boolean().optional(),
})

export const PostOpportunityStatus = z.object({
  status: z.enum(["pendiente", "hecha", "descartada"]),
})

const weight = z.number().min(0).max(1)

export const PostSettings = z.object({
  weight_demand: weight,
  weight_margin: weight,
  weight_gap: weight,
  weight_pressure: weight,
  min_margin_pct: z.number().min(0).max(90),
})

export const GetOpportunities = z.object({
  status: z.enum(["pendiente", "hecha", "descartada", "todas"]).optional(),
})

export type PostCompetitorType = z.infer<typeof PostCompetitor>
export type PostCompetitorUpdateType = z.infer<typeof PostCompetitorUpdate>
export type PostListingType = z.infer<typeof PostListing>
export type PostManualSnapshotType = z.infer<typeof PostManualSnapshot>
export type PostSupplierType = z.infer<typeof PostSupplier>
export type PostSupplierUpdateType = z.infer<typeof PostSupplierUpdate>
export type PostTariffType = z.infer<typeof PostTariff>
export type PostOpportunityStatusType = z.infer<typeof PostOpportunityStatus>
export type PostSettingsType = z.infer<typeof PostSettings>
