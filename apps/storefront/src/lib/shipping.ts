// Same-day delivery is only offered for these postcodes (Rubí for now).
export const LOCAL_DELIVERY_POSTCODES = ["08191"]
export const LOCAL_DELIVERY_CODE = "local-same-day"
export const FREE_SHIPPING_FROM = 35

type OptionWithType = { type?: { code?: string } | null }

export const isLocalDelivery = (option: unknown) =>
  (option as OptionWithType).type?.code === LOCAL_DELIVERY_CODE

export const offersLocalDelivery = (postalCode?: string | null) =>
  !!postalCode && LOCAL_DELIVERY_POSTCODES.includes(postalCode.replace(/\s/g, ""))
