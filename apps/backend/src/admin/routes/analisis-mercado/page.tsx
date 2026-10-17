import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, FormEvent, ReactNode, useState } from "react"
import { sdk } from "../../lib/sdk"
import { styles } from "./styles"

// "Análisis de mercado": what to buy, what price to set and where not to
// compete. Same simple style as "Mis productos (fácil)": large text, plain
// Spanish, one clear action per row.

type Action = "comprar" | "subir_precio" | "bajar_precio" | "destacar" | "no_competir"
type Status = "pendiente" | "hecha" | "descartada"
type Availability = "in_stock" | "out_of_stock" | "limited" | "preorder" | "unknown"

type Settings = {
  weight_demand: number
  weight_margin: number
  weight_gap: number
  weight_pressure: number
  min_margin_pct: number
}

type Opportunity = {
  id: string
  ean: string | null
  product_title: string
  brand: string | null
  score: number
  action: Action
  suggested_price: number | null
  reason: string
  status: Status
  is_demo: boolean
  computed_at: string
  factors: Record<string, unknown> | null
}

type OpportunitiesResponse = {
  opportunities: Opportunity[]
  counts: Record<Status, number>
  has_demo: boolean
  settings: Settings
}

type ShopListing = {
  id: string
  competitor: string
  url: string
  is_demo: boolean
  last_status: string | null
  last_message: string | null
  last_read_at: string | null
  latest: {
    price: number | null
    regular_price: number | null
    availability: Availability
    is_promo: boolean
    read_at: string
    source: string
  } | null
}

type CompetitionResponse = {
  competitors: {
    id: string
    name: string
    website: string | null
    is_active: boolean
    is_demo: boolean
    listings: number
  }[]
  products: {
    ean: string
    title: string
    in_catalog: boolean
    our_price: number | null
    our_stock: number | null
    market_median: number | null
    is_demo: boolean
    listings: ShopListing[]
  }[]
}

type Supplier = {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  min_order_amount: number | null
  lead_time_days: number | null
  payment_terms: string | null
  is_demo: boolean
  offers: number
  last_tariff_date: string | null
}

type Offer = {
  id: string
  ean: string
  product_name: string | null
  brand: string | null
  cost: number
  min_units: number
  tariff_date: string
  is_demo: boolean
  market_price: number | null
  margin_pct: number | null
  is_cheapest: boolean
}

type TariffSummary = {
  imported: boolean
  created?: number
  replaced?: number
  headers: string[]
  mapping: Partial<Record<string, string>>
  total_rows: number
  valid_rows: number
  errors: { row: number; message: string }[]
  error_count: number
  warnings: string[]
  preview: { ean: string; cost: number; min_units: number; product_name: string | null }[]
}

const ACTIONS: Record<Action, { label: string; help: string }> = {
  comprar: { label: "Comprar", help: "Haz pedido al proveedor" },
  destacar: { label: "Destacar", help: "Ponlo en la portada" },
  subir_precio: { label: "Subir precio", help: "Puedes cobrar más" },
  bajar_precio: { label: "Bajar precio", help: "Estás caro" },
  no_competir: { label: "No competir", help: "No lo empujes online" },
}

const AVAILABILITY: Record<Availability, string> = {
  in_stock: "Hay stock",
  limited: "Quedan pocas",
  out_of_stock: "Agotado",
  preorder: "Reserva",
  unknown: "Sin dato",
}

const euros = (n: number | null | undefined) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)

const dateText = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "—"

// Accepts "54,90", "54.90" and "1.234,50".
const parseNumber = (value: string) => {
  const clean = value.replace(/\s|€|%/g, "")
  const n = Number(clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean)
  return clean !== "" && Number.isFinite(n) ? n : null
}

const errorText = (e: unknown) => {
  const message = (e as { message?: string })?.message?.replace(/^Invalid request: /, "")
  return message && !/^(Request failed|Failed to fetch)/i.test(message)
    ? message
    : "Algo ha fallado. Comprueba los datos e inténtalo otra vez."
}

const api = <T,>(path: string, init?: { method?: string; body?: unknown; query?: Record<string, string> }) =>
  sdk.client.fetch<T>(`/admin/market${path}`, init as never)

const TABS = [
  { id: "oportunidades", label: "Oportunidades" },
  { id: "competencia", label: "Competencia" },
  { id: "proveedores", label: "Proveedores" },
] as const
type TabId = (typeof TABS)[number]["id"]

const readTab = (): TabId => {
  try {
    const saved = window.sessionStorage.getItem("nv-mercado-tab")
    return TABS.some((t) => t.id === saved) ? (saved as TabId) : "oportunidades"
  } catch {
    return "oportunidades"
  }
}

