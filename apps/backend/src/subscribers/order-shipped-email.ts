import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getOrderEmailData } from "../modules/email/order-data"

// Delivered orders: when the shop marks the order as shipped in the panel, the
// customer gets the tracking number or link entered there.
export default async function orderShippedEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (data.no_notification) {
    return
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [fulfillment],
  } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "order.id", "labels.tracking_number", "labels.tracking_url"],
    filters: { id: data.id },
  })
  const orderId = (fulfillment as { order?: { id: string } } | undefined)?.order?.id
  if (!orderId) {
    return
  }
  const order = await getOrderEmailData(container, orderId)
  if (order.delivery === "pickup" || !order.email) {
    return
  }
  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: order.email,
    channel: "email",
    template: "order-shipped",
    data: {
      ...order,
      tracking: (fulfillment.labels ?? []).filter(Boolean).map((l) => ({
        number: l!.tracking_number || undefined,
        url: l!.tracking_url && l!.tracking_url !== "#" ? l!.tracking_url : undefined,
      })),
    },
    idempotency_key: `order-shipped-${data.id}`,
  })
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
