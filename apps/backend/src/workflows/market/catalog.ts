// Our own catalogue data (price with IVA and stock) for a set of EANs, read
// through Query so the market module never touches the product tables.

export type OurVariant = {
  id: string
  ean: string
  title: string
  brand: string | null
  price: number | null
  /** Units available (stocked - reserved); null when stock is not tracked. */
  stock: number | null
}

type VariantRow = {
  id: string
  ean: string | null
  title: string | null
  manage_inventory?: boolean
  product?: { title?: string; subtitle?: string | null } | null
  prices?: { amount: number; currency_code: string; min_quantity?: number | null }[]
  inventory_items?: {
    inventory?: {
      location_levels?: { stocked_quantity: number; reserved_quantity: number }[]
    } | null
  }[]
}

type QueryLike = {
  graph: (config: {
    entity: string
    fields: string[]
    filters?: Record<string, unknown>
  }) => Promise<{ data: unknown[] }>
}

export const loadOurVariants = async (
  query: QueryLike,
  eans: string[]
): Promise<Map<string, OurVariant>> => {
  const result = new Map<string, OurVariant>()
  if (!eans.length) {
    return result
  }
  const { data } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "ean",
      "title",
      "manage_inventory",
      "product.title",
      "product.subtitle",
      "prices.amount",
      "prices.currency_code",
      "prices.min_quantity",
      "inventory_items.inventory.location_levels.stocked_quantity",
      "inventory_items.inventory.location_levels.reserved_quantity",
    ],
    filters: { ean: eans },
  })
  for (const v of data as VariantRow[]) {
    if (!v.ean || result.has(v.ean)) {
      continue
    }
    const eur = v.prices?.find((p) => p.currency_code === "eur" && !p.min_quantity)
    const stock =
      v.manage_inventory === false
        ? null
        : (v.inventory_items ?? []).reduce(
            (sum, item) =>
              sum +
              (item.inventory?.location_levels ?? []).reduce(
                (s, l) =>
                  s + Number(l.stocked_quantity ?? 0) - Number(l.reserved_quantity ?? 0),
                0
              ),
            0
          )
    const size =
      v.title && !/^(default|único|unico)/i.test(v.title) ? ` ${v.title}` : ""
    result.set(v.ean, {
      id: v.id,
      ean: v.ean,
      title: `${v.product?.title ?? "Producto"}${size}`,
      brand: v.product?.subtitle ?? null,
      price: eur ? Number(eur.amount) : null,
      stock,
    })
  }
  return result
}
