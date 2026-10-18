// Structured data for search engines. "<" is escaped so a value such as a
// product description can never close the script tag early.
const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)

export default JsonLd
