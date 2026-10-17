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

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Perfumería Núria Vilalta",
    template: "%s | Perfumería Núria Vilalta",
  },
  description:
    "Perfumería y cosmética con más de 30 años de consejo personal. Envíos a toda España.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es" data-mode="light" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
