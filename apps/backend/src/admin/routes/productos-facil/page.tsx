import { defineRouteConfig } from "@medusajs/admin-sdk"
import { HttpTypes } from "@medusajs/framework/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { sdk } from "../../lib/sdk"
import { styles } from "./styles"

// Simplified product editor for the shop's day-to-day staff: one screen,
// large text, plain Spanish, and only the fields a customer actually sees.

const CURRENCY = "eur"
const SIZE_OPTION = "Tamaño"
const SINGLE_SIZE = "Único"

type Draft = {
  title: string
  brand: string
  size: string
  price: string
  description: string
  published: boolean
  images: string[]
}

const emptyDraft: Draft = {
  title: "",
  brand: "",
  size: "",
  price: "",
  description: "",
  published: true,
  images: [],
}

const toDraft = (product: HttpTypes.AdminProduct): Draft => {
  const variant = product.variants?.[0]
  const price = variant?.prices?.find((p) => p.currency_code === CURRENCY)
  const size = variant?.options?.[0]?.value
  return {
    title: product.title,
    brand: product.subtitle ?? "",
    size: size && size !== SINGLE_SIZE ? size : "",
    price: price ? String(price.amount).replace(".", ",") : "",
    description: product.description ?? "",
    published: product.status === "published",
    images: (product.images ?? []).map((i) => i.url),
  }
}

