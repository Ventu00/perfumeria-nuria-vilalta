import { getBaseURL } from "@lib/util/env"
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL().replace(/\/$/, "")

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and transactional pages have nothing to rank.
      disallow: ["/*/checkout", "/*/account", "/*/cart", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
