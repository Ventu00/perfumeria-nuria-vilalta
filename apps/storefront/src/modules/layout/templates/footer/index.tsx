import { T } from "@lib/i18n/provider"
import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { SHOP } from "@lib/shop-info";
import { getLang } from "@lib/i18n/server";
import { INFO_LABELS } from "@modules/info/content";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();
  const infoLabels = INFO_LABELS[await getLang()];

  return (
    <footer className="border-t border-nv-sand bg-nv-sand/40 w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="font-serif text-3xl text-nv-ink"
            >
              <T>Perfumería Núria Vilalta</T>
            </LocalizedClientLink>
            <p className="txt-small text-ui-fg-subtle mt-2 max-w-xs">
              <T>Más de 30 años aconsejando perfumes y cosmética en nuestra tienda.
              Ahora también online.</T>
            </p>
            <address className="not-italic txt-small text-ui-fg-subtle mt-6 flex flex-col gap-1 max-w-xs">
              <span className="txt-small-plus text-nv-ink">
                <T>Visítanos</T>
              </span>
              <a href={SHOP.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-nv-ink">
                {SHOP.street}
                <br />
                {SHOP.city}
              </a>
              <a href={SHOP.phoneHref} className="hover:text-nv-ink">
                {SHOP.phone}
              </a>
              <span className="txt-small-plus text-nv-ink mt-3">
                <T>Horario</T>
              </span>
              <span>
                <T>Lunes a sábado: 9:30–13:30 y 17:00–20:30</T>
              </span>
              <span>
                <T>Domingo cerrado</T>
              </span>
              <span className="mt-3">
                <T>Perfumería y centro de estética. Miembro de Passion Beauté.</T>
              </span>
              <span className="flex gap-4 mt-3">
                <a href={SHOP.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-nv-ink">
                  Instagram
                </a>
                <a href={SHOP.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-nv-ink">
                  Facebook
                </a>
              </span>
            </address>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  <T>Categorías</T>
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  <T>Colecciones</T>
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base"><T>Ayuda</T></span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/envios-y-devoluciones">
                    <T>Envíos y devoluciones</T>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/preguntas-frecuentes">
                    {infoLabels.faq}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/condiciones-de-venta">
                    {infoLabels.terms}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/aviso-legal">
                    {infoLabels.legal}
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/privacidad">
                    <T>Política de privacidad</T>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href="/info/cookies">
                    {infoLabels.cookies}
                  </LocalizedClientLink>
                </li>
                <li className="mt-2"><T>Envolvemos tus regalos gratis</T></li>
                <li><T>Pago seguro: tarjeta, Bizum, Apple Pay, Google Pay y Amazon Pay</T></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Perfumería Núria Vilalta.{" "}
            <T>Todos los derechos reservados.</T>
          </Text>
        </div>
      </div>
    </footer>
  );
}
