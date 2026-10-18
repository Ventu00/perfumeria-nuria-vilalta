// The shop's emails. Customer emails follow the language the order was placed
// in (Spanish, Catalan or English); the shop's own copy is always Spanish.

export type Locale = "es" | "ca" | "en"

export type OrderEmailData = {
  locale?: string | null
  display_id?: number | string
  first_name?: string
  email?: string
  phone?: string
  items?: { title: string; variant?: string; quantity: number; total: number }[]
  subtotal?: number
  shipping_total?: number
  total?: number
  shipping_method?: string
  delivery?: "pickup" | "local" | "shipping"
  address?: string[]
  gift_wrap?: boolean
  gift_message?: string
  samples?: string[]
  tracking?: { number?: string; url?: string }[]
  storefrontUrl?: string
}

export const SHOP_EMAIL_INFO = {
  name: "Perfumería Núria Vilalta",
  address: "Passeig de Francesc Macià, 15 · 08191 Rubí (Barcelona)",
  phone: "93 697 27 06",
  hours: {
    es: "De lunes a sábado, de 9:30 a 13:30 y de 17:00 a 20:30.",
    ca: "De dilluns a dissabte, de 9:30 a 13:30 i de 17:00 a 20:30.",
    en: "Monday to Saturday, 9:30 to 13:30 and 17:00 to 20:30.",
  },
}

const COPY = {
  es: {
    placedSubject: (n: string) => `Hemos recibido tu pedido #${n}`,
    hello: (name?: string) => (name ? `Hola, ${name}:` : "Hola:"),
    placedIntro:
      "Gracias por tu compra. Ya estamos preparando tu pedido a mano en nuestra tienda de Rubí.",
    pickupNote:
      "Te avisaremos por correo en cuanto esté listo para recoger, normalmente en unas 2 horas dentro del horario de la tienda.",
    localNote:
      "Te lo llevamos hoy mismo si lo has pedido antes de las 13:00 (de lunes a sábado). Si no, al siguiente día de reparto.",
    shippingNote: "Te escribiremos de nuevo cuando salga hacia tu casa.",
    order: "Pedido",
    product: "Producto",
    subtotal: "Subtotal",
    shipping: "Envío",
    free: "Gratis",
    total: "Total (IVA incluido)",
    delivery: "Entrega",
    deliverTo: "Dirección de entrega",
    gift: "Lo envolvemos para regalo",
    giftMessage: "Mensaje de la tarjeta",
    samples: "Tus muestras",
    readySubject: (n: string) => `Tu pedido #${n} ya está listo para recoger`,
    readyIntro: "¡Tu pedido ya está listo! Puedes pasar a recogerlo por la tienda:",
    readyBring: "Solo tienes que decirnos tu nombre o el número de pedido.",
    shippedSubject: (n: string) => `Tu pedido #${n} va de camino`,
    shippedIntro: "Tu pedido ya ha salido de nuestra tienda y va de camino.",
    track: "Seguir el envío",
    trackingNumber: "Número de seguimiento",
    questions: "¿Alguna pregunta? Responde a este correo o llámanos al",
    thanks: "Gracias por confiar en una perfumería de barrio.",
    viewShop: "Visitar la tienda online",
  },
  ca: {
    placedSubject: (n: string) => `Hem rebut la teva comanda #${n}`,
    hello: (name?: string) => (name ? `Hola, ${name}:` : "Hola:"),
    placedIntro:
      "Gràcies per la teva compra. Ja estem preparant la comanda a mà a la nostra botiga de Rubí.",
    pickupNote:
      "T'avisarem per correu quan estigui llesta per recollir, normalment en unes 2 hores dins de l'horari de la botiga.",
    localNote:
      "Te la portem avui mateix si l'has feta abans de les 13:00 (de dilluns a dissabte). Si no, el següent dia de repartiment.",
    shippingNote: "T'escriurem de nou quan surti cap a casa teva.",
    order: "Comanda",
    product: "Producte",
    subtotal: "Subtotal",
    shipping: "Enviament",
    free: "Gratis",
    total: "Total (IVA inclòs)",
    delivery: "Lliurament",
    deliverTo: "Adreça de lliurament",
    gift: "L'emboliquem per regalar",
    giftMessage: "Missatge de la targeta",
    samples: "Les teves mostres",
    readySubject: (n: string) => `La teva comanda #${n} ja està llesta per recollir`,
    readyIntro: "La teva comanda ja està llesta! Pots passar a recollir-la per la botiga:",
    readyBring: "Només cal que ens diguis el teu nom o el número de comanda.",
    shippedSubject: (n: string) => `La teva comanda #${n} és de camí`,
    shippedIntro: "La teva comanda ja ha sortit de la botiga i és de camí.",
    track: "Seguir l'enviament",
    trackingNumber: "Número de seguiment",
    questions: "Tens alguna pregunta? Respon aquest correu o truca'ns al",
    thanks: "Gràcies per confiar en una perfumeria de barri.",
    viewShop: "Visitar la botiga en línia",
  },
  en: {
    placedSubject: (n: string) => `We've received your order #${n}`,
    hello: (name?: string) => (name ? `Hello ${name},` : "Hello,"),
    placedIntro:
      "Thank you for your order. We're already preparing it by hand in our Rubí shop.",
    pickupNote:
      "We'll email you as soon as it's ready to collect, usually within 2 hours during opening hours.",
    localNote:
      "We'll deliver it today if you ordered before 13:00 (Monday to Saturday). Otherwise, on the next delivery day.",
    shippingNote: "We'll write again when it's on its way to you.",
    order: "Order",
    product: "Product",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    total: "Total (VAT included)",
    delivery: "Delivery",
    deliverTo: "Delivery address",
    gift: "Gift wrapped",
    giftMessage: "Card message",
    samples: "Your samples",
    readySubject: (n: string) => `Your order #${n} is ready to collect`,
    readyIntro: "Your order is ready! You can collect it from our shop:",
    readyBring: "Just give us your name or the order number.",
    shippedSubject: (n: string) => `Your order #${n} is on its way`,
    shippedIntro: "Your order has left our shop and is on its way.",
    track: "Track your parcel",
    trackingNumber: "Tracking number",
    questions: "Any questions? Reply to this email or call us on",
    thanks: "Thank you for supporting a local perfumery.",
    viewShop: "Visit the online shop",
  },
}

