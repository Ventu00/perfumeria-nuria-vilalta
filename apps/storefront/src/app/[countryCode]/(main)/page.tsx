import { Metadata } from "next"

import { getT } from "@lib/i18n/server"
import { SHOP } from "@lib/shop-info"
import { getBaseURL } from "@lib/util/env"
import JsonLd from "@modules/common/components/json-ld"
import FeaturedProducts from "@modules/home/components/featured-products"
import NewArrivals from "@modules/home/components/featured-products/new-arrivals"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const t = await getT()
  return {
    title: {
      absolute: `${t(SHOP.name)} · ${t("Perfumería y estética en Rubí")}`,
    },
    description: t(
      "Perfumes, cosmética y cuidado personal con el consejo de una perfumería y centro de estética familiar de Rubí (Barcelona) con más de 30 años de historia. Envíos a toda España."
    ),
    alternates: { canonical: `/${countryCode}` },
  }
}

// The physical shop, so search engines can show it for local searches such as
// "perfumería Rubí".
const localBusiness = (countryCode: string) => {
  const base = getBaseURL().replace(/\/$/, "")
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "BeautySalon"],
    "@id": `${base}/#shop`,
    name: SHOP.name,
    url: `${base}/${countryCode}`,
    image: `${base}/opengraph-image.jpg`,
    logo: `${base}/nv-logo.svg`,
    telephone: SHOP.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP.street,
      postalCode: SHOP.postalCode,
      addressLocality: SHOP.locality,
      addressRegion: SHOP.region,
      addressCountry: "ES",
    },
    hasMap: SHOP.mapsUrl,
    openingHoursSpecification: SHOP.openingHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [SHOP.instagramUrl, SHOP.facebookUrl],
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!region) {
    return null
  }

  return (
    <>
      <JsonLd data={localBusiness(countryCode)} />
      <Hero />
      <div className="py-12">
        <NewArrivals region={region} />
        {collections?.length > 0 && (
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        )}
      </div>
    </>
  )
}
