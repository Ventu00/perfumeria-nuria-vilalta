import { getT } from "@lib/i18n/server"
import { T } from "@lib/i18n/provider"
import { Metadata } from "next"
import { Suspense } from "react"

import VerifyAccount from "@modules/account/components/verify-account"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t("Verifica tu correo"),
    description: t("Verifica tu correo para completar el registro."),
  }
}

export default function VerifyAccountPage() {
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <Suspense
        fallback={
          <p className="text-base-regular text-ui-fg-base">
            <T>Verificando tu correo...</T>
          </p>
        }
      >
        <VerifyAccount />
      </Suspense>
    </div>
  )
}
