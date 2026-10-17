// Minimal robots.txt reader following RFC 9309: the group for our product
// token (or "*"), longest matching rule wins, Allow wins a tie, "*" and "$"
// wildcards. Crawl-delay is not in the RFC but is honoured when present.

type Rule = { allow: boolean; pattern: string }

export type RobotsRules = {
  rules: Rule[]
  crawlDelaySeconds: number | null
  /** "allow_all" when robots.txt is missing, "deny_all" when unreachable. */
  mode: "parsed" | "allow_all" | "deny_all"
}

export const ALLOW_ALL: RobotsRules = { rules: [], crawlDelaySeconds: null, mode: "allow_all" }
export const DENY_ALL: RobotsRules = { rules: [], crawlDelaySeconds: null, mode: "deny_all" }

type Group = { agents: string[]; rules: Rule[]; crawlDelay: number | null }

export const parseRobots = (text: string, productToken: string): RobotsRules => {
  const groups: Group[] = []
  let current: Group | null = null
  let lastWasAgent = false

  for (const rawLine of text.split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim()
    const sep = line.indexOf(":")
    if (sep < 0) {
      continue
    }
    const key = line.slice(0, sep).trim().toLowerCase()
    const value = line.slice(sep + 1).trim()

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [], crawlDelay: null }
        groups.push(current)
      }
      current.agents.push(value.toLowerCase())
      lastWasAgent = true
      continue
    }
    lastWasAgent = false
    if (!current) {
      continue
    }
    if (key === "allow" || key === "disallow") {
      // An empty Disallow means "allow everything" and adds no rule.
      if (value) {
        current.rules.push({ allow: key === "allow", pattern: value })
      }
    } else if (key === "crawl-delay") {
      const n = Number(value.replace(",", "."))
      if (Number.isFinite(n) && n >= 0) {
        current.crawlDelay = n
      }
    }
  }

  const token = productToken.toLowerCase()
  let matching = groups.filter((g) =>
    g.agents.some((a) => a.split("/")[0].trim() === token)
  )
  if (!matching.length) {
    matching = groups.filter((g) => g.agents.includes("*"))
  }
  const delays = matching
    .map((g) => g.crawlDelay)
    .filter((d): d is number => d != null)

  return {
    rules: matching.flatMap((g) => g.rules),
    crawlDelaySeconds: delays.length ? Math.max(...delays) : null,
    mode: "parsed",
  }
}

const escapeRegex = (s: string) => s.replace(/[.+?^{}()|[\]\\]/g, "\\$&")

const patternMatches = (pattern: string, path: string) => {
  const anchored = pattern.endsWith("$")
  const body = anchored ? pattern.slice(0, -1) : pattern
  const re = new RegExp(
    `^${body.split("*").map(escapeRegex).join(".*")}${anchored ? "$" : ""}`
  )
  return re.test(path)
}

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

/** `pathWithQuery` is the URL path plus its query string, e.g. "/p/123?x=1". */
export const isAllowed = (robots: RobotsRules, pathWithQuery: string) => {
  if (robots.mode === "allow_all") {
    return true
  }
  if (robots.mode === "deny_all") {
    return false
  }
  if (pathWithQuery === "/robots.txt") {
    return true
  }
  const path = safeDecode(pathWithQuery)
  let best: Rule | null = null
  for (const rule of robots.rules) {
    if (!patternMatches(safeDecode(rule.pattern), path)) {
      continue
    }
    if (
      !best ||
      rule.pattern.length > best.pattern.length ||
      (rule.pattern.length === best.pattern.length && rule.allow)
    ) {
      best = rule
    }
  }
  return best ? best.allow : true
}
