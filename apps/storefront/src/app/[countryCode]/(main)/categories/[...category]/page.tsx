import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import { getT } from "@lib/i18n/server"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

// Next.js passes the URL segments still percent-encoded, so a handle with an
// accent ("cosmética-facial") would not match the category.
const decodeHandle = (segments: string[]) => {
  try {
    return segments.map(decodeURIComponent)
  } catch {
    return segments
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(
      decodeHandle(params.category)
    )
    const t = await getT()

    const title = productCategory.name

    const description =
      productCategory.description ||
      `${title} ${t("en Perfumería Núria Vilalta, tu perfumería en Rubí (Barcelona). Envíos a toda España.")}`

    return {
      title,
      description,
      alternates: {
        canonical: `/${params.countryCode}/categories/${params.category.join("/")}`,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(
    decodeHandle(params.category)
  )

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
    />
  )
}
