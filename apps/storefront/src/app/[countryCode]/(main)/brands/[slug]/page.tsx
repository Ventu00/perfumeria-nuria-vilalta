import { listBrands } from "@lib/data/brands"
import { getT } from "@lib/i18n/server"
import InteractiveLink from "@modules/common/components/interactive-link"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
  searchParams: Promise<{ page?: string }>
}

const findBrand = async (slug: string) => {
  const { brands, product_ids } = await listBrands(slug)
  const brand = brands.find((b) => b.slug === slug)
  return brand ? { brand, productIds: product_ids ?? [] } : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, slug } = await props.params
  const found = await findBrand(slug)
  if (!found) {
    notFound()
  }
  const t = await getT()
  const name = found.brand.name
  return {
    title: `${name}: ${t("perfumes y cosmética")}`,
    description: `${t("Compra productos de")} ${name} ${t("en Perfumería Núria Vilalta, tu perfumería en Rubí (Barcelona). Envíos a toda España.")}`,
    alternates: { canonical: `/${countryCode}/brands/${slug}` },
  }
}

export default async function BrandPage(props: Props) {
  const { countryCode, slug } = await props.params
  const { page } = await props.searchParams
  const found = await findBrand(slug)
  const t = await getT()

  if (!found || !found.productIds.length) {
    notFound()
  }

  const count = found.brand.product_count

  return (
    <div className="content-container py-12 small:py-16" data-testid="brand-page">
      <div className="mb-8 flex flex-col gap-2">
        <InteractiveLink href="/brands">{t("Marcas")}</InteractiveLink>
        <h1 className="font-serif text-4xl text-nv-ink">{found.brand.name}</h1>
        <p className="text-ui-fg-subtle">
          {count} {count === 1 ? t("producto") : t("productos")}
        </p>
      </div>
      <PaginatedProducts
        page={page ? parseInt(page) : 1}
        productsIds={found.productIds}
        countryCode={countryCode}
      />
    </div>
  )
}