const SAMPLE_NAMES: Record<string, { ca: string; en: string }> = {
  Floral: { ca: "Floral", en: "Floral" },
  "Ámbar y oriental": { ca: "Ambre i oriental", en: "Amber & oriental" },
  "Fresco y cítrico": { ca: "Fresc i cítric", en: "Fresh & citrus" },
  Amaderado: { ca: "Llenyós", en: "Woody" },
  "Cuidado facial": { ca: "Cura facial", en: "Skincare" },
  Sorpréndeme: { ca: "Sorprèn-me", en: "Surprise me" },
}

export const toLocale = (value?: string | null): Locale => {
  const short = (value ?? "").slice(0, 2).toLowerCase()
  return short === "ca" || short === "en" ? short : "es"
}

const esc = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const money = (amount: number | undefined, locale: Locale) =>
  new Intl.NumberFormat(locale === "en" ? "en-IE" : "es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount ?? 0)

const sampleName = (name: string, locale: Locale) =>
  locale === "es" ? name : SAMPLE_NAMES[name]?.[locale] ?? name

const INK = "#1f1a17"
const GOLD = "#b08d57"
const MUTED = "#6b625b"

const layout = (body: string, footer: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f7f3ee;font-family:Helvetica,Arial,sans-serif;color:${INK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ee;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8dfd3;">
<tr><td style="padding:28px 28px 8px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:0.5px;">Núria Vilalta</td></tr>
<tr><td style="padding:0 28px 8px;text-align:center;color:${GOLD};font-size:11px;letter-spacing:3px;text-transform:uppercase;">Perfumería · Rubí</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:15px;line-height:1.6;">${body}</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e8dfd3;color:${MUTED};font-size:12px;line-height:1.6;text-align:center;">${footer}</td></tr>
</table></td></tr></table></body></html>`

const footerFor = (locale: Locale, url?: string) => {
  const c = COPY[locale]
  return [
    `${esc(SHOP_EMAIL_INFO.name)}<br>${esc(SHOP_EMAIL_INFO.address)}`,
    `${esc(c.questions)} ${esc(SHOP_EMAIL_INFO.phone)}.`,
    url ? `<a href="${esc(url)}" style="color:${GOLD};">${esc(c.viewShop)}</a>` : "",
  ]
    .filter(Boolean)
    .join("<br>")
}

const itemsTable = (d: OrderEmailData, locale: Locale) => {
  const c = COPY[locale]
  const rows = (d.items ?? [])
    .map(
      (i) => `<tr>
<td style="padding:8px 0;border-bottom:1px solid #f0e9df;">${esc(i.title)}${
        i.variant ? `<br><span style="color:${MUTED};font-size:13px;">${esc(i.variant)}</span>` : ""
      }</td>
<td style="padding:8px 0;border-bottom:1px solid #f0e9df;text-align:center;white-space:nowrap;">${i.quantity} ×</td>
<td style="padding:8px 0;border-bottom:1px solid #f0e9df;text-align:right;white-space:nowrap;">${money(i.total, locale)}</td>
</tr>`
    )
    .join("")
  const shipping = d.shipping_total ? money(d.shipping_total, locale) : c.free
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:8px 0 16px;">
${rows}
<tr><td colspan="2" style="padding:8px 0 2px;color:${MUTED};">${esc(c.subtotal)}</td><td style="padding:8px 0 2px;text-align:right;">${money(d.subtotal, locale)}</td></tr>
<tr><td colspan="2" style="padding:2px 0;color:${MUTED};">${esc(c.shipping)}</td><td style="padding:2px 0;text-align:right;">${esc(shipping)}</td></tr>
<tr><td colspan="2" style="padding:8px 0;font-weight:bold;">${esc(c.total)}</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${money(d.total, locale)}</td></tr>
</table>`
}

const SHOP_LABELS = { gift: "Envolver para regalo", giftMessage: "Mensaje de la tarjeta", samples: "Muestras que le gustan" }

const extras = (d: OrderEmailData, locale: Locale, forShop = false) => {
  const c = forShop ? SHOP_LABELS : COPY[locale]
  const parts: string[] = []
  if (d.gift_wrap) {
    parts.push(
      `<p style="margin:0 0 6px;">🎁 <strong>${esc(c.gift)}</strong>${
        d.gift_message ? `<br>${esc(c.giftMessage)}: <em>«${esc(d.gift_message)}»</em>` : ""
      }</p>`
    )
  }
  if (d.samples?.length) {
    parts.push(
      `<p style="margin:0 0 6px;"><strong>${esc(c.samples)}:</strong> ${esc(
        d.samples.map((s) => sampleName(s, locale)).join(", ")
      )}</p>`
    )
  }
  return parts.length
    ? `<div style="background:#fbf7f0;border-left:3px solid ${GOLD};padding:10px 14px;margin:0 0 16px;font-size:14px;">${parts.join("")}</div>`
    : ""
}

const button = (href: string, label: string) =>
  `<p style="margin:16px 0;"><a href="${esc(href)}" style="display:inline-block;background:${INK};color:#ffffff;text-decoration:none;padding:12px 22px;font-size:14px;">${esc(label)}</a></p>`

const textVersion = (html: string) =>
  html
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/(p|tr|h1|h2|div)>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim()

const orderPlaced = (d: OrderEmailData) => {
  const locale = toLocale(d.locale)
  const c = COPY[locale]
  const n = String(d.display_id ?? "")
  const note =
    d.delivery === "pickup" ? c.pickupNote : d.delivery === "local" ? c.localNote : c.shippingNote
  const where =
    d.delivery === "pickup"
      ? `${esc(SHOP_EMAIL_INFO.address)}<br><span style="color:${MUTED};">${esc(SHOP_EMAIL_INFO.hours[locale])}</span>`
      : (d.address ?? []).map(esc).join("<br>")
  const body = `<p style="margin:0 0 12px;">${esc(c.hello(d.first_name))}</p>
<p style="margin:0 0 12px;">${esc(c.placedIntro)}</p>
<p style="margin:0 0 20px;">${esc(note)}</p>
<h2 style="font-family:Georgia,serif;font-weight:normal;font-size:20px;margin:0 0 4px;">${esc(c.order)} #${esc(n)}</h2>
${itemsTable(d, locale)}
${extras(d, locale)}
<p style="margin:0 0 4px;"><strong>${esc(c.delivery)}:</strong> ${esc(d.shipping_method)}</p>
<p style="margin:0 0 16px;color:${INK};">${where}</p>
<p style="margin:16px 0 0;color:${MUTED};">${esc(c.thanks)}</p>`
  return { subject: c.placedSubject(n), body, locale }
}

const orderReadyPickup = (d: OrderEmailData) => {
  const locale = toLocale(d.locale)
  const c = COPY[locale]
  const n = String(d.display_id ?? "")
  const body = `<p style="margin:0 0 12px;">${esc(c.hello(d.first_name))}</p>
<p style="margin:0 0 12px;">${esc(c.readyIntro)}</p>
<p style="margin:0 0 12px;font-size:16px;"><strong>${esc(SHOP_EMAIL_INFO.address)}</strong><br><span style="color:${MUTED};">${esc(SHOP_EMAIL_INFO.hours[locale])}</span></p>
<p style="margin:0 0 20px;">${esc(c.readyBring)} (#${esc(n)})</p>
${extras(d, locale)}
<p style="margin:16px 0 0;color:${MUTED};">${esc(c.thanks)}</p>`
  return { subject: c.readySubject(n), body, locale }
}

const orderShipped = (d: OrderEmailData) => {
  const locale = toLocale(d.locale)
  const c = COPY[locale]
  const n = String(d.display_id ?? "")
  const tracking = (d.tracking ?? [])
    .map((t) =>
      t.url
        ? button(t.url, c.track) + (t.number ? `<p style="margin:0 0 8px;color:${MUTED};">${esc(c.trackingNumber)}: ${esc(t.number)}</p>` : "")
        : t.number
          ? `<p style="margin:0 0 8px;">${esc(c.trackingNumber)}: <strong>${esc(t.number)}</strong></p>`
          : ""
    )
    .join("")
  const body = `<p style="margin:0 0 12px;">${esc(c.hello(d.first_name))}</p>
<p style="margin:0 0 12px;">${esc(c.shippedIntro)}</p>
${tracking}
<p style="margin:12px 0 4px;"><strong>${esc(c.deliverTo)}:</strong></p>
<p style="margin:0 0 16px;">${(d.address ?? []).map(esc).join("<br>")}</p>
<p style="margin:16px 0 0;color:${MUTED};">${esc(c.thanks)}</p>`
  return { subject: c.shippedSubject(n), body, locale }
}

// Sent to the shop. Big and plain so it reads well on a phone: what to
// prepare, how it leaves the shop and who it is for.
const orderPlacedShop = (d: OrderEmailData) => {
  const n = String(d.display_id ?? "")
  const how =
    d.delivery === "pickup"
      ? "RECOGE EN LA TIENDA"
      : d.delivery === "local"
        ? "ENTREGA HOY EN RUBÍ"
        : (d.shipping_method ?? "Envío").toUpperCase()
  const items = (d.items ?? [])
    .map(
      (i) =>
        `<li style="margin:0 0 6px;"><strong>${i.quantity} ×</strong> ${esc(i.title)}${
          i.variant ? ` (${esc(i.variant)})` : ""
        }</li>`
    )
    .join("")
  const body = `<p style="margin:0 0 8px;font-size:22px;"><strong>Nuevo pedido #${esc(n)}</strong></p>
<p style="margin:0 0 16px;font-size:18px;background:${INK};color:#ffffff;padding:8px 12px;display:inline-block;">${esc(how)}</p>
<ul style="font-size:17px;padding-left:20px;margin:0 0 16px;">${items}</ul>
${extras(d, "es", true)}
<p style="margin:0 0 4px;font-size:16px;"><strong>Total:</strong> ${money(d.total, "es")}</p>
<p style="margin:16px 0 4px;font-size:16px;"><strong>Cliente:</strong></p>
<p style="margin:0 0 16px;font-size:16px;">${[...(d.address ?? []), d.phone, d.email]
    .filter(Boolean)
    .map(esc)
    .join("<br>")}</p>
<p style="margin:0;color:${MUTED};font-size:14px;">Lo tienes en el panel, en Pedidos.</p>`
  return { subject: `Nuevo pedido #${n} · ${how.toLowerCase()}`, body, locale: "es" as Locale }
}

const TEMPLATES: Record<string, (d: OrderEmailData) => { subject: string; body: string; locale: Locale }> = {
  "order-placed": orderPlaced,
  "order-placed-shop": orderPlacedShop,
  "order-ready-pickup": orderReadyPickup,
  "order-shipped": orderShipped,
}

export const renderEmail = (template: string, data: Record<string, unknown>) => {
  const render = TEMPLATES[template]
  if (!render) {
    throw new Error(`Unknown email template "${template}".`)
  }
  const d = data as OrderEmailData
  const { subject, body, locale } = render(d)
  const html = layout(body, footerFor(locale, d.storefrontUrl))
  return { subject, html, text: textVersion(html) }
}
