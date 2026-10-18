import { listBrands } from "@lib/data/brands"
import { getT } from "@lib/i18n/server"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Metadata } from "next"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const t = await getT()
  return {
    title: t("Marcas de perfumería y cosmética"),
    description: t(
      "Todas las marcas de perfumería y cosmética que tenemos en Perfumería Núria Vilalta, en Rubí (Barcelona)."
    ),
    alternates: { canonical: `/${countryCode}/brands` },
  }
}

export default async function BrandsPage() {
  const t = await getT()
  const { brands } = await listBrands()

  // Grouped by first letter, the way a shop shelf is labelled.
  const groups = new Map<string, typeof brands>()
  for (const brand of brands) {
    const letter = brand.name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .charAt(0)
      .toUpperCase()
    groups.set(letter, [...(groups.get(letter) ?? []), brand])
  }

  return (
    <div className="content-container py-12 small:py-16" data-testid="brands-page">
      <h1 className="font-serif text-4xl text-nv-ink mb-2">{t("Marcas")}</h1>
      <p className="text-ui-fg-subtle mb-10">
        {t("Todas las marcas que tenemos en la tienda.")}
      </p>
      {brands.length === 0 ? (
        <p className="text-ui-fg-subtle">{t("Aún no hay marcas en la tienda.")}</p>
      ) : (
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-4 gap-10">
          {Array.from(groups.entries()).map(([letter, items]) => (
            <section key={letter}>
              <h2 className="font-serif text-2xl text-nv-gold border-b border-nv-sand pb-1 mb-3">
                {letter}
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((brand) => (
                  <li key={brand.slug}>
                    <LocalizedClientLink
                      href={`/brands/${brand.slug}`}
                      className="text-nv-ink hover:underline underline-offset-4"
                      data-testid="brand-link"
                    >
                      {brand.name}{" "}
                      <span className="text-ui-fg-muted text-small-regular">
                        ({brand.product_count})
                      </span>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
