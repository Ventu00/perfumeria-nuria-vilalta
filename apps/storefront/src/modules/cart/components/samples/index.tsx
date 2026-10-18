"use client"

import { updateCartMetadata } from "@lib/data/cart"
import { T } from "@lib/i18n/provider"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { useRef, useState } from "react"

const MAX_SAMPLES = 2

// Stored in Spanish on the cart so the staff read the same words in the order.
export const SAMPLE_CHOICES = [
  "Floral",
  "Ámbar y oriental",
  "Fresco y cítrico",
  "Amaderado",
  "Cuidado facial",
  "Sorpréndeme",
]

// Free samples picked by taste, like the shop does at the counter, instead of
// the two random ones the chains add to every order.
const Samples = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const saved = (cart.metadata as Record<string, unknown> | null)?.samples
  const [chosen, setChosen] = useState<string[]>(
    Array.isArray(saved) ? (saved as string[]) : []
  )
  // Choices are saved in order; the buttons stay usable while a save runs.
  const queue = useRef(Promise.resolve())

  const toggle = (choice: string) => {
    const next = chosen.includes(choice)
      ? chosen.filter((c) => c !== choice)
      : [...chosen, choice].slice(-MAX_SAMPLES)
    setChosen(next)
    queue.current = queue.current
      .then(() => updateCartMetadata({ samples: next }))
      .then(() => undefined, () => undefined)
  }

  return (
    <fieldset
      className="flex flex-col gap-3 border border-nv-sand bg-white p-4"
      data-testid="samples"
    >
      <legend className="sr-only">
        <T>Muestras de regalo</T>
      </legend>
      <span>
        <span className="block font-medium text-nv-ink">
          <T>Elige tus muestras</T>{" "}
          <span className="text-nv-gold">
            <T>(gratis)</T>
          </span>
        </span>
        <span className="block text-sm text-ui-fg-subtle">
          <T>Dinos qué te gusta y te ponemos hasta 2 muestras a juego.</T>
        </span>
      </span>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_CHOICES.map((choice) => {
          const on = chosen.includes(choice)
          return (
            <button
              key={choice}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(choice)}
              className={clx(
                "rounded-full border px-3 py-2 text-sm transition-colors",
                on
                  ? "border-nv-ink bg-nv-ink text-white"
                  : "border-ui-border-base text-nv-ink hover:border-nv-ink"
              )}
              data-testid="sample-choice"
            >
              <T>{choice}</T>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default Samples
