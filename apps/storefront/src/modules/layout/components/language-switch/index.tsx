"use client"

import { updateLocale } from "@lib/data/locale-actions"
import { LANGS } from "@lib/i18n"
import { useLang } from "@lib/i18n/provider"
import { clx } from "@modules/common/components/ui"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

// Always-visible ES · CA · EN switch; the choice is kept in the locale cookie
// so product content from Medusa follows the same language.
const LanguageSwitch = ({ className }: { className?: string }) => {
  const current = useLang()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div
      className={clx("flex items-center gap-1", className)}
      role="group"
      aria-label="Idioma / Language"
    >
      {LANGS.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden className="text-ui-fg-muted">·</span>}
          <button
            type="button"
            lang={l.code}
            title={l.label}
            aria-pressed={current === l.code}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await updateLocale(l.locale)
                router.refresh()
              })
            }
            className={clx(
              "uppercase px-1 py-2 hover:text-nv-ink",
              current === l.code ? "text-nv-ink font-semibold underline underline-offset-4" : "text-ui-fg-subtle"
            )}
          >
            {l.code}
          </button>
        </span>
      ))}
    </div>
  )
}

export default LanguageSwitch
