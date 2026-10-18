import { getLang } from "@lib/i18n/server"
import { getInfoContent, isInfoSlug } from "@modules/info/content"
import InfoPageTemplate from "@modules/info/templates/info-page"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { countryCode, slug } = await props.params

  if (!isInfoSlug(slug)) {
    notFound()
  }

  const page = getInfoContent(await getLang()).pages[slug]

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${countryCode}/info/${slug}` },
  }
}

export default async function InfoPage(props: Props) {
  const { slug } = await props.params

  if (!isInfoSlug(slug)) {
    notFound()
  }

  const content = getInfoContent(await getLang())

  return <InfoPageTemplate slug={slug} content={content} />
}
