"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"

export type Brand = { name: string; slug: string; product_count: number }

type BrandsResponse = { brands: Brand[]; product_ids?: string[] }

// Brands come from the product subtitle ("Marca" in the shop's product editor).
export const listBrands = async (slug?: string) => {
  const next = {
    ...(await getCacheOptions("brands")),
  }

  return sdk.client
    .fetch<BrandsResponse>(`/store/brands`, {
      query: slug ? { slug } : {},
      next,
      cache: "force-cache",
    })
    .catch(() => ({ brands: [] as Brand[], product_ids: [] as string[] }))
}
