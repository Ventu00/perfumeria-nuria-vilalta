// Physical shop details, shown in the footer and contact areas.
export const SHOP = {
  name: "Perfumería Núria Vilalta",
  street: "Passeig de Francesc Macià, 15",
  city: "08191 Rubí (Barcelona)",
  phone: "93 697 27 06",
  phoneHref: "tel:+34936972706",
  mapsUrl: "https://maps.app.goo.gl/6HE5RcH2jcGMHKAC6",
  instagramUrl: "https://www.instagram.com/perfumerianuriavilalta",
  facebookUrl: "https://www.facebook.com/perfumerianuriavilalta/",
}

// Company data required by the legal pages (LSSI-CE, RGPD, consumer law) that
// is not known yet. Fill these in here and every legal page updates. Values in
// square brackets are shown highlighted on the site as pending.
export const LEGAL = {
  // Titular: name of the company (S.L.) or, for a sole trader, the full name.
  companyName: "[Razón social pendiente]",
  nif: "[NIF pendiente]",
  // Registro Mercantil data (tomo, folio, hoja). For a sole trader write
  // "No aplica (empresario individual)".
  registry: "[Datos del Registro Mercantil pendientes]",
  email: "[Email de contacto pendiente]",
  // Whether the business is adhered to the consumer arbitration system
  // (Junta Arbitral de Consum de Catalunya), e.g. "No estamos adheridos".
  consumerArbitration: "[Adhesión al arbitraje de consumo pendiente de confirmar]",
}

export const isPending = (value: string) => value.startsWith("[")

// Online shipping options, in euros, used by the help and legal pages.
export const SHIPPING = {
  standardPrice: 3.95,
  expressPrice: 6.95,
  rubiSameDayPrice: 2.95,
  rubiSameDayCutoff: "13:00",
  returnDays: 14,
}
