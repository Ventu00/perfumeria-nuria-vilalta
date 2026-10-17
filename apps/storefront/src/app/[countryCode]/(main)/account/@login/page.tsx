import { getT } from "@lib/i18n/server"
import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    title: t("Iniciar sesión"),
    description: t("Inicia sesión en tu cuenta de Núria Vilalta."),
  }
}

export default function Login() {
  return <LoginTemplate />
}
