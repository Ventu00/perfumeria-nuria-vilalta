import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RichText from "@modules/info/components/rich-text"
import { INFO_SLUGS, InfoSlug } from "@modules/info/content"
import { Block, InfoContent } from "@modules/info/content/types"

const BlockView = ({ block }: { block: Block }) => {
  if (typeof block === "string") {
    return (
      <p>
        <RichText text={block} />
      </p>
    )
  }

  if ("h3" in block) {
    return (
      <h3 className="text-base font-semibold text-nv-ink pt-2">
        <RichText text={block.h3} />
      </h3>
    )
  }

  if ("ul" in block) {
    return (
      <ul className="list-disc pl-5 flex flex-col gap-2 marker:text-nv-gold">
        {block.ul.map((item, i) => (
          <li key={i}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    )
  }

  if ("box" in block) {
    return (
      <div className="border border-nv-sand bg-nv-sand/30 rounded-md p-4 flex flex-col gap-2 text-sm">
        {block.box.map((line, i) => (
          <p key={i}>
            <RichText text={line} />
          </p>
        ))}
      </div>
    )
  }

  const [first, ...rest] = block.cards.head
  return (
    <ul className="flex flex-col gap-3">
      {block.cards.rows.map((row, i) => (
        <li
          key={i}
          className="border border-nv-sand rounded-md p-4 bg-white/60"
        >
          <p className="font-semibold text-nv-ink break-words">
            <span className="sr-only">{first}: </span>
            <RichText text={row[0]} />
          </p>
          <dl className="mt-2 grid grid-cols-1 xsmall:grid-cols-[8rem_1fr] gap-x-4 gap-y-1 text-sm">
            {rest.map((label, j) => (
              <div key={j} className="contents">
                <dt className="text-ui-fg-muted">{label}</dt>
                <dd className="mb-1 xsmall:mb-0">
                  <RichText text={row[j + 1] ?? ""} />
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  )
}

export default function InfoPageTemplate({
  slug,
  content,
}: {
  slug: InfoSlug
  content: InfoContent
}) {
  const page = content.pages[slug]

  return (
    <div className="content-container py-12 small:py-20">
      <article className="max-w-prose mx-auto text-nv-ink/85 leading-relaxed">
        <header className="mb-10">
          <h1 className="font-serif text-4xl small:text-5xl leading-tight text-nv-ink">
            {page.title}
          </h1>
          <p className="mt-3 text-sm text-ui-fg-muted">{content.updated}</p>
          {page.intro && (
            <p className="mt-6 text-lg">
              <RichText text={page.intro} />
            </p>
          )}
        </header>

        <div className="flex flex-col gap-10">
          {page.sections.map((section, i) => (
            <section key={i} className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl small:text-3xl text-nv-ink">
                {section.heading}
              </h2>
              {section.blocks.map((block, j) => (
                <BlockView key={j} block={block} />
              ))}
            </section>
          ))}
        </div>

        <nav
          aria-label={content.otherPages}
          className="mt-16 pt-8 border-t border-nv-sand"
        >
          <h2 className="font-serif text-2xl text-nv-ink mb-4">
            {content.otherPages}
          </h2>
          <ul className="grid grid-cols-1 xsmall:grid-cols-2 gap-2">
            {INFO_SLUGS.filter((s) => s !== slug).map((s) => (
              <li key={s}>
                <LocalizedClientLink
                  href={`/info/${s}`}
                  className="underline underline-offset-2 hover:text-nv-gold"
                >
                  {content.pages[s].title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </div>
  )
}
