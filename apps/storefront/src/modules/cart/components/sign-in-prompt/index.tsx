import { T } from "@lib/i18n/provider"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          <T>¿Ya tienes cuenta?</T>
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          <T>Inicia sesión para comprar más rápido.</T>
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            <T>Iniciar sesión</T>
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
