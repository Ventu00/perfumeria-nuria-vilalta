import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="w-full border-b border-nv-sand bg-nv-ivory">
      <div className="content-container flex flex-col items-center text-center gap-8 py-20 small:py-28">
        <Image src="/nv-logo.svg" alt="" width={120} height={120} priority />
        <div className="flex flex-col gap-4 max-w-2xl">
          <p className="uppercase tracking-[0.3em] text-sm text-nv-gold">
            Perfumería y cosmética desde hace más de 30 años
          </p>
          <h1 className="font-serif text-5xl small:text-6xl leading-tight text-nv-ink">
            Perfumería Núria Vilalta
          </h1>
          <p className="text-lg text-ui-fg-subtle">
            Las fragancias y los cuidados que te recomendaríamos en la tienda,
            ahora con envío a casa y el mismo consejo de siempre.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <LocalizedClientLink
            href="/store"
            className="bg-nv-ink text-white px-8 py-4 text-base hover:bg-black"
          >
            Ver productos
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store?sortBy=created_at"
            className="border border-nv-ink text-nv-ink px-8 py-4 text-base hover:bg-nv-sand"
          >
            Novedades
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default Hero
