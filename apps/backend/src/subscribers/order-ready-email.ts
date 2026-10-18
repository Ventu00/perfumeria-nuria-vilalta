import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getOrderEmailData } from "../modules/email/order-data"

// Pickup orders: when the shop marks the order as prepared in the panel
// ("Preparar pedido"), the customer is told it is ready to collect.
export default async function orderReadyEmail({
  event: { data },
  container,
}: SubscriberArgs<{ order_id: string; fulfillment_id: string; no_notification?: boolean }>) {
  if (data.no_notification) {
    return
  }
  const order = await getOrderEmailData(container, data.order_id)
  if (order.delivery !== "pickup" || !order.email) {
    return
  }
  await container.resolve(Modules.NOTIFICATION).createNotifications({
    to: order.email,
    channel: "email",
    template: "order-ready-pickup",
    data: order,
    idempotency_key: `order-ready-${data.fulfillment_id}`,
  })
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
}
