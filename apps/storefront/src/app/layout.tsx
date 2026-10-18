import { LangProvider } from "@lib/i18n/provider"
import { getLang, getT } from "@lib/i18n/server"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import "styles/globals.css"

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
})
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return {
    metadataBase: new URL(getBaseURL()),
    title: {
      default: t("Perfumería Núria Vilalta"),
      template: "%s | Perfumería Núria Vilalta",
    },
    description: t(
      "Perfumería y cosmética con más de 30 años de consejo personal en Rubí (Barcelona). Envíos a toda España."
    ),
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const lang = await getLang()

  return (
    <html lang={lang} data-mode="light" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <LangProvider lang={lang}>
          <main className="relative">{props.children}</main>
        </LangProvider>
      </body>
    </html>
  )
}
