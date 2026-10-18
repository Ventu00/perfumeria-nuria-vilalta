import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getT } from "@lib/i18n/server"
import { SHOP } from "@lib/shop-info"
import { getBaseURL } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"
import JsonLd from "@modules/common/components/json-ld"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string,
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const t = await getT()
  const brand = product.subtitle ? ` ${t("de")} ${product.subtitle}` : ""
  const description =
    product.description ||
    `${product.title}${brand}. ${t("Cómpralo en")} ${SHOP.name}, ${t("tu perfumería en Rubí (Barcelona).")}`

  return {
    title: `${product.title}`,
    description,
    alternates: { canonical: `/${params.countryCode}/products/${handle}` },
    openGraph: {
      title: `${product.title}`,
      description,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

// Same rule as the add to cart button: a variant can be bought when its stock
// is not tracked, it allows backorders, or it has units left.
const isBuyable = (variant: HttpTypes.StoreProductVariant) =>
  !variant.manage_inventory ||
  !!variant.allow_backorder ||
  (variant.inventory_quantity || 0) > 0

const productJsonLd = (product: HttpTypes.StoreProduct, url: string) => {
  const price = getProductPrice({ product }).cheapestPrice
  const variants = product.variants ?? []
  const inStock = !variants.length || variants.some(isBuyable)
  const sku = variants.length === 1 ? variants[0].sku : null
  const images = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images ?? []).map((i) => i.url),
  ]

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.description && { description: product.description }),
    ...(images.length && { image: Array.from(new Set(images)) }),
    ...(product.subtitle && {
      brand: { "@type": "Brand", name: product.subtitle },
    }),
    ...(sku && { sku }),
    url,
    ...(price && {
      offers: {
        "@type": "Offer",
        url,
        price: price.calculated_price_number.toFixed(2),
        priceCurrency: price.currency_code.toUpperCase(),
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: SHOP.name },
      },
    }),
  }
}

const breadcrumbJsonLd = (
  product: HttpTypes.StoreProduct,
  base: string,
  url: string,
  storeLabel: string
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { name: SHOP.name, item: base },
    { name: storeLabel, item: `${base}/store` },
    { name: product.title, item: url },
  ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
})

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: params.handle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  const images = getImagesForVariant(pricedProduct, selectedVariantId)
  const t = await getT()
  const base = `${getBaseURL().replace(/\/$/, "")}/${params.countryCode}`
  const url = `${base}/products/${params.handle}`

  return (
    <>
      <JsonLd data={productJsonLd(pricedProduct, url)} />
      <JsonLd data={breadcrumbJsonLd(pricedProduct, base, url, t("Tienda"))} />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images ?? []}
      />
    </>
  )
}