const AnalisisMercadoPage = () => {
  const [tab, setTab] = useState<TabId>(readTab)

  const choose = (id: TabId) => {
    setTab(id)
    try {
      window.sessionStorage.setItem("nv-mercado-tab", id)
    } catch {
      // Private mode: the tab is simply not remembered.
    }
  }

  return (
    <div className="nv nv-wide">
      <style>{styles}</style>
      <header className="nv-header">
        <h1>Análisis de mercado</h1>
        <p className="nv-help">
          Qué comprar, qué precio poner y dónde no merece la pena competir con
          las cadenas.
        </p>
      </header>

      <DemoBanner />

      <div className="nv-tabs" role="tablist" aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`nv-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`nv-panel-${t.id}`}
            className="nv-tab"
            onClick={() => choose(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`nv-panel-${tab}`} aria-labelledby={`nv-tab-${tab}`}>
        {tab === "oportunidades" && <OpportunitiesTab />}
        {tab === "competencia" && <CompetitionTab />}
        {tab === "proveedores" && <SuppliersTab />}
      </div>
    </div>
  )
}

const DemoBanner = () => {
  const { data } = useQuery({
    queryKey: ["mercado", "oportunidades", "todas"],
    queryFn: () => api<OpportunitiesResponse>("/opportunities", { query: { status: "todas" } }),
  })
  if (!data?.has_demo) {
    return null
  }
  return (
    <div className="nv-demo" role="note">
      <strong>Datos de ejemplo.</strong> Los productos, precios, stock y
      proveedores marcados como «Ejemplo» son inventados para enseñar cómo
      funciona esta pantalla. No son lecturas reales de ninguna tienda.
    </div>
  )
}

const Notice = ({ ok, error, onClose }: { ok?: string | null; error?: string | null; onClose: () => void }) =>
  ok || error ? (
    <div className={ok ? "nv-ok" : "nv-error"} role={ok ? "status" : "alert"} style={{ marginBottom: 16 }}>
      <span>{ok ?? error}</span>
      <button className="nv-link" onClick={onClose}>
        Cerrar
      </button>
    </div>
  ) : null

// ------------------------------------------------------------- Oportunidades

const OpportunitiesTab = () => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>("pendiente")
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["mercado", "oportunidades", status],
    queryFn: () => api<OpportunitiesResponse>("/opportunities", { query: { status } }),
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["mercado"] })

  const recompute = useMutation({
    mutationFn: () =>
      api<{ created: number; products: number; without_cost: number }>("/recompute", {
        method: "POST",
      }),
    onSuccess: (r) => {
      setError(null)
      setOk(
        `Listo: ${r.created} sugerencias para ${r.products} productos vigilados.` +
          (r.without_cost
            ? ` ${r.without_cost} no tienen coste de proveedor: sube su tarifa para poder calcular el margen.`
            : "")
      )
      refresh()
    },
    onError: (e) => setError(errorText(e)),
  })

  const mark = useMutation({
    mutationFn: ({ id, next }: { id: string; next: Status }) =>
      api(`/opportunities/${id}`, { method: "POST", body: { status: next } }),
    onSuccess: (_, { next }) => {
      setError(null)
      setOk(
        next === "hecha"
          ? "Marcada como hecha."
          : next === "descartada"
            ? "Descartada. No se volverá a proponer en 30 días."
            : "Vuelve a estar pendiente."
      )
      refresh()
    },
    onError: (e) => setError(errorText(e)),
  })

  const counts = data?.counts

  return (
    <section aria-label="Oportunidades">
      <p className="nv-help">
        Cada fila es una cosa concreta que puedes hacer. Las de arriba son las
        que más te convienen. Cuando la hagas, pulsa «Hecho».
      </p>
      <Notice ok={ok} error={error} onClose={() => { setOk(null); setError(null) }} />

      <div className="nv-row nv-filter" role="group" aria-label="Ver">
        {(
          [
            ["pendiente", "Pendientes"],
            ["hecha", "Hechas"],
            ["descartada", "Descartadas"],
          ] as [Status, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            className="nv-btn nv-btn-secondary"
            aria-pressed={status === value}
            onClick={() => setStatus(value)}
          >
            {label}
            {counts ? ` (${counts[value]})` : ""}
          </button>
        ))}
        <button
          className="nv-btn nv-btn-secondary"
          onClick={() => recompute.mutate()}
          disabled={recompute.isPending}
        >
          {recompute.isPending ? "Calculando..." : "Recalcular ahora"}
        </button>
      </div>

      {isLoading && <p className="nv-help">Cargando...</p>}
      {!isLoading && !data?.opportunities.length && (
        <p className="nv-help">
          {status === "pendiente"
            ? "No hay nada pendiente. Añade páginas de la competencia y tarifas de proveedores, y pulsa «Recalcular ahora»."
            : "Todavía no hay ninguna aquí."}
        </p>
      )}

      <ul className="nv-list">
        {data?.opportunities.map((o) => (
          <li key={o.id} className={`nv-opp nv-act-${o.action}`}>
            <div className="nv-row">
              <span className={`nv-badge nv-badge-${o.action}`}>{ACTIONS[o.action].label}</span>
              {o.is_demo && <span className="nv-badge nv-badge-demo">Ejemplo</span>}
              <span className="nv-muted">{ACTIONS[o.action].help}</span>
            </div>
            <h3>{o.product_title}</h3>
            <p className="nv-opp-reason">{o.reason}</p>
            <div className="nv-opp-meta">
              {o.suggested_price != null && (
                <span className="nv-opp-price">
                  Precio recomendado: {euros(o.suggested_price)}
                </span>
              )}
              <span>
                Interés: <span className="nv-score">{Math.round(o.score)}</span> de 100
              </span>
              {o.ean && <span className="nv-muted">EAN {o.ean}</span>}
            </div>
            <Factors factors={o.factors} />
            <div className="nv-row">
              {o.status === "pendiente" ? (
                <>
                  <button
                    className="nv-btn nv-btn-done"
                    disabled={mark.isPending}
                    onClick={() => mark.mutate({ id: o.id, next: "hecha" })}
                  >
                    Hecho
                  </button>
                  <button
                    className="nv-btn nv-btn-secondary"
                    disabled={mark.isPending}
                    onClick={() => mark.mutate({ id: o.id, next: "descartada" })}
                  >
                    Descartar
                  </button>
                </>
              ) : (
                <button
                  className="nv-btn nv-btn-secondary"
                  disabled={mark.isPending}
                  onClick={() => mark.mutate({ id: o.id, next: "pendiente" })}
                >
                  Volver a pendientes
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {data && <SettingsForm settings={data.settings} onSaved={(m) => { setOk(m); refresh() }} />}
    </section>
  )
}

const Factors = ({ factors }: { factors: Record<string, unknown> | null }) => {
  if (!factors) {
    return null
  }
  const n = (k: string) => (typeof factors[k] === "number" ? Math.round(factors[k] as number) : null)
  const list = (k: string) => ((factors[k] as string[]) ?? []).join(", ")
  return (
    <details>
      <summary>¿Por qué?</summary>
      <ul className="nv-factors">
        <li>
          Demanda: <strong>{n("demanda")}</strong> de 100
          {factors.demanda_conocida ? "" : " (sin datos de búsquedas todavía)"}
        </li>
        <li>
          Margen: <strong>{n("margen")}</strong> de 100
          {factors.margen_mercado_pct != null ? ` (${n("margen_mercado_pct")} % al precio de mercado)` : ""}
        </li>
        <li>Hueco: <strong>{n("hueco")}</strong> de 100</li>
        <li>Presión de las cadenas: <strong>{n("presion")}</strong> de 100</li>
        <li>Precio de mercado (mediana): {euros(factors.mediana_mercado as number | null)}</li>
        <li>Tu precio: {euros(factors.nuestro_precio as number | null)}</li>
        <li>
          Tu stock: {factors.nuestro_stock == null ? "no lo tienes" : `${factors.nuestro_stock} unidades`}
        </li>
        <li>
          Mejor coste: {euros(factors.mejor_coste as number | null)}
          {factors.mejor_proveedor ? ` (${factors.mejor_proveedor})` : ""}
        </li>
        <li>Precio mínimo con tu margen: {euros(factors.precio_minimo as number | null)}</li>
        {list("sin_stock") && <li>Sin stock: {list("sin_stock")}</li>}
        {list("en_promocion") && <li>En promoción: {list("en_promocion")}</li>}
      </ul>
    </details>
  )
}

const pct = (n: number) => String(Math.round(n * 1000) / 10).replace(".", ",")

const SettingsForm = ({ settings, onSaved }: { settings: Settings; onSaved: (m: string) => void }) => {
  const [draft, setDraft] = useState({
    weight_demand: pct(settings.weight_demand),
    weight_margin: pct(settings.weight_margin),
    weight_gap: pct(settings.weight_gap),
    weight_pressure: pct(settings.weight_pressure),
    min_margin_pct: String(settings.min_margin_pct).replace(".", ","),
  })
  const [error, setError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: async () => {
      const values = Object.fromEntries(
        Object.entries(draft).map(([k, v]) => [k, parseNumber(v)])
      ) as Record<keyof typeof draft, number | null>
      if (Object.values(values).some((v) => v == null || v < 0)) {
        throw new Error("Escribe un número en cada casilla.")
      }
      if (values.min_margin_pct! > 90) {
        throw new Error("El margen mínimo no puede pasar del 90 %.")
      }
      await api("/settings", {
        method: "POST",
        body: {
          weight_demand: values.weight_demand! / 100,
          weight_margin: values.weight_margin! / 100,
          weight_gap: values.weight_gap! / 100,
          weight_pressure: values.weight_pressure! / 100,
          min_margin_pct: values.min_margin_pct!,
        },
      })
      await api("/recompute", { method: "POST" })
    },
    onSuccess: () => {
      setError(null)
      onSaved("Ajustes guardados y sugerencias recalculadas.")
    },
    onError: (e) => setError(errorText(e)),
  })

  const field = (key: keyof typeof draft, label: string) => (
    <div>
      <label className="nv-label" htmlFor={`nv-set-${key}`}>
        {label}
      </label>
      <input
        id={`nv-set-${key}`}
        className="nv-input"
        inputMode="decimal"
        value={draft[key]}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <details className="nv-section nv-card-box">
      <summary>Ajustes del cálculo</summary>
      <p className="nv-help">
        Margen mínimo: nunca se recomienda un precio que te deje menos margen
        que este (sobre el precio sin IVA). Los precios de venta se calculan
        con el 21 % de IVA incluido.
      </p>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        {field("min_margin_pct", "Margen mínimo (%)")}
        <p className="nv-help" style={{ marginTop: 24 }}>
          Cuánto cuenta cada cosa en la puntuación (en %). La presión de las
          cadenas resta.
        </p>
        <div className="nv-weights">
          {field("weight_demand", "Demanda")}
          {field("weight_margin", "Margen")}
          {field("weight_gap", "Hueco")}
          {field("weight_pressure", "Presión (resta)")}
        </div>
        {error && <p className="nv-error" role="alert">{error}</p>}
        <button className="nv-btn nv-btn-primary nv-btn-big" disabled={save.isPending}>
          {save.isPending ? "Guardando..." : "Guardar ajustes"}
        </button>
      </form>
    </details>
  )
}

// ---------------------------------------------------------------- Competencia

const CompetitionTab = () => {
  const queryClient = useQueryClient()
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualFor, setManualFor] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["mercado", "competencia"],
    queryFn: () => api<CompetitionResponse>("/competitors"),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["mercado"] })
  const done = (message: string) => {
    setError(null)
    setOk(message)
    refresh()
  }

  const read = useMutation({
    mutationFn: (id: string) =>
      api<{ result: { status: string; message: string } | null }>(`/listings/${id}/read`, {
        method: "POST",
      }),
    onSuccess: (r) => {
      const result = r.result
      if (result?.status === "ok") {
        done(`Leído: ${result.message}`)
      } else {
        setOk(null)
        setError(result?.message ?? "No se ha podido leer.")
        refresh()
      }
    },
    onError: (e) => setError(errorText(e)),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api(`/listings/${id}`, { method: "DELETE" }),
    onSuccess: () => done("Página quitada. Ya no se vigilará."),
    onError: (e) => setError(errorText(e)),
  })

  return (
    <section aria-label="Competencia">
      <p className="nv-help">
        Precio y stock de cada tienda para tus productos, emparejados por el
        código de barras (EAN). Se leen solos cada noche, despacio y solo en
        las páginas que las tiendas permiten leer.
      </p>
      <Notice ok={ok} error={error} onClose={() => { setOk(null); setError(null) }} />

      <AddListingForm competitors={data?.competitors ?? []} onDone={done} onError={setError} />

      {isLoading && <p className="nv-help">Cargando...</p>}
      {!isLoading && !data?.products.length && (
        <p className="nv-help">Todavía no vigilas ningún producto. Añade la primera página arriba.</p>
      )}

      <ul className="nv-list">
        {data?.products.map((p) => (
          <li key={p.ean} className="nv-card-box">
            <h3>
              {p.title}
              {p.is_demo && <span className="nv-badge nv-badge-demo">Ejemplo</span>}
            </h3>
            <p className="nv-muted" style={{ margin: "4px 0 8px" }}>
              EAN {p.ean} ·{" "}
              {p.in_catalog
                ? `Tu precio: ${euros(p.our_price)} · Tienes ${p.our_stock ?? "?"} ${p.our_stock === 1 ? "unidad" : "unidades"}`
                : "No lo tienes en tu catálogo"}{" "}
              · Precio de mercado: {euros(p.market_median)}
            </p>
            <div className="nv-table-wrap">
              <table className="nv-table">
                <thead>
                  <tr>
                    <th scope="col">Tienda</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Última lectura</th>
                    <th scope="col">
                      <span className="nv-small">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {p.listings.map((l) => (
                    <ListingRow
                      key={l.id}
                      listing={l}
                      busy={read.isPending || remove.isPending}
                      onRead={() => read.mutate(l.id)}
                      onManual={() => setManualFor(manualFor === l.id ? null : l.id)}
                      onRemove={() => {
                        if (window.confirm(`¿Dejar de vigilar ${p.title} en ${l.competitor}?`)) {
                          remove.mutate(l.id)
                        }
                      }}
                      manual={
                        manualFor === l.id ? (
                          <ManualPriceForm
                            listingId={l.id}
                            onDone={(m) => {
                              setManualFor(null)
                              done(m)
                            }}
                            onError={setError}
                          />
                        ) : null
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </li>
        ))}
      </ul>

      <AddCompetitorForm onDone={done} onError={setError} />
    </section>
  )
}

const ListingRow = ({
  listing: l,
  busy,
  onRead,
  onManual,
  onRemove,
  manual,
}: {
  listing: ShopListing
  busy: boolean
  onRead: () => void
  onManual: () => void
  onRemove: () => void
  manual: ReactNode
}) => {
  const s = l.latest
  const available = s && (s.availability === "in_stock" || s.availability === "limited")
  return (
    <>
      <tr>
        <td>
          <strong>{l.competitor}</strong>
          <br />
          {l.is_demo ? (
            <span className="nv-small nv-muted">Dirección de ejemplo</span>
          ) : (
            <a className="nv-small" href={l.url} target="_blank" rel="noopener noreferrer">
              Ver página
            </a>
          )}
        </td>
        <td>
          {s?.price != null ? euros(s.price) : "—"}
          {s?.is_promo && (
            <>
              <br />
              <span className="nv-small">En promoción{s.regular_price ? ` (antes ${euros(s.regular_price)})` : ""}</span>
            </>
          )}
        </td>
        <td className={s ? (available ? "nv-stock-in" : "nv-stock-out") : ""}>
          {s ? AVAILABILITY[s.availability] : "Sin dato"}
        </td>
        <td>
          {s ? dateText(s.read_at) : "Nunca"}
          {s && (
            <span className="nv-small nv-muted">
              <br />
              {s.source === "manual" ? "Apuntado a mano" : s.source === "demo" ? "Inventado (ejemplo)" : "Automático"}
            </span>
          )}
          {l.last_status && l.last_status !== "ok" && l.last_message && (
            <span className="nv-small" style={{ display: "block", color: "#7a1a14" }}>
              {l.last_message}
            </span>
          )}
        </td>
        <td>
          <div className="nv-row">
            {!l.is_demo && (
              <button className="nv-btn nv-btn-secondary nv-btn-small" disabled={busy} onClick={onRead}>
                Leer ahora
              </button>
            )}
            <button className="nv-btn nv-btn-secondary nv-btn-small" onClick={onManual}>
              Apuntar a mano
            </button>
            <button className="nv-link" disabled={busy} onClick={onRemove}>
              Quitar
            </button>
          </div>
        </td>
      </tr>
      {manual && (
        <tr>
          <td colSpan={5}>{manual}</td>
        </tr>
      )}
    </>
  )
}

const ManualPriceForm = ({
  listingId,
  onDone,
  onError,
}: {
  listingId: string
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const [price, setPrice] = useState("")
  const [availability, setAvailability] = useState<Availability>("in_stock")
  const [promo, setPromo] = useState(false)
  const save = useMutation({
    mutationFn: () => {
      const amount = parseNumber(price)
      if (availability !== "out_of_stock" && (amount == null || amount <= 0)) {
        throw new Error("Escribe el precio que marca la tienda, por ejemplo 54,90.")
      }
      return api(`/listings/${listingId}/snapshots`, {
        method: "POST",
        body: { price: amount, availability, is_promo: promo },
      })
    },
    onSuccess: () => onDone("Precio apuntado."),
    onError: (e) => onError(errorText(e)),
  })
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
    >
      <div className="nv-form-grid">
        <div>
          <label className="nv-label" htmlFor={`nv-mp-${listingId}`}>
            Precio con IVA
          </label>
          <input
            id={`nv-mp-${listingId}`}
            className="nv-input"
            inputMode="decimal"
            placeholder="54,90"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="nv-label" htmlFor={`nv-ms-${listingId}`}>
            ¿Tienen stock?
          </label>
          <select
            id={`nv-ms-${listingId}`}
            className="nv-select"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
          >
            <option value="in_stock">Sí, hay stock</option>
            <option value="limited">Quedan pocas</option>
            <option value="out_of_stock">No, agotado</option>
          </select>
        </div>
      </div>
      <label className="nv-label">
        <input type="checkbox" checked={promo} onChange={(e) => setPromo(e.target.checked)} />{" "}
        Está en promoción
      </label>
      <button className="nv-btn nv-btn-primary" disabled={save.isPending}>
        {save.isPending ? "Guardando..." : "Guardar precio"}
      </button>
    </form>
  )
}

const AddListingForm = ({
  competitors,
  onDone,
  onError,
}: {
  competitors: CompetitionResponse["competitors"]
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const [competitorId, setCompetitorId] = useState("")
  const [url, setUrl] = useState("")
  const [ean, setEan] = useState("")
  const add = useMutation({
    mutationFn: () => {
      if (!competitorId) {
        throw new Error("Elige la tienda.")
      }
      if (!/^https?:\/\//i.test(url.trim())) {
        throw new Error("Pega la dirección completa de la página, empezando por https://")
      }
      if (!/^\d{8}$|^\d{12,14}$/.test(ean.replace(/\s/g, ""))) {
        throw new Error("El EAN son los 13 números del código de barras.")
      }
      return api<{ listing: { variant_id: string | null } }>("/listings", {
        method: "POST",
        body: { competitor_id: competitorId, url: url.trim(), ean: ean.replace(/\s/g, "") },
      })
    },
    onSuccess: (r) => {
      setUrl("")
      setEan("")
      onDone(
        r.listing.variant_id
          ? "Página guardada y unida a tu producto con el mismo EAN. Pulsa «Leer ahora» para ver su precio."
          : "Página guardada. No tienes ningún producto con ese EAN en tu catálogo; se vigilará igualmente."
      )
    },
    onError: (e) => onError(errorText(e)),
  })

  return (
    <details className="nv-card-box nv-section">
      <summary>+ Vigilar una página de la competencia</summary>
      <p className="nv-help">
        Abre el producto en la web de la tienda, copia la dirección de arriba
        del navegador y pégala aquí con el código de barras del producto.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add.mutate()
        }}
      >
        <label className="nv-label" htmlFor="nv-add-shop">
          Tienda
        </label>
        <select
          id="nv-add-shop"
          className="nv-select"
          value={competitorId}
          onChange={(e) => setCompetitorId(e.target.value)}
        >
          <option value="">Elige una tienda...</option>
          {competitors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="nv-label" htmlFor="nv-add-url">
          Dirección de la página
        </label>
        <input
          id="nv-add-url"
          className="nv-input"
          inputMode="url"
          placeholder="https://www.tienda.es/perfume..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label className="nv-label" htmlFor="nv-add-ean">
          EAN (los números del código de barras)
        </label>
        <input
          id="nv-add-ean"
          className="nv-input"
          inputMode="numeric"
          placeholder="8411061000000"
          value={ean}
          onChange={(e) => setEan(e.target.value)}
        />
        <button className="nv-btn nv-btn-primary nv-btn-big" disabled={add.isPending}>
          {add.isPending ? "Guardando..." : "Guardar página"}
        </button>
      </form>
    </details>
  )
}

const AddCompetitorForm = ({
  onDone,
  onError,
}: {
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const add = useMutation({
    mutationFn: () =>
      api("/competitors", {
        method: "POST",
        body: { name: name.trim(), website: website.trim() || null },
      }),
    onSuccess: () => {
      setName("")
      setWebsite("")
      onDone("Tienda añadida. Ya puedes vigilar sus páginas.")
    },
    onError: (e) => onError(errorText(e)),
  })
  return (
    <details className="nv-card-box nv-section">
      <summary>+ Añadir otra tienda de la competencia</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add.mutate()
        }}
      >
        <div className="nv-form-grid">
          <div>
            <label className="nv-label" htmlFor="nv-comp-name">
              Nombre de la tienda
            </label>
            <input id="nv-comp-name" className="nv-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="nv-label" htmlFor="nv-comp-web">
              Web <span className="nv-optional">(opcional)</span>
            </label>
            <input
              id="nv-comp-web"
              className="nv-input"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>
        <button className="nv-btn nv-btn-primary" style={{ marginTop: 16 }} disabled={add.isPending || !name.trim()}>
          Añadir tienda
        </button>
      </form>
    </details>
  )
}

// ---------------------------------------------------------------- Proveedores

const SuppliersTab = () => {
  const queryClient = useQueryClient()
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const { data, isLoading } = useQuery({
    queryKey: ["mercado", "proveedores"],
    queryFn: () => api<{ suppliers: Supplier[] }>("/suppliers"),
  })
  const done = (m: string) => {
    setError(null)
    setOk(m)
    queryClient.invalidateQueries({ queryKey: ["mercado"] })
  }

  return (
    <section aria-label="Proveedores">
      <p className="nv-help">
        Sube la tarifa de cada proveedor (Excel o CSV) y verás el margen que
        te deja cada producto al precio de mercado, y qué proveedor es más
        barato.
      </p>
      <Notice ok={ok} error={error} onClose={() => { setOk(null); setError(null) }} />

      {isLoading && <p className="nv-help">Cargando...</p>}
      {!isLoading && !data?.suppliers.length && (
        <p className="nv-help">Todavía no hay proveedores. Añade el primero abajo.</p>
      )}

      <ul className="nv-list">
        {data?.suppliers.map((s) => (
          <li key={s.id} className="nv-card-box">
            <h3>
              {s.name}
              {s.is_demo && <span className="nv-badge nv-badge-demo">Ejemplo</span>}
            </h3>
            <p className="nv-muted" style={{ margin: "4px 0 12px" }}>
              {[
                s.contact_name,
                s.email,
                s.phone,
                s.min_order_amount != null ? `Pedido mínimo ${euros(s.min_order_amount)}` : null,
                s.lead_time_days != null ? `Entrega en ${s.lead_time_days} días` : null,
                s.payment_terms ? `Pago: ${s.payment_terms}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Sin datos de contacto"}
            </p>
            <p style={{ margin: "0 0 12px" }}>
              {s.offers} productos en su tarifa
              {s.last_tariff_date ? ` · tarifa del ${dateText(s.last_tariff_date)}` : ""}
            </p>
            <div className="nv-row">
              <button
                className="nv-btn nv-btn-secondary"
                aria-expanded={open === s.id}
                onClick={() => setOpen(open === s.id ? null : s.id)}
              >
                {open === s.id ? "Cerrar" : "Ver tarifa y subir una nueva"}
              </button>
            </div>
            {open === s.id && <SupplierDetail supplier={s} onDone={done} onError={setError} />}
          </li>
        ))}
      </ul>

      <AddSupplierForm onDone={done} onError={setError} />
    </section>
  )
}

