import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import NewArrivals from "@modules/home/components/featured-products/new-arrivals"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Perfumes y cosmética online",
  description:
    "Perfumes, cosmética y cuidado personal con el consejo de una perfumería familiar con más de 30 años de historia.",
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
