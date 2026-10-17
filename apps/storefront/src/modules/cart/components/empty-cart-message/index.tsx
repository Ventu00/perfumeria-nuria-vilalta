import { T } from "@lib/i18n/provider"
import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-48 px-2 flex flex-col justify-center items-start" data-testid="empty-cart-message">
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        <T>Cesta</T>
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        <T>Tu cesta está vacía. Echa un vistazo a nuestros productos con el enlace de abajo.</T>
      </Text>
      <div>
        <InteractiveLink href="/store"><T>Ver productos</T></InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
