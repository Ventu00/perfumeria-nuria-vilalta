import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

const TOKEN = /(\[\[[^\]]+\]\]|\[[^[\]]+\])/g

const linkClass = "underline underline-offset-2 hover:text-nv-gold"

const renderLink = (target: string, label: string, key: number) => {
  if (target.startsWith("/")) {
    return (
      <LocalizedClientLink key={key} href={target} className={linkClass}>
        {label}
      </LocalizedClientLink>
    )
  }

  if (/^(https?:|mailto:|tel:)/.test(target)) {
    const external = target.startsWith("http")
    return (
      <a
        key={key}
        href={target}
        className={linkClass}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {label}
      </a>
    )
  }

  return (
    <LocalizedClientLink key={key} href={`/info/${target}`} className={linkClass}>
      {label}
    </LocalizedClientLink>
  )
}

// Renders "[[target|label]]" as a link and "[Texto]" as a highlighted
// placeholder for data that is still pending.
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const [target, label] = part.slice(2, -2).split("|")
          return renderLink(target, label ?? target, i)
        }

        if (part.startsWith("[") && part.endsWith("]")) {
          return (
            <mark
              key={i}
              className="bg-amber-100 text-nv-ink px-0.5 rounded-sm font-medium"
            >
              {part}
            </mark>
          )
        }

        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
