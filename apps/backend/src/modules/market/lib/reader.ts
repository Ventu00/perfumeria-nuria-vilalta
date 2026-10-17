import { extractProduct, ExtractedProduct, looksLikeBotCheck } from "./extract"
import { ALLOW_ALL, DENY_ALL, isAllowed, parseRobots, RobotsRules } from "./robots"

// Polite reader for competitor product pages:
// - asks robots.txt first and skips anything it disallows,
// - says who it is in the User-Agent,
// - waits several seconds between two requests to the same shop,
// - never logs in, keeps no cookies and stops at the first block or captcha.

export const PRODUCT_TOKEN = "NuriaVilaltaPreciosBot"

export const buildUserAgent = (contact?: string) =>
  `${PRODUCT_TOKEN}/1.0 (lector de precios de uso interno de Perfumeria Nuria Vilalta, Rubi; una lectura al dia${
    contact ? `; contacto: ${contact}` : ""
  })`

export type ReadStatus = "ok" | "sin_datos" | "bloqueado" | "robots" | "error"

export type ReadResult = {
  status: ReadStatus
  message: string
  data: ExtractedProduct | null
}

type FetchLike = (
  url: string,
  init: { headers: Record<string, string>; signal?: AbortSignal; redirect?: "follow" }
) => Promise<{ status: number; ok: boolean; url?: string; text: () => Promise<string> }>

export type ReaderOptions = {
  fetch?: FetchLike
  userAgent?: string
  /** Minimum wait between two requests to the same host. */
  minDelayMs?: number
  timeoutMs?: number
  sleep?: (ms: number) => Promise<void>
  now?: () => number
}

const MAX_HTML = 3_000_000

export class PriceReader {
  private fetchFn: FetchLike
  private userAgent: string
  private minDelayMs: number
  private timeoutMs: number
  private sleep: (ms: number) => Promise<void>
  private now: () => number
  private robots = new Map<string, RobotsRules>()
  private lastRequest = new Map<string, number>()
  private hostDelay = new Map<string, number>()
  private blockedHosts = new Map<string, string>()

  constructor(options: ReaderOptions = {}) {
    this.fetchFn = options.fetch ?? (globalThis.fetch as unknown as FetchLike)
    this.userAgent = options.userAgent ?? buildUserAgent()
    this.minDelayMs = options.minDelayMs ?? 6000
    this.timeoutMs = options.timeoutMs ?? 20000
    this.sleep = options.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)))
    this.now = options.now ?? (() => Date.now())
  }

  private async waitTurn(host: string) {
    const last = this.lastRequest.get(host)
    const delay = Math.max(this.minDelayMs, this.hostDelay.get(host) ?? 0)
    if (last != null) {
      const wait = last + delay - this.now()
      if (wait > 0) {
        await this.sleep(wait)
      }
    }
    this.lastRequest.set(host, this.now())
  }

  private async get(url: string, host: string) {
    await this.waitTurn(host)
    return this.fetchFn(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "es-ES,es;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(this.timeoutMs),
    })
  }

  private async robotsFor(origin: string, host: string): Promise<RobotsRules> {
    const cached = this.robots.get(origin)
    if (cached) {
      return cached
    }
    let rules: RobotsRules
    try {
      const res = await this.get(`${origin}/robots.txt`, host)
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        // RFC 9309 would allow everything here, but a shop refusing even its
        // robots.txt is a shop that does not want bots: stay away.
        rules = DENY_ALL
        this.blockedHosts.set(host, `robots.txt devuelve ${res.status}`)
      } else if (res.status >= 400 && res.status < 500) {
        rules = ALLOW_ALL
      } else if (!res.ok) {
        rules = DENY_ALL
      } else {
        rules = parseRobots((await res.text()).slice(0, 500_000), PRODUCT_TOKEN)
      }
    } catch {
      // Unreachable robots.txt: assume nothing is allowed (RFC 9309, 2.3.1.4).
      rules = DENY_ALL
    }
    if (rules.crawlDelaySeconds) {
      this.hostDelay.set(host, Math.min(rules.crawlDelaySeconds, 120) * 1000)
    }
    this.robots.set(origin, rules)
    return rules
  }

  async read(url: string, expectedEan?: string | null): Promise<ReadResult> {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return { status: "error", message: "La dirección no es válida.", data: null }
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { status: "error", message: "La dirección debe empezar por https://", data: null }
    }
    const host = parsed.host.toLowerCase()
    const blocked = this.blockedHosts.get(host)
    if (blocked) {
      return {
        status: "bloqueado",
        message: `La tienda ha bloqueado las lecturas hoy (${blocked}). No se insiste.`,
        data: null,
      }
    }

    const robots = await this.robotsFor(parsed.origin, host)
    if (!isAllowed(robots, parsed.pathname + parsed.search)) {
      return {
        status: "robots",
        message:
          robots.mode === "deny_all"
            ? "No se ha podido consultar robots.txt de la tienda; no se lee por precaución."
            : "La tienda no permite leer esta página a programas (robots.txt). Apunta el precio a mano.",
        data: null,
      }
    }

    let status: number
    let html: string
    try {
      const res = await this.get(parsed.toString(), host)
      status = res.status
      if (status === 401 || status === 403 || status === 429 || status === 503) {
        this.blockedHosts.set(host, `código ${status}`)
        return {
          status: "bloqueado",
          message: `La tienda ha rechazado la lectura (código ${status}). No se insiste.`,
          data: null,
        }
      }
      if (!res.ok) {
        return {
          status: "error",
          message:
            status === 404 || status === 410
              ? "La página ya no existe en la tienda (puede que hayan retirado el producto)."
              : `La tienda ha respondido con un error (código ${status}).`,
          data: null,
        }
      }
      html = (await res.text()).slice(0, MAX_HTML)
    } catch (e) {
      return {
        status: "error",
        message: `No se ha podido abrir la página (${(e as Error).name === "TimeoutError" ? "tarda demasiado" : "sin conexión"}).`,
        data: null,
      }
    }

    const data = extractProduct(html, expectedEan)
    if (!data) {
      if (looksLikeBotCheck(html)) {
        this.blockedHosts.set(host, "pide verificación")
        return {
          status: "bloqueado",
          message: "La tienda pide una verificación (captcha). No se salta: apunta el precio a mano.",
          data: null,
        }
      }
      return {
        status: "sin_datos",
        message: "La página no publica precio en formato estándar (schema.org u Open Graph).",
        data: null,
      }
    }
    if (data.ean_matches === false) {
      return {
        status: "ok",
        message: `Aviso: la página indica el EAN ${data.ean}, distinto del guardado.`,
        data,
      }
    }
    return { status: "ok", message: "Leído correctamente.", data }
  }
}
