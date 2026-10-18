import { listBrands } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getBaseURL } from "@lib/util/env"
import { INFO_SLUGS } from "@modules/info/content"
import { MetadataRoute } from "next"

const COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "es"

// Regenerated at most once an hour.
export const revalidate = 3600

const listAllProducts = async () => {
  const handles: { handle: string; updatedAt?: string }[] = []
  let page: number | null = 1

  while (page) {
    const { response, nextPage } = await listProducts({
      pageParam: page,
      countryCode: COUNTRY,
      queryParams: { limit: 100, fields: "handle,updated_at" },
    })
    for (const p of response.products) {
      if (p.handle) {
        handles.push({ handle: p.handle, updatedAt: p.updated_at ?? undefined })
      }
    }
    page = nextPage
  }

  return handles
}

// Each data source is fetched on its own, so if the backend is down the
// sitemap still lists the pages that do not depend on it.
const safely = async <T,>(fn: () => Promise<T>, fallback: T) => {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `${getBaseURL().replace(/\/$/, "")}/${COUNTRY}`
  // Handles can contain accents ("cosmética-facial"); sitemaps need them escaped.
  const url = (path: string) => `${base}${encodeURI(path)}`

  const [products, { brands }, categories, { collections }] = await Promise.all(
    [
      safely(listAllProducts, []),
      safely(() => listBrands(), { brands: [] }),
      safely(() => listCategories({ fields: "handle" }), []),
      safely(() => listCollections({ fields: "handle" }), {
        collections: [],
        count: 0,
      }),
    ]
  )

  return [
    { url: url(""), changeFrequency: "daily", priority: 1 },
    { url: url("/store"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/brands"), changeFrequency: "weekly", priority: 0.8 },
    ...brands.map((b) => ({
      url: url(`/brands/${b.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories
      .filter((c) => c.handle)
      .map((c) => ({
        url: url(`/categories/${c.handle}`),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...collections
      .filter((c) => c.handle)
      .map((c) => ({
        url: url(`/collections/${c.handle}`),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...products.map((p) => ({
      url: url(`/products/${p.handle}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...INFO_SLUGS.map((slug) => ({
      url: url(`/info/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    })),
  ]
}
