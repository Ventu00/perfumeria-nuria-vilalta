import { T } from "@lib/i18n/provider"
import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6">
      <Heading className="text-base-semi"><T>¿Necesitas ayuda?</T></Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact"><T>Contacto</T></LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              <T>Devoluciones y cambios</T>
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
