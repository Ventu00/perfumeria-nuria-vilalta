"use client"

import { updateCart } from "@lib/data/cart"
import { T, useT } from "@lib/i18n/provider"
import { HttpTypes } from "@medusajs/types"
import { useState, useTransition } from "react"

const MAX_MESSAGE = 200

// The shop wraps gifts for free as a courtesy. The choice and the card message
// are saved on the cart metadata, so they reach the order the staff prepares.
const GiftWrap = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const t = useT()
  const metadata = (cart.metadata ?? {}) as Record<string, unknown>
  const [wrap, setWrap] = useState(metadata.gift_wrap === true)
  const [message, setMessage] = useState(
    typeof metadata.gift_message === "string" ? metadata.gift_message : ""
  )
  const [isPending, startTransition] = useTransition()

  const save = (nextWrap: boolean, nextMessage: string) =>
    startTransition(async () => {
      await updateCart({
        metadata: {
          ...metadata,
          gift_wrap: nextWrap,
          gift_message: nextWrap ? nextMessage.trim() : "",
        },
      })
    })

  return (
    <div className="flex flex-col gap-3 border border-nv-sand bg-white p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-black"
          checked={wrap}
          disabled={isPending}
          onChange={(e) => {
            setWrap(e.target.checked)
            save(e.target.checked, message)
          }}
          data-testid="gift-wrap-checkbox"
        />
        <span>
          <span className="block font-medium text-nv-ink">
            <T>Envolver para regalo</T>{" "}
            <span className="text-nv-gold">
              <T>(gratis)</T>
            </span>
          </span>
          <span className="block text-sm text-ui-fg-subtle">
            <T>Lo envolvemos con cariño, como siempre hacemos en la tienda.</T>
          </span>
        </span>
      </label>
      {wrap && (
        <label className="flex flex-col gap-1 text-sm">
          <T>Mensaje para la tarjeta (opcional)</T>
          <textarea
            className="border border-ui-border-base p-2 text-base"
            rows={3}
            maxLength={MAX_MESSAGE}
            value={message}
            placeholder={t("¡Feliz cumpleaños!")}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => save(true, message)}
            data-testid="gift-message"
          />
        </label>
      )}
    </div>
  )
}

export default GiftWrap
