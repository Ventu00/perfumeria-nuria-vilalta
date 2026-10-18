import { getT } from "@lib/i18n/server"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata(props: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  const { countryCode } = await props.params
  const t = await getT()
  return {
    title: t("Tienda online de perfumes y cosmética"),
    description: t(
      "Compra perfumes, cosmética y cuidado personal en la tienda online de Perfumería Núria Vilalta, tu perfumería en Rubí (Barcelona). Envíos a toda España."
    ),
    alternates: { canonical: `/${countryCode}/store` },
  }
}

export default async function StorePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return <StoreTemplate currencyCode={region.currency_code} />
}
