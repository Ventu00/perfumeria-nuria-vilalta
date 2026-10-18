import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Brands are the product subtitle the staff fill in ("Marca" in the simple
// product editor). GET /store/brands lists them with their product count;
// ?slug=<brand> also returns the ids of that brand's products.
const slugify = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelIds =
    (req as unknown as { publishable_key_context?: { sales_channel_ids?: string[] } })
      .publishable_key_context?.sales_channel_ids ?? []

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "subtitle", "sales_channels.id"],
    filters: { status: "published" },
  })

  const brands = new Map<string, { name: string; slug: string; product_ids: string[] }>()
  for (const product of products) {
    const name = product.subtitle?.trim()
    if (!name) {
      continue
    }
    const inChannel =
      !salesChannelIds.length ||
      product.sales_channels?.some((sc) => sc && salesChannelIds.includes(sc.id))
    if (!inChannel) {
      continue
    }
    const slug = slugify(name)
    const brand = brands.get(slug) ?? { name, slug, product_ids: [] }
    brand.product_ids.push(product.id)
    brands.set(slug, brand)
  }

  const wanted = typeof req.query.slug === "string" ? req.query.slug : undefined
  const list = [...brands.values()].sort((a, b) => a.name.localeCompare(b.name, "es"))

  res.json({
    brands: list.map((b) => ({
      name: b.name,
      slug: b.slug,
      product_count: b.product_ids.length,
    })),
    product_ids: wanted ? brands.get(wanted)?.product_ids ?? [] : undefined,
  })
}
