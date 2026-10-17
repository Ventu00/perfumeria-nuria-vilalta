import { readFileSync } from "fs"
import { join } from "path"
import { PriceReader, PRODUCT_TOKEN } from "../reader"
import { isAllowed, parseRobots } from "../robots"

const fixture = (name: string) =>
  readFileSync(join(__dirname, "fixtures", name), "utf8")

type Page = { status: number; body: string } | Error

const fakeSite = (pages: Record<string, Page>) => {
  const calls: { url: string; at: number; ua: string }[] = []
  let clock = 0
  const sleeps: number[] = []
  const reader = new PriceReader({
    minDelayMs: 5000,
    now: () => clock,
    sleep: async (ms) => {
      sleeps.push(ms)
      clock += ms
    },
    fetch: async (url, init) => {
      calls.push({ url, at: clock, ua: init.headers["User-Agent"] })
      const page = pages[url]
      if (page instanceof Error) {
        throw page
      }
      const p = page ?? { status: 404, body: "" }
      return { status: p.status, ok: p.status < 300, text: async () => p.body }
    },
  })
  return { reader, calls, sleeps }
}

describe("robots.txt", () => {
  const robots = `
User-agent: *
Disallow: /checkout
Disallow: /*?sort=
Allow: /checkout/help$

User-agent: ${PRODUCT_TOKEN}
User-agent: OtherBot
Disallow: /privado/
Crawl-delay: 10
`
  it("uses our own group when one names us", () => {
    const rules = parseRobots(robots, PRODUCT_TOKEN)
    expect(rules.crawlDelaySeconds).toBe(10)
    expect(isAllowed(rules, "/privado/x")).toBe(false)
    expect(isAllowed(rules, "/checkout")).toBe(true)
  })

  it("falls back to * with wildcards, $ and longest match", () => {
    const rules = parseRobots(robots, "SomeoneElse")
    expect(isAllowed(rules, "/checkout/pay")).toBe(false)
    expect(isAllowed(rules, "/checkout/help")).toBe(true)
    expect(isAllowed(rules, "/checkout/help/more")).toBe(false)
    expect(isAllowed(rules, "/perfumes?sort=price")).toBe(false)
    expect(isAllowed(rules, "/perfumes/ambar-100")).toBe(true)
  })

  it("treats an empty Disallow as allow everything", () => {
    const rules = parseRobots("User-agent: *\nDisallow:\n", PRODUCT_TOKEN)
    expect(isAllowed(rules, "/anything")).toBe(true)
  })
})

describe("PriceReader", () => {
  it("reads a page, identifies itself and waits between requests to one host", async () => {
    const { reader, calls } = fakeSite({
      "https://shop.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /cuenta\n" },
      "https://shop.example/p/ambar": { status: 200, body: fixture("jsonld-in-stock.html") },
      "https://shop.example/p/azahar": {
        status: 200,
        body: fixture("jsonld-graph-promo-out-of-stock.html"),
      },
    })
    const a = await reader.read("https://shop.example/p/ambar", "2000000000015")
    const b = await reader.read("https://shop.example/p/azahar")
    expect(a.status).toBe("ok")
    expect(a.data?.price).toBe(54.95)
    expect(b.data?.availability).toBe("out_of_stock")

    expect(calls.map((c) => c.url)).toEqual([
      "https://shop.example/robots.txt",
      "https://shop.example/p/ambar",
      "https://shop.example/p/azahar",
    ])
    expect(calls.every((c) => c.ua.startsWith(`${PRODUCT_TOKEN}/1.0 (`))).toBe(true)
    for (let i = 1; i < calls.length; i++) {
      expect(calls[i].at - calls[i - 1].at).toBeGreaterThanOrEqual(5000)
    }
  })

  it("honours a longer Crawl-delay", async () => {
    const { reader, calls } = fakeSite({
      "https://slow.example/robots.txt": { status: 200, body: "User-agent: *\nCrawl-delay: 20\n" },
      "https://slow.example/a": { status: 200, body: fixture("jsonld-in-stock.html") },
    })
    await reader.read("https://slow.example/a")
    expect(calls[1].at - calls[0].at).toBe(20000)
  })

  it("does not fetch pages robots.txt disallows", async () => {
    const { reader, calls } = fakeSite({
      "https://closed.example/robots.txt": { status: 200, body: "User-agent: *\nDisallow: /\n" },
    })
    const r = await reader.read("https://closed.example/p/1")
    expect(r.status).toBe("robots")
    expect(calls).toHaveLength(1)
  })

  it("does not read anything when robots.txt cannot be reached", async () => {
    const { reader, calls } = fakeSite({
      "https://down.example/robots.txt": new Error("ECONNREFUSED"),
    })
    const r = await reader.read("https://down.example/p/1")
    expect(r.status).toBe("robots")
    expect(calls).toHaveLength(1)
  })

  it("treats a missing robots.txt as allowed", async () => {
    const { reader } = fakeSite({
      "https://norobots.example/p": { status: 200, body: fixture("opengraph-only.html") },
    })
    const r = await reader.read("https://norobots.example/p")
    expect(r.status).toBe("ok")
    expect(r.data?.source).toBe("opengraph")
  })

  it("stops at the first block and does not retry that shop", async () => {
    const { reader, calls } = fakeSite({
      "https://blocky.example/robots.txt": { status: 200, body: "" },
      "https://blocky.example/a": { status: 403, body: "Forbidden" },
      "https://blocky.example/b": { status: 200, body: fixture("jsonld-in-stock.html") },
    })
    expect((await reader.read("https://blocky.example/a")).status).toBe("bloqueado")
    expect((await reader.read("https://blocky.example/b")).status).toBe("bloqueado")
    expect(calls.map((c) => c.url)).not.toContain("https://blocky.example/b")
  })

  it("does not try to get past a captcha", async () => {
    const { reader, calls } = fakeSite({
      "https://cap.example/robots.txt": { status: 200, body: "" },
      "https://cap.example/a": { status: 200, body: fixture("bot-check.html") },
      "https://cap.example/b": { status: 200, body: fixture("jsonld-in-stock.html") },
    })
    expect((await reader.read("https://cap.example/a")).status).toBe("bloqueado")
    expect((await reader.read("https://cap.example/b")).status).toBe("bloqueado")
    expect(calls).toHaveLength(2)
  })

  it("reports pages without structured data", async () => {
    const { reader } = fakeSite({
      "https://plain.example/robots.txt": { status: 200, body: "" },
      "https://plain.example/a": { status: 200, body: fixture("no-product-data.html") },
    })
    expect((await reader.read("https://plain.example/a")).status).toBe("sin_datos")
  })

  it("rejects addresses that are not http(s)", async () => {
    const { reader, calls } = fakeSite({})
    expect((await reader.read("file:///etc/passwd")).status).toBe("error")
    expect((await reader.read("no es una url")).status).toBe("error")
    expect(calls).toHaveLength(0)
  })
})
