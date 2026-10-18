import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { getOrderEmailData } from "../modules/email/order-data"

// Confirmation to the customer and a "new order" email to the shop.
export default async function orderPlacedEmail({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notification = container.resolve(Modules.NOTIFICATION)
  const order = await getOrderEmailData(container, data.id)
  const shopEmail = process.env.SHOP_ORDERS_EMAIL

  await notification.createNotifications(
    [
      order.email && {
        to: order.email,
        channel: "email",
        template: "order-placed",
        data: order,
        idempotency_key: `order-placed-${data.id}`,
      },
      shopEmail && {
        to: shopEmail,
        channel: "email",
        template: "order-placed-shop",
        data: order,
        idempotency_key: `order-placed-shop-${data.id}`,
      },
    ].filter(Boolean) as { to: string; channel: string; template: string; data: Record<string, unknown> }[]
  )
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