const SupplierDetail = ({
  supplier,
  onDone,
  onError,
}: {
  supplier: Supplier
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["mercado", "tarifa", supplier.id],
    queryFn: () => api<{ offers: Offer[] }>(`/suppliers/${supplier.id}/offers`),
  })
  return (
    <div style={{ marginTop: 16 }}>
      <TariffUpload supplierId={supplier.id} onDone={onDone} onError={onError} />
      <h3 style={{ marginTop: 24 }}>Su tarifa</h3>
      {isLoading && <p className="nv-help">Cargando...</p>}
      {!isLoading && !data?.offers.length && <p className="nv-help">Todavía no has subido ninguna tarifa.</p>}
      {!!data?.offers.length && (
        <div className="nv-table-wrap">
          <table className="nv-table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Coste sin IVA</th>
                <th scope="col">Mínimo</th>
                <th scope="col">Precio de mercado</th>
                <th scope="col">Margen</th>
              </tr>
            </thead>
            <tbody>
              {data.offers.map((o) => (
                <tr key={o.id}>
                  <td>
                    {o.product_name ?? "Sin nombre"}
                    <br />
                    <span className="nv-small nv-muted">
                      EAN {o.ean}
                      {o.is_cheapest ? " · El proveedor más barato" : ""}
                    </span>
                  </td>
                  <td>{euros(o.cost)}</td>
                  <td>{o.min_units} uds.</td>
                  <td>{euros(o.market_price)}</td>
                  <td
                    className={
                      o.margin_pct == null ? "" : o.margin_pct >= 25 ? "nv-stock-in" : "nv-stock-out"
                    }
                  >
                    {o.margin_pct == null ? "Sin precio de mercado" : `${String(o.margin_pct).replace(".", ",")} %`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const FIELD_LABELS: Record<string, string> = {
  ean: "EAN",
  cost: "Coste sin IVA",
  min_units: "Unidades mínimas",
  product_name: "Producto",
  brand: "Marca",
  tariff_date: "Fecha",
}

const readFileBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ""))
    reader.onerror = () => reject(new Error("No se ha podido abrir el archivo."))
    reader.readAsDataURL(file)
  })

const TariffUpload = ({
  supplierId,
  onDone,
  onError,
}: {
  supplierId: string
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const [file, setFile] = useState<{ name: string; base64: string } | null>(null)
  const [preview, setPreview] = useState<TariffSummary | null>(null)
  const [mapping, setMapping] = useState<Record<string, number> | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const send = useMutation({
    mutationFn: (dryRun: boolean) =>
      api<TariffSummary>(`/suppliers/${supplierId}/tariff`, {
        method: "POST",
        body: {
          filename: file!.name,
          content_base64: file!.base64,
          tariff_date: date,
          dry_run: dryRun,
          ...(mapping && mapping.ean !== undefined && mapping.cost !== undefined ? { mapping } : {}),
        },
      }),
    onSuccess: (r) => {
      if (r.imported) {
        setFile(null)
        setPreview(null)
        setMapping(null)
        onDone(
          `Tarifa importada: ${r.created} productos${r.replaced ? ` (${r.replaced} sustituyen precios anteriores)` : ""}.` +
            (r.error_count ? ` ${r.error_count} filas no se han podido leer.` : "")
        )
      } else {
        setPreview(r)
        if (!mapping) {
          const guessed: Record<string, number> = {}
          for (const [field, header] of Object.entries(r.mapping)) {
            const i = r.headers.indexOf(header ?? "")
            if (i >= 0) {
              guessed[field] = i
            }
          }
          setMapping(guessed)
        }
      }
    },
    onError: (e) => onError(errorText(e)),
  })

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setPreview(null)
    setMapping(null)
    if (!f) {
      return
    }
    if (f.size > 8 * 1024 * 1024) {
      onError("El archivo es demasiado grande (máximo 8 MB).")
      return
    }
    try {
      setFile({ name: f.name, base64: await readFileBase64(f) })
    } catch (err) {
      onError(errorText(err))
    }
  }

  return (
    <div className="nv-card-box" style={{ background: "#f7f6f2" }}>
      <h3>Subir una tarifa nueva</h3>
      <p className="nv-help">
        Vale un Excel (.xlsx) o un CSV. Hace falta una columna con el EAN y
        otra con el coste (por ejemplo «Precio neto» o «Coste»). Primero verás
        cómo se ha leído, y luego decides si importarla.
      </p>
      <label className="nv-label" htmlFor={`nv-file-${supplierId}`}>
        Archivo de la tarifa
      </label>
      <input
        id={`nv-file-${supplierId}`}
        className="nv-file"
        type="file"
        accept=".csv,.xlsx,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={onFile}
      />
      <label className="nv-label" htmlFor={`nv-date-${supplierId}`}>
        Fecha de la tarifa <span className="nv-optional">(si el archivo no la trae)</span>
      </label>
      <input
        id={`nv-date-${supplierId}`}
        className="nv-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ maxWidth: 280 }}
      />
      <div className="nv-row" style={{ marginTop: 16 }}>
        <button
          className="nv-btn nv-btn-secondary"
          disabled={!file || send.isPending}
          onClick={() => send.mutate(true)}
        >
          {send.isPending && !preview ? "Leyendo..." : "Comprobar el archivo"}
        </button>
      </div>

      {preview && (
        <div style={{ marginTop: 20 }}>
          <p>
            <strong>
              {preview.valid_rows} de {preview.total_rows} filas se pueden importar.
            </strong>
          </p>
          {!!preview.headers.length && mapping && (
            <div className="nv-form-grid">
              {Object.keys(FIELD_LABELS).map((field) => (
                <div key={field}>
                  <label className="nv-label" htmlFor={`nv-map-${supplierId}-${field}`}>
                    {FIELD_LABELS[field]}
                  </label>
                  <select
                    id={`nv-map-${supplierId}-${field}`}
                    className="nv-select"
                    value={mapping[field] ?? ""}
                    onChange={(e) => {
                      const next = { ...mapping }
                      if (e.target.value === "") {
                        delete next[field]
                      } else {
                        next[field] = Number(e.target.value)
                      }
                      setMapping(next)
                    }}
                  >
                    <option value="">(no está)</option>
                    {preview.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Columna ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          {!!preview.warnings.length && (
            <ul>
              {preview.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
          {!!preview.errors.length && (
            <div className="nv-error" style={{ margin: "12px 0" }}>
              {preview.error_count} filas con problemas:
              <ul>
                {preview.errors.slice(0, 8).map((e, i) => (
                  <li key={i}>
                    {e.row ? `Fila ${e.row}: ` : ""}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!preview.preview.length && (
            <div className="nv-table-wrap">
              <table className="nv-table">
                <thead>
                  <tr>
                    <th scope="col">EAN</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Coste sin IVA</th>
                    <th scope="col">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((o) => (
                    <tr key={o.ean}>
                      <td>{o.ean}</td>
                      <td>{o.product_name ?? "—"}</td>
                      <td>{euros(o.cost)}</td>
                      <td>{o.min_units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="nv-row">
            <button className="nv-btn nv-btn-secondary" disabled={send.isPending} onClick={() => send.mutate(true)}>
              Volver a comprobar con estas columnas
            </button>
            <button
              className="nv-btn nv-btn-primary"
              disabled={send.isPending || !preview.valid_rows}
              onClick={() => send.mutate(false)}
            >
              {send.isPending ? "Importando..." : `Importar ${preview.valid_rows} productos`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const AddSupplierForm = ({
  onDone,
  onError,
}: {
  onDone: (m: string) => void
  onError: (m: string) => void
}) => {
  const empty = {
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    min_order_amount: "",
    lead_time_days: "",
    payment_terms: "",
  }
  const [draft, setDraft] = useState(empty)
  const add = useMutation({
    mutationFn: () => {
      const minOrder = draft.min_order_amount.trim() ? parseNumber(draft.min_order_amount) : null
      const lead = draft.lead_time_days.trim() ? parseNumber(draft.lead_time_days) : null
      if (draft.min_order_amount.trim() && minOrder == null) {
        throw new Error("El pedido mínimo debe ser un número, por ejemplo 300.")
      }
      if (draft.lead_time_days.trim() && (lead == null || !Number.isInteger(lead))) {
        throw new Error("El plazo de entrega son días, por ejemplo 5.")
      }
      return api("/suppliers", {
        method: "POST",
        body: {
          name: draft.name.trim(),
          contact_name: draft.contact_name.trim() || null,
          email: draft.email.trim() || null,
          phone: draft.phone.trim() || null,
          min_order_amount: minOrder,
          lead_time_days: lead,
          payment_terms: draft.payment_terms.trim() || null,
        },
      })
    },
    onSuccess: () => {
      setDraft(empty)
      onDone("Proveedor añadido. Ahora puedes subir su tarifa.")
    },
    onError: (e) => onError(errorText(e)),
  })
  const field = (key: keyof typeof empty, label: string, optional = true, inputMode?: "decimal" | "numeric" | "email" | "tel") => (
    <div>
      <label className="nv-label" htmlFor={`nv-sup-${key}`}>
        {label} {optional && <span className="nv-optional">(opcional)</span>}
      </label>
      <input
        id={`nv-sup-${key}`}
        className="nv-input"
        inputMode={inputMode}
        value={draft[key]}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
      />
    </div>
  )
  return (
    <details className="nv-card-box nv-section">
      <summary>+ Añadir un proveedor</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add.mutate()
        }}
      >
        {field("name", "Nombre del proveedor", false)}
        <div className="nv-form-grid">
          {field("contact_name", "Persona de contacto")}
          {field("email", "Email", true, "email")}
          {field("phone", "Teléfono", true, "tel")}
          {field("min_order_amount", "Pedido mínimo (€ sin IVA)", true, "decimal")}
          {field("lead_time_days", "Plazo de entrega (días)", true, "numeric")}
          {field("payment_terms", "Condiciones de pago")}
        </div>
        <button className="nv-btn nv-btn-primary nv-btn-big" disabled={add.isPending || !draft.name.trim()}>
          {add.isPending ? "Guardando..." : "Guardar proveedor"}
        </button>
      </form>
    </details>
  )
}

export const config = defineRouteConfig({
  label: "Análisis de mercado",
})

export default AnalisisMercadoPage
