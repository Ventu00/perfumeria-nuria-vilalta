import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"

// The shop sells in Spanish (default), Catalan and English.
export const STORE_LOCALES = ["es-ES", "ca-ES", "en-US"]

// Catalan is not among the locales the translation module seeds.
const EXTRA_LOCALES = [{ code: "ca-ES", name: "Catalan (Spain)" }]

// Catalan and English names for the categories created by the initial seed.
const CATEGORY_NAMES: Record<string, { "ca-ES": string; "en-US": string }> = {
  "Perfumes de mujer": { "ca-ES": "Perfums de dona", "en-US": "Women's fragrances" },
  "Perfumes de hombre": { "ca-ES": "Perfums d'home", "en-US": "Men's fragrances" },
  "Cosmética facial": { "ca-ES": "Cosmètica facial", "en-US": "Skincare" },
  "Cuidado corporal": { "ca-ES": "Cura corporal", "en-US": "Body care" },
  Maquillaje: { "ca-ES": "Maquillatge", "en-US": "Makeup" },
  Cabello: { "ca-ES": "Cabell", "en-US": "Hair" },
  "Sets de regalo": { "ca-ES": "Sets de regal", "en-US": "Gift sets" },
}

export default async function storeLocales({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModule = container.resolve(Modules.STORE)
  const translationModule = container.resolve(Modules.TRANSLATION)

  const existing = await translationModule.listLocales({
    code: EXTRA_LOCALES.map((l) => l.code),
  })
  const missing = EXTRA_LOCALES.filter(
    (l) => !existing.some((e) => e.code === l.code)
  )
  if (missing.length) {
    await translationModule.createLocales(missing)
  }

  const [store] = await storeModule.listStores()
  if (!store) {
    return
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_locales: STORE_LOCALES.map((locale_code) => ({ locale_code })),
      },
    },
  })
  logger.info(`Store locales set to ${STORE_LOCALES.join(", ")}.`)

  const productModule = container.resolve(Modules.PRODUCT)
  const categories = await productModule.listProductCategories({
    name: Object.keys(CATEGORY_NAMES),
  })
  const translated = await translationModule.listTranslations({
    reference_id: categories.map((c) => c.id),
  })
  const toCreate = categories.flatMap((category) =>
    Object.entries(CATEGORY_NAMES[category.name]).flatMap(([locale_code, name]) =>
      translated.some(
        (t) => t.reference_id === category.id && t.locale_code === locale_code
      )
        ? []
        : [
            {
              reference: "product_category",
              reference_id: category.id,
              locale_code,
              translations: { name },
            },
          ]
    )
  )
  if (toCreate.length) {
    await translationModule.createTranslations(toCreate)
  }
  logger.info(`Added ${toCreate.length} category translations.`)
}
