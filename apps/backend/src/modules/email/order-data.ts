import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { OrderEmailData } from "./templates"

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "locale",
  "metadata",
  "subtotal",
  "item_total",
  "shipping_total",
  "total",
  "items.title",
  "items.product_title",
  "items.variant_title",
  "items.quantity",
  "items.total",
  "shipping_address.*",
  "shipping_methods.name",
  "shipping_methods.shipping_option_id",
]

// Everything the order emails show, in the plain shape the templates expect.
export const getOrderEmailData = async (
  container: MedusaContainer,
  orderId: string
): Promise<OrderEmailData & { email?: string }> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ORDER_FIELDS,
    filters: { id: orderId },
  })

  const method = order.shipping_methods?.[0]
  let typeCode: string | undefined
  if (method?.shipping_option_id) {
    const { data: options } = await query.graph({
      entity: "shipping_option",
      fields: ["type.code"],
      filters: { id: method.shipping_option_id },
    })
    typeCode = options[0]?.type?.code
  }

  const a = order.shipping_address
  const metadata = (order.metadata ?? {}) as Record<string, unknown>

  return {
    locale: (order as { locale?: string | null }).locale,
    display_id: order.display_id ?? undefined,
    first_name: a?.first_name ?? undefined,
    email: order.email ?? undefined,
    phone: a?.phone ?? undefined,
    items: (order.items ?? []).filter(Boolean).map((i) => ({
      title: i!.product_title || i!.title,
      variant: i!.variant_title && i!.variant_title !== "Default variant" ? i!.variant_title : undefined,
      quantity: Number(i!.quantity),
      total: Number(i!.total),
    })),
    subtotal: Number(order.item_total ?? order.subtotal),
    shipping_total: Number(order.shipping_total ?? 0),
    total: Number(order.total),
    shipping_method: method?.name,
    delivery:
      typeCode === "pickup" ? "pickup" : typeCode === "local-same-day" ? "local" : "shipping",
    address: a
      ? [
          [a.first_name, a.last_name].filter(Boolean).join(" "),
          [a.address_1, a.address_2].filter(Boolean).join(", "),
          [a.postal_code, a.city].filter(Boolean).join(" "),
          a.province ?? "",
        ].filter(Boolean)
      : [],
    gift_wrap: metadata.gift_wrap === true,
    gift_message: typeof metadata.gift_message === "string" ? metadata.gift_message : undefined,
    samples: Array.isArray(metadata.samples) ? (metadata.samples as string[]) : [],
  }
}
