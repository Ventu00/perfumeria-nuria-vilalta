import { T } from "@lib/i18n/provider"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404",
  description: "Algo ha ido mal",
}

export default async function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base"><T>Página no encontrada</T></h1>
      <p className="text-small-regular text-ui-fg-base">
        <T>La página que buscas no existe.</T>
      </p>
      <InteractiveLink href="/"><T>Ir al inicio</T></InteractiveLink>
    </div>
  )
}
