import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { brandSlug } from "@lib/util/brand-slug"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        {product.subtitle && (
          <LocalizedClientLink
            href={`/brands/${brandSlug(product.subtitle)}`}
            className="text-small-regular uppercase tracking-[0.2em] text-nv-gold hover:underline underline-offset-4"
            data-testid="product-brand"
          >
            {product.subtitle}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="font-serif text-4xl leading-tight font-medium text-nv-ink"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
