import { getT } from "@lib/i18n/server"
import { T } from "@lib/i18n/provider"
import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t("Direcciones"),
    description: t("Ver tus direcciones"),
  }
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi"><T>Direcciones de envío</T></h1>
        <p className="text-base-regular">
          <T>Guarda tus direcciones de envío para usarlas al finalizar la compra. Puedes añadir todas las que quieras.</T>
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
