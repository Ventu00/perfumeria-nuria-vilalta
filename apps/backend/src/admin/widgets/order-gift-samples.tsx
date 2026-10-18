import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

// What the customer asked for in the cart: gift wrapping, the card message
// and the sample preferences. Shown first so it is not missed when packing.
const OrderGiftSamples = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>
  const wrap = metadata.gift_wrap === true
  const message = typeof metadata.gift_message === "string" ? metadata.gift_message : ""
  const samples = Array.isArray(metadata.samples) ? (metadata.samples as string[]) : []

  if (!wrap && !samples.length) {
    return null
  }

  return (
    <div
      style={{
        border: "2px solid #b08d57",
        borderRadius: 12,
        background: "#fffaf0",
        padding: 20,
        fontSize: 17,
        lineHeight: 1.5,
        color: "#111",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>
        Preparar este pedido
      </h2>
      {wrap && (
        <p style={{ margin: "0 0 8px" }}>
          <strong>Envolver para regalo.</strong>
          {message ? (
            <>
              {" "}Mensaje para la tarjeta: <em>«{message}»</em>
            </>
          ) : (
            " Sin mensaje."
          )}
        </p>
      )}
      {samples.length > 0 && (
        <p style={{ margin: 0 }}>
          <strong>Muestras que le gustan:</strong> {samples.join(", ")}
        </p>
      )}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default OrderGiftSamples