const parsePrice = (value: string) => {
  const amount = Number(value.replace(/\s|€/g, "").replace(",", "."))
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

const formatPrice = (product: HttpTypes.AdminProduct) => {
  const price = product.variants?.[0]?.prices?.find(
    (p) => p.currency_code === CURRENCY
  )
  return price
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(price.amount)
    : "Sin precio"
}

// Two products can share a name (e.g. different sizes), but web addresses must
// be unique, so the address gets a short suffix when the plain one is taken.
const toHandle = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const uniqueHandle = async (base: string) => {
  const handle = toHandle(base) || "producto"
  const { count } = await sdk.admin.product.list({ handle, limit: 1, fields: "id" })
  return count ? `${handle}-${Date.now().toString(36).slice(-4)}` : handle
}

const PRODUCT_FIELDS =
  "id,title,subtitle,description,status,thumbnail,*images,*variants,*variants.prices,*variants.options,*options,*options.values"

const ProductosFacilPage = () => {
  const [editing, setEditing] = useState<HttpTypes.AdminProduct | "new" | null>(
    null
  )
  const [search, setSearch] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["productos-facil", search],
    queryFn: () =>
      sdk.admin.product.list({
        q: search || undefined,
        limit: 60,
        order: "-updated_at",
        fields: PRODUCT_FIELDS,
      }),
  })

  if (editing) {
    return (
      <div className="nv">
        <style>{styles}</style>
        <ProductForm
          product={editing === "new" ? null : editing}
          onDone={(message) => {
            setEditing(null)
            setNotice(message)
            window.scrollTo(0, 0)
          }}
        />
      </div>
    )
  }

  return (
    <div className="nv">
      <style>{styles}</style>
      <header className="nv-header">
        <h1>Mis productos</h1>
        <p className="nv-help">
          Aquí puedes añadir productos a la tienda online o cambiar los que ya
          hay.
        </p>
      </header>

      {notice && (
        <div className="nv-ok" role="status">
          {notice}
          <button className="nv-link" onClick={() => setNotice(null)}>
            Cerrar
          </button>
        </div>
      )}

      <button className="nv-btn nv-btn-primary nv-btn-big" onClick={() => setEditing("new")}>
        + Añadir un producto nuevo
      </button>

      <label className="nv-label" htmlFor="nv-search">
        Buscar un producto
      </label>
      <input
        id="nv-search"
        className="nv-input"
        placeholder="Escribe el nombre, por ejemplo: Chanel"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <p className="nv-help">Cargando productos...</p>}
      {!isLoading && !data?.products.length && (
        <p className="nv-help">
          Todavía no hay productos. Pulsa el botón negro de arriba para añadir
          el primero.
        </p>
      )}

      <ul className="nv-grid">
        {data?.products.map((product) => (
          <li key={product.id}>
            <button className="nv-card" onClick={() => setEditing(product)}>
              {product.thumbnail ? (
                <img src={product.thumbnail} alt="" />
              ) : (
                <span className="nv-card-noimg">Sin foto</span>
              )}
              <span className="nv-card-title">{product.title}</span>
              <span className="nv-card-price">{formatPrice(product)}</span>
              <span
                className={
                  product.status === "published" ? "nv-tag nv-tag-on" : "nv-tag"
                }
              >
                {product.status === "published"
                  ? "Visible en la tienda"
                  : "Oculto"}
              </span>
              <span className="nv-card-edit">Cambiar</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ProductForm = ({
  product,
  onDone,
}: {
  product: HttpTypes.AdminProduct | null
  onDone: (message: string) => void
}) => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft>(
    product ? toDraft(product) : emptyDraft
  )
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const onPhotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) {
      return
    }
    setUploading(true)
    setError(null)
    try {
      const { files: uploaded } = await sdk.admin.upload.create({ files })
      setDraft((d) => ({
        ...d,
        images: [...d.images, ...uploaded.map((f) => f.url)],
      }))
    } catch {
      setError("No se ha podido subir la foto. Inténtalo otra vez.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const amount = parsePrice(draft.price)!
      const size = draft.size.trim() || SINGLE_SIZE
      const images = draft.images.map((url) => ({ url }))
      const common = {
        title: draft.title.trim(),
        subtitle: draft.brand.trim() || undefined,
        description: draft.description.trim(),
        status: (draft.published ? "published" : "draft") as "published" | "draft",
        images,
        thumbnail: draft.images[0] ?? undefined,
      }

      if (!product) {
        const [{ shipping_profiles }, { sales_channels }] = await Promise.all([
          sdk.admin.shippingProfile.list({ limit: 1 }),
          sdk.admin.salesChannel.list({ limit: 1 }),
        ])
        await sdk.admin.product.create({
          ...common,
          handle: await uniqueHandle(
            [draft.brand, draft.title, draft.size].filter(Boolean).join(" ")
          ),
          shipping_profile_id: shipping_profiles[0]?.id,
          sales_channels: sales_channels[0] ? [{ id: sales_channels[0].id }] : [],
          options: [{ title: SIZE_OPTION, values: [size] }],
          variants: [
            {
              title: size,
              options: { [SIZE_OPTION]: size },
              manage_inventory: false,
              prices: [{ currency_code: CURRENCY, amount }],
            },
          ],
        })
        return
      }

      await sdk.admin.product.update(product.id, common)
      const variant = product.variants?.[0]
      if (variant) {
        const existing = variant.prices?.find((p) => p.currency_code === CURRENCY)
        await sdk.admin.product.updateVariant(product.id, variant.id, {
          prices: [
            existing
              ? { id: existing.id, currency_code: CURRENCY, amount }
              : { currency_code: CURRENCY, amount },
          ],
        })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productos-facil"] })
      onDone(
        draft.published
          ? `Guardado. "${draft.title}" ya se ve en la tienda online.`
          : `Guardado. "${draft.title}" está oculto y no se ve en la tienda.`
      )
    },
    onError: () =>
      setError(
        "No se ha podido guardar. Revisa tu conexión a internet e inténtalo otra vez."
      ),
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim()) {
      return setError("Falta el nombre del producto (paso 2).")
    }
    if (parsePrice(draft.price) === null) {
      return setError("Falta el precio, o no es un número. Ejemplo: 45,90")
    }
    if (!draft.description.trim()) {
      return setError("Falta la descripción (paso 4).")
    }
    setError(null)
    save.mutate()
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <button
        type="button"
        className="nv-btn nv-btn-ghost"
        onClick={() => onDone("No se ha cambiado nada.")}
      >
        ← Volver sin guardar
      </button>

      <h1>{product ? "Cambiar producto" : "Producto nuevo"}</h1>
      <p className="nv-help">
        Rellena los pasos de arriba abajo y pulsa "Guardar" al final.
      </p>

      <section className="nv-step">
        <h2>
          <span className="nv-num">1</span> Fotos
        </h2>
        <p className="nv-help">
          La primera foto es la que se ve en la tienda. Mejor con fondo claro.
        </p>
        <div className="nv-photos">
          {draft.images.map((url, i) => (
            <figure key={url}>
              <img src={url} alt={`Foto ${i + 1}`} />
              {i === 0 && <figcaption>Foto principal</figcaption>}
              <button
                type="button"
                className="nv-link"
                onClick={() =>
                  set(
                    "images",
                    draft.images.filter((u) => u !== url)
                  )
                }
              >
                Quitar foto
              </button>
            </figure>
          ))}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onPhotos}
        />
        <button
          type="button"
          className="nv-btn nv-btn-secondary"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? "Subiendo foto..." : "Hacer foto o elegir foto"}
        </button>
      </section>

      <section className="nv-step">
        <h2>
          <span className="nv-num">2</span> Nombre y marca
        </h2>
        <label className="nv-label" htmlFor="nv-title">
          Nombre del producto
        </label>
        <input
          id="nv-title"
          className="nv-input"
          placeholder="Ejemplo: Coco Mademoiselle Eau de Parfum"
          value={draft.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <label className="nv-label" htmlFor="nv-brand">
          Marca <span className="nv-optional">(si tiene)</span>
        </label>
        <input
          id="nv-brand"
          className="nv-input"
          placeholder="Ejemplo: Chanel"
          value={draft.brand}
          onChange={(e) => set("brand", e.target.value)}
        />
        <label className="nv-label" htmlFor="nv-size">
          Tamaño <span className="nv-optional">(si tiene)</span>
        </label>
        <input
          id="nv-size"
          className="nv-input"
          placeholder="Ejemplo: 100 ml"
          value={draft.size}
          disabled={!!product}
          onChange={(e) => set("size", e.target.value)}
        />
      </section>

      <section className="nv-step">
        <h2>
          <span className="nv-num">3</span> Precio
        </h2>
        <label className="nv-label" htmlFor="nv-price">
          Precio de venta con IVA, en euros
        </label>
        <div className="nv-price">
          <input
            id="nv-price"
            className="nv-input"
            inputMode="decimal"
            placeholder="45,90"
            value={draft.price}
            onChange={(e) => set("price", e.target.value)}
          />
          <span>€</span>
        </div>
      </section>

      <section className="nv-step">
        <h2>
          <span className="nv-num">4</span> Descripción
        </h2>
        <p className="nv-help">
          Cuéntalo como se lo contarías a una clienta en la tienda: a qué huele
          o para qué sirve, para quién es y cómo se usa.
        </p>
        <textarea
          id="nv-description"
          aria-label="Descripción"
          className="nv-input nv-textarea"
          placeholder="Ejemplo: Perfume fresco y elegante con notas de naranja, rosa y pachulí. Ideal para el día a día. Dura todo el día en la piel."
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </section>

      <section className="nv-step">
        <h2>
          <span className="nv-num">5</span> ¿Se ve en la tienda online?
        </h2>
        <div className="nv-choice">
          <button
            type="button"
            className={draft.published ? "nv-btn nv-btn-on" : "nv-btn nv-btn-secondary"}
            aria-pressed={draft.published}
            onClick={() => set("published", true)}
          >
            Sí, mostrarlo
          </button>
          <button
            type="button"
            className={!draft.published ? "nv-btn nv-btn-on" : "nv-btn nv-btn-secondary"}
            aria-pressed={!draft.published}
            onClick={() => set("published", false)}
          >
            No, ocultarlo
          </button>
        </div>
      </section>

      {error && (
        <p className="nv-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="nv-btn nv-btn-primary nv-btn-big"
        disabled={save.isPending || uploading}
      >
        {save.isPending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  )
}

export const config = defineRouteConfig({
  label: "Mis productos (fácil)",
})

export default ProductosFacilPage
