import { InfoContent, InfoContext } from "./types"

const es = (c: InfoContext): InfoContent => ({
  updated: "Última actualización: octubre de 2026",
  otherPages: "Más información",
  pages: {
    "envios-y-devoluciones": {
      title: "Envíos y devoluciones",
      description:
        "Opciones y precios de envío, recogida en la tienda de Rubí, entrega en el día y cómo devolver o cambiar un producto.",
      intro:
        "Preparamos cada pedido a mano en nuestra tienda de Rubí. Aquí tienes todo lo que necesitas saber sobre cómo te lo hacemos llegar y qué hacer si quieres devolverlo o cambiarlo.",
      sections: [
        {
          heading: "Opciones de envío",
          blocks: [
            {
              cards: {
                head: ["Opción", "Precio", "Plazo"],
                rows: [
                  [
                    "Envío estándar a toda España",
                    c.standard,
                    "2-4 días laborables",
                  ],
                  ["Envío urgente", c.express, "24-48 horas laborables"],
                  [
                    "Recogida en la tienda de Rubí",
                    "Gratis",
                    "Te avisamos en cuanto esté listo",
                  ],
                  [
                    "Entrega en el día en Rubí",
                    c.rubi,
                    `El mismo día, en pedidos hechos antes de las ${c.cutoff} de lunes a sábado`,
                  ],
                ],
              },
            },
            "Los gastos de envío se muestran siempre antes de confirmar el pedido, con el IVA incluido. Los plazos se cuentan en días laborables desde la confirmación del pedido y pueden alargarse en épocas de mucha demanda, como Navidad.",
          ],
        },
        {
          heading: "Recogida en tienda y entrega en Rubí",
          blocks: [
            `Si eliges la recogida en tienda, te avisaremos cuando tu pedido esté preparado. Puedes pasar a buscarlo por ${c.address}, de lunes a sábado de 9:30 a 13:30 y de 17:00 a 20:30.`,
            `Si vives en Rubí, te lo llevamos a casa el mismo día: los pedidos hechos antes de las ${c.cutoff} de lunes a sábado se entregan ese mismo día. Los que nos lleguen más tarde, o en domingo, los entregamos el siguiente día de reparto.`,
          ],
        },
        {
          heading: "Regalos y muestras",
          blocks: [
            "Envolvemos tus regalos gratis. Si tu pedido es un regalo, indícanoslo y lo preparamos con nuestro papel de regalo.",
            "Con cada pedido puedes elegir muestras gratuitas, según disponibilidad, para que descubras nuevos perfumes y tratamientos.",
          ],
        },
        {
          heading: "Si tu paquete llega dañado",
          blocks: [
            `Revisa el paquete al recibirlo. Si llega dañado, o falta o no es correcto algún producto, avísanos cuanto antes por teléfono (${c.phone}) o por correo electrónico (${c.email}) y lo solucionaremos sin coste para ti.`,
          ],
        },
        {
          heading: "Devoluciones",
          blocks: [
            `Tienes ${c.returnDays} días naturales desde que recibes el pedido para devolvernos cualquier producto sin abrir y con su precinto original, sin tener que darnos ninguna explicación.`,
            "Por motivos de higiene y protección de la salud, no podemos aceptar la devolución de perfumes, cosméticos o maquillaje que se hayan abierto o desprecintado después de la entrega, salvo que el producto sea defectuoso.",
            { h3: "Cómo hacer una devolución" },
            {
              ul: [
                `Avísanos por correo electrónico (${c.email}), por teléfono (${c.phone}) o en la tienda, indicando tu número de pedido y los productos que quieres devolver.`,
                `Tráenos el producto a la tienda de Rubí o envíanoslo a ${c.address} en un plazo de ${c.returnDays} días desde que nos lo comunicas.`,
                "Si lo devuelves por mensajería, el coste del envío de vuelta corre de tu cuenta, salvo que el producto sea defectuoso o te hayamos enviado uno equivocado.",
              ],
            },
            "Te devolveremos el importe del producto y los gastos de envío estándar en un máximo de 14 días desde que nos comunicas la devolución, con el mismo método de pago que utilizaste. Podemos esperar a recibir el producto, o a que nos envíes el justificante de envío, antes de hacer el reembolso.",
            "Tienes todos los detalles legales en nuestras [[condiciones-de-venta|condiciones de venta]].",
          ],
        },
        {
          heading: "Cambios",
          blocks: [
            "¿Te has equivocado de tono o de fragancia? Puedes cambiar gratis cualquier producto sin abrir en nuestra tienda de Rubí, dentro del mismo plazo de devolución. Te ayudaremos a encontrar el que mejor te va.",
          ],
        },
      ],
    },

    "preguntas-frecuentes": {
      title: "Preguntas frecuentes",
      description:
        "Respuestas rápidas sobre pedidos, envíos, pagos, devoluciones y nuestra tienda de Rubí.",
      intro:
        "Si no encuentras aquí lo que buscas, llámanos o pásate por la tienda: estaremos encantados de ayudarte.",
      sections: [
        {
          heading: "Pedidos",
          blocks: [
            { h3: "¿Necesito crear una cuenta para comprar?" },
            "No es necesario. Puedes comprar como invitado; con una cuenta, eso sí, podrás consultar tus pedidos y guardar tus direcciones.",
            { h3: "¿Cómo sé que mi pedido se ha realizado correctamente?" },
            "Al finalizar la compra verás la confirmación en pantalla y recibirás un correo electrónico con el resumen del pedido.",
            { h3: "¿Puedo modificar o cancelar un pedido?" },
            `Sí, si todavía no lo hemos enviado. Contacta con nosotros lo antes posible por teléfono (${c.phone}) o correo electrónico (${c.email}).`,
          ],
        },
        {
          heading: "Envíos",
          blocks: [
            { h3: "¿Cuánto cuesta el envío?" },
            `El envío estándar cuesta ${c.standard}. El urgente cuesta ${c.express}. Recoger el pedido en la tienda de Rubí es gratis.`,
            { h3: "¿Cuánto tarda en llegar?" },
            "El envío estándar tarda entre 2 y 4 días laborables y el urgente, entre 24 y 48 horas laborables.",
            { h3: "Vivo en Rubí, ¿me lo podéis traer hoy?" },
            `Sí. Si haces el pedido antes de las ${c.cutoff}, de lunes a sábado, te lo entregamos el mismo día por ${c.rubi}.`,
            { h3: "¿Enviáis fuera de España?" },
            "Enviamos a toda España, incluidas Baleares y Canarias. Para Canarias, Ceuta y Melilla el paquete pasa por aduana y puede tardar unos días más. Si vives en otro país, consúltanos antes de comprar.",
            "Tienes todos los detalles en [[envios-y-devoluciones|Envíos y devoluciones]].",
          ],
        },
        {
          heading: "Pagos",
          blocks: [
            { h3: "¿Qué formas de pago aceptáis?" },
            "Tarjeta de crédito o débito, Bizum, Apple Pay, Google Pay y Amazon Pay.",
            { h3: "¿Es seguro pagar en la web?" },
            "Sí. Los pagos se procesan a través de Stripe, una plataforma de pago certificada. Nosotros nunca vemos ni guardamos los datos de tu tarjeta.",
            { h3: "¿Los precios incluyen el IVA?" },
            "Sí, todos los precios incluyen el IVA. Los gastos de envío se muestran aparte antes de confirmar el pedido.",
            { h3: "¿Puedo pedir una factura?" },
            "Claro. Escríbenos con tu número de pedido y los datos de facturación y te la enviamos.",
          ],
        },
        {
          heading: "Productos y regalos",
          blocks: [
            { h3: "¿Los productos son originales?" },
            "Sí. Son los mismos productos que vendemos en nuestra perfumería de Rubí.",
            { h3: "¿Me podéis aconsejar?" },
            `Por supuesto, es lo que más nos gusta. Llámanos al ${c.phone} o ven a vernos a la tienda y te ayudaremos a elegir el perfume o el tratamiento ideal.`,
            { h3: "¿Puedo pedir muestras?" },
            "Sí, con cada pedido puedes elegir muestras gratuitas, según disponibilidad.",
            { h3: "¿Envolvéis para regalo?" },
            "Sí, y es gratis. Indícanos que es un regalo y lo preparamos con mucho cariño.",
          ],
        },
        {
          heading: "Devoluciones y cambios",
          blocks: [
            { h3: "¿Puedo devolver un producto?" },
            `Sí, dispones de ${c.returnDays} días desde que lo recibes para devolver productos sin abrir y con su precinto.`,
            { h3: "¿Y si ya lo he abierto?" },
            "Por motivos de higiene, los perfumes y cosméticos abiertos o desprecintados no se pueden devolver, salvo que sean defectuosos.",
            { h3: "¿Puedo cambiar un producto?" },
            "Sí, el cambio es gratis en nuestra tienda de Rubí, siempre que el producto esté sin abrir.",
          ],
        },
        {
          heading: "Nuestra tienda",
          blocks: [
            { h3: "¿Dónde estáis?" },
            `En ${c.address}. Abrimos de lunes a sábado de 9:30 a 13:30 y de 17:00 a 20:30; el domingo, cerrado.`,
            { h3: "¿Tenéis centro de estética?" },
            `Sí, además de perfumería somos centro de estética y formamos parte de Passion Beauté. Para pedir cita, llámanos al ${c.phone}.`,
          ],
        },
      ],
    },

    "condiciones-de-venta": {
      title: "Condiciones de venta",
      description:
        "Condiciones generales de compra en la tienda online de Perfumería Núria Vilalta: precios, pago, entrega, desistimiento y garantía.",
      intro:
        "Estas condiciones regulan las compras que hagas en nuestra tienda online. Te pedimos que las leas antes de hacer tu pedido: al confirmarlo, las aceptas.",
      sections: [
        {
          heading: "1. Quiénes somos",
          blocks: [
            `La tienda online la gestiona ${c.company} (${c.name}), con NIF ${c.nif} y domicilio en ${c.address}. Puedes contactar con nosotros por teléfono (${c.phone}) o por correo electrónico (${c.email}). Encontrarás el resto de nuestros datos en el [[aviso-legal|aviso legal]].`,
          ],
        },
        {
          heading: "2. Ámbito de aplicación",
          blocks: [
            "Estas condiciones se aplican a las compras realizadas en este sitio web por consumidores, principalmente con entrega en España. Para comprar debes ser mayor de edad.",
            "El contrato puede formalizarse en español, catalán o inglés, según el idioma que elijas en la web. Guardamos el documento electrónico de cada pedido; puedes consultarlo en tu cuenta, si tienes una, o pedirnos una copia.",
          ],
        },
        {
          heading: "3. Cómo hacer un pedido",
          blocks: [
            {
              ul: [
                "Añade los productos a la cesta.",
                "Indica tus datos de contacto y la dirección de entrega.",
                "Elige el método de envío y la forma de pago.",
                "Revisa el resumen y pulsa «Realizar pedido».",
              ],
            },
            "Antes de confirmar puedes revisar y corregir cualquier dato, cambiar las cantidades o eliminar productos de la cesta. Una vez hecho el pedido, recibirás un correo electrónico de confirmación con su resumen.",
            "Si un producto se agotara después de tu pedido, te avisaremos y te devolveremos su importe inmediatamente, o te propondremos una alternativa si lo prefieres.",
          ],
        },
        {
          heading: "4. Precios",
          blocks: [
            "Los precios se muestran en euros e incluyen el IVA. Los gastos de envío se indican por separado y siempre antes de que confirmes el pedido. Se aplica el precio vigente en el momento de hacer el pedido.",
            "Si detectamos un error evidente en el precio de un producto, te lo comunicaremos y podrás confirmar el pedido con el precio correcto o cancelarlo sin ningún coste.",
          ],
        },
        {
          heading: "5. Formas de pago",
          blocks: [
            "Puedes pagar con tarjeta de crédito o débito, Bizum, Apple Pay, Google Pay o Amazon Pay. Los pagos se procesan de forma segura a través de Stripe; nosotros no recibimos ni guardamos los datos de tu tarjeta. Tu banco puede pedirte que confirmes el pago (autenticación reforzada).",
            "El importe se carga cuando confirmas el pedido.",
          ],
        },
        {
          heading: "6. Envío y entrega",
          blocks: [
            {
              ul: [
                `Envío estándar: ${c.standard}. Entrega en 2-4 días laborables.`,
                `Envío urgente: ${c.express}. Entrega en 24-48 horas laborables.`,
                "Recogida en la tienda de Rubí: gratis.",
                `Entrega en el día en Rubí: ${c.rubi}, en pedidos hechos antes de las ${c.cutoff} de lunes a sábado.`,
              ],
            },
            "Los plazos son orientativos. En cualquier caso, entregaremos el pedido en un máximo de 30 días naturales; si no pudiéramos hacerlo, te avisaremos y podrás cancelarlo con el reembolso íntegro de lo pagado.",
            "Tienes más información en [[envios-y-devoluciones|Envíos y devoluciones]].",
          ],
        },
        {
          heading: "7. Derecho de desistimiento",
          blocks: [
            `Tienes derecho a desistir de tu compra en un plazo de ${c.returnDays} días naturales sin necesidad de justificación. El plazo empieza el día en que tú, o la persona que indiques, recibís los productos.`,
            `Para ejercerlo, comunícanos tu decisión de forma clara: por correo electrónico (${c.email}), por teléfono (${c.phone}), por carta a ${c.address} o en nuestra tienda. Puedes utilizar el modelo de formulario que encontrarás más abajo, aunque no es obligatorio. Basta con que nos lo comuniques antes de que termine el plazo.`,
            { h3: "Consecuencias del desistimiento" },
            "Te devolveremos todos los pagos recibidos, incluidos los gastos de envío estándar, en un máximo de 14 días naturales desde que nos comuniques tu decisión. Si elegiste un envío más caro que el estándar (por ejemplo, el urgente), no te devolveremos la diferencia. El reembolso se hará con el mismo método de pago que utilizaste, sin ningún coste para ti. Podemos retener el reembolso hasta haber recibido los productos o hasta que nos presentes el justificante de haberlos enviado.",
            `Debes devolvernos los productos en un plazo de ${c.returnDays} días naturales desde que nos comuniques el desistimiento, enviándolos a ${c.address} o trayéndolos a la tienda. Si los envías por mensajería, el coste directo de la devolución corre de tu cuenta. Solo serás responsable de la pérdida de valor de los productos si se debe a una manipulación distinta de la necesaria para comprobar su naturaleza y características.`,
            { h3: "Excepciones" },
            "Según el artículo 103 del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios, el derecho de desistimiento no se aplica a:",
            {
              ul: [
                "Productos precintados que no sean aptos para ser devueltos por razones de protección de la salud o de higiene y que se hayan desprecintado después de la entrega, como perfumes, cosméticos y maquillaje abiertos.",
                "Productos confeccionados según tus indicaciones o claramente personalizados.",
              ],
            },
            { h3: "Modelo de formulario de desistimiento" },
            {
              box: [
                `A la atención de ${c.company} (${c.name}), ${c.address}. Correo electrónico: ${c.email}.`,
                "Por la presente le comunico que desisto de mi contrato de venta de los siguientes bienes:",
                "Pedido el / recibido el:",
                "Nombre del consumidor:",
                "Dirección del consumidor:",
                "Firma del consumidor (solo si el formulario se presenta en papel):",
                "Fecha:",
              ],
            },
          ],
        },
        {
          heading: "8. Garantía",
          blocks: [
            "Todos los productos cuentan con la garantía legal de conformidad de tres años desde la entrega. Si un producto llega defectuoso o no se corresponde con lo que pediste, contacta con nosotros y te lo sustituiremos o te devolveremos su importe, sin coste para ti.",
            "Te agradecemos que nos avises cuanto antes si el paquete llega dañado. Ten en cuenta que los cosméticos tienen una fecha de caducidad o un periodo de uso una vez abiertos, indicados en el envase.",
          ],
        },
        {
          heading: "9. Atención al cliente y reclamaciones",
          blocks: [
            `Para cualquier duda, queja o reclamación puedes llamarnos al ${c.phone}, escribirnos a ${c.email} o visitarnos en ${c.address}. Te responderemos lo antes posible y, como máximo, en un mes.`,
            "Tenemos a tu disposición hojas oficiales de queja, reclamación y denuncia en la tienda, y también te las podemos enviar si nos las pides. Si no quedas satisfecho con nuestra respuesta, puedes dirigirte a la Oficina Municipal de Información al Consumidor (OMIC) de Rubí o a la [[https://consum.gencat.cat|Agència Catalana del Consum]].",
            `Arbitraje de consumo: ${c.arbitration}.`,
          ],
        },
        {
          heading: "10. Legislación aplicable",
          blocks: [
            "Estas condiciones se rigen por la legislación española y por la normativa catalana de consumo. Si eres consumidor, podrás acudir a los juzgados y tribunales de tu domicilio.",
          ],
        },
      ],
    },

    "aviso-legal": {
      title: "Aviso legal",
      description:
        "Datos identificativos del titular del sitio web de Perfumería Núria Vilalta y condiciones de uso.",
      sections: [
        {
          heading: "Datos del titular",
          blocks: [
            "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), te informamos de los datos del titular de este sitio web:",
            {
              ul: [
                `Titular: ${c.company}`,
                `Nombre comercial: ${c.name}`,
                `NIF: ${c.nif}`,
                `Domicilio: ${c.address}`,
                `Teléfono: ${c.phone}`,
                `Correo electrónico: ${c.email}`,
                `Datos registrales: ${c.registry}`,
              ],
            },
          ],
        },
        {
          heading: "Objeto del sitio web",
          blocks: [
            "Este sitio web ofrece información sobre nuestra perfumería y centro de estética de Rubí y permite comprar productos de perfumería y cosmética online. Las compras se rigen por nuestras [[condiciones-de-venta|condiciones de venta]].",
          ],
        },
        {
          heading: "Condiciones de uso",
          blocks: [
            "Al navegar por este sitio web te comprometes a hacer un uso adecuado de sus contenidos, de acuerdo con la ley, la buena fe y estas condiciones, y a no utilizarlo para actividades ilícitas o que puedan dañar el sitio web o a terceros.",
          ],
        },
        {
          heading: "Propiedad intelectual e industrial",
          blocks: [
            `Los textos, fotografías, diseño, logotipos y demás contenidos de este sitio web son propiedad de ${c.company} o de sus licenciantes y están protegidos por la normativa de propiedad intelectual e industrial. No se permite reproducirlos, distribuirlos ni transformarlos sin autorización.`,
            "Las marcas y los nombres de los productos que vendemos pertenecen a sus respectivos titulares y se utilizan únicamente para identificar esos productos.",
          ],
        },
        {
          heading: "Responsabilidad",
          blocks: [
            "Cuidamos que la información de la web sea correcta y esté actualizada, pero pueden producirse errores puntuales, que corregiremos en cuanto los detectemos. Los colores de los productos pueden variar ligeramente según la pantalla.",
            "No nos hacemos responsables de las interrupciones del servicio por causas ajenas a nosotros ni de los contenidos de los sitios web de terceros a los que enlazamos, como nuestras redes sociales.",
          ],
        },
        {
          heading: "Protección de datos y cookies",
          blocks: [
            "Te explicamos cómo tratamos tus datos en la [[privacidad|política de privacidad]] y qué cookies utilizamos en la [[cookies|política de cookies]].",
          ],
        },
        {
          heading: "Legislación y jurisdicción",
          blocks: [
            "Este aviso legal se rige por la legislación española. Si eres consumidor, podrás acudir a los juzgados y tribunales de tu domicilio; en los demás casos, las partes se someten a los juzgados y tribunales de Rubí.",
          ],
        },
      ],
    },

    privacidad: {
      title: "Política de privacidad",
      description:
        "Cómo trata Perfumería Núria Vilalta tus datos personales y cómo puedes ejercer tus derechos.",
      intro:
        "Tu confianza es importante para nosotros. Aquí te explicamos qué datos personales tratamos, para qué y cuáles son tus derechos, de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).",
      sections: [
        {
          heading: "Responsable del tratamiento",
          blocks: [
            {
              ul: [
                `Responsable: ${c.company} (${c.name})`,
                `NIF: ${c.nif}`,
                `Dirección: ${c.address}`,
                `Teléfono: ${c.phone}`,
                `Correo electrónico: ${c.email}`,
              ],
            },
          ],
        },
        {
          heading: "Qué datos tratamos",
          blocks: [
            {
              ul: [
                "Datos de identificación y contacto: nombre, apellidos, correo electrónico, teléfono y direcciones de entrega y facturación.",
                "Datos de tus pedidos: productos comprados, importes, método de envío e historial de compras.",
                "Datos de tu cuenta, si la creas: correo electrónico y contraseña, que se guarda cifrada.",
                "Las comunicaciones que mantengas con nosotros.",
              ],
            },
            "No recibimos ni guardamos los datos de tu tarjeta: los trata directamente nuestro proveedor de pagos, Stripe.",
          ],
        },
        {
          heading: "Para qué los usamos y con qué base legal",
          blocks: [
            {
              ul: [
                "Gestionar tus pedidos, pagos, envíos, devoluciones y cambios. Base legal: la ejecución del contrato de compraventa.",
                "Gestionar tu cuenta de cliente, si decides crearla. Base legal: la ejecución del contrato y tu solicitud.",
                "Responder a tus consultas. Base legal: tu solicitud y, en su caso, la aplicación de medidas precontractuales.",
                "Cumplir nuestras obligaciones fiscales y contables, como la facturación. Base legal: el cumplimiento de obligaciones legales.",
                "Prevenir el fraude en los pagos. Base legal: nuestro interés legítimo en proteger a nuestros clientes y a nuestro negocio.",
                "Enviarte novedades y ofertas, solo si nos das tu consentimiento. Podrás retirarlo en cualquier momento.",
              ],
            },
            "Los datos que te pedimos en el proceso de compra son necesarios para gestionar tu pedido; si no nos los facilitas, no podremos atenderlo.",
          ],
        },
        {
          heading: "Cuánto tiempo los conservamos",
          blocks: [
            "Conservamos tus datos mientras dure nuestra relación y, después, durante los plazos que exige la ley: por ejemplo, seis años para la documentación contable y las facturas, y el tiempo necesario para atender posibles reclamaciones o responsabilidades. Los datos de tu cuenta se conservan hasta que nos pidas eliminarla.",
          ],
        },
        {
          heading: "A quién se comunican",
          blocks: [
            "No vendemos tus datos ni los cedemos a terceros, salvo obligación legal (por ejemplo, a la Agencia Tributaria). Para prestarte el servicio contamos con proveedores que tratan datos en nuestro nombre, con contratos que garantizan su confidencialidad y seguridad:",
            {
              ul: [
                "Stripe, para procesar los pagos.",
                "Las empresas de mensajería que entregan tu pedido.",
                "Los proveedores de alojamiento web, correo electrónico y servicios informáticos.",
              ],
            },
            "Si pagas con Apple Pay, Google Pay o Amazon Pay, estos proveedores tratan también tus datos según sus propias políticas de privacidad.",
          ],
        },
        {
          heading: "Transferencias internacionales",
          blocks: [
            "Algunos de nuestros proveedores, como Stripe, pueden tratar datos fuera del Espacio Económico Europeo. En esos casos lo hacen con las garantías que exige el RGPD, como decisiones de adecuación de la Comisión Europea o cláusulas contractuales tipo.",
          ],
        },
        {
          heading: "Tus derechos",
          blocks: [
            "Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, así como retirar el consentimiento que nos hayas dado.",
            `Para ello, escríbenos a ${c.email} o envíanos una carta a ${c.address}, indicando qué derecho quieres ejercer. Si tenemos dudas razonables sobre tu identidad, podremos pedirte información adicional para confirmarla. Te responderemos en el plazo de un mes.`,
            "Si consideras que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la [[https://www.aepd.es|Agencia Española de Protección de Datos]].",
          ],
        },
        {
          heading: "Menores de edad",
          blocks: [
            "Nuestra tienda online no se dirige a menores de 14 años y no tratamos conscientemente sus datos. Para comprar debes ser mayor de edad.",
          ],
        },
        {
          heading: "Seguridad y cambios en esta política",
          blocks: [
            "Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos. Si modificamos esta política, publicaremos la nueva versión en esta página.",
          ],
        },
      ],
    },

    cookies: {
      title: "Política de cookies",
      description:
        "Qué cookies utiliza la web de Perfumería Núria Vilalta y para qué sirven.",
      intro:
        "Las cookies son pequeños archivos que una web guarda en tu navegador para recordar información entre visitas o entre una página y otra.",
      sections: [
        {
          heading: "Solo usamos cookies técnicas",
          blocks: [
            "Nuestra web utiliza únicamente cookies técnicas, imprescindibles para que funcione: recordar tu idioma, guardar tu cesta, mantener tu sesión iniciada y procesar el pago de forma segura. No utilizamos cookies de análisis, de publicidad ni de seguimiento.",
            "Según el artículo 22.2 de la LSSI-CE, estas cookies no requieren tu consentimiento, por eso no te mostramos un aviso para aceptarlas.",
          ],
        },
        {
          heading: "Cookies que utilizamos",
          blocks: [
            {
              cards: {
                head: ["Cookie", "Para qué sirve", "Duración", "Titular"],
                rows: [
                  ["_medusa_locale", "Recordar el idioma que has elegido", "1 año", "Propia"],
                  ["_medusa_cart_id", "Guardar los productos de tu cesta", "7 días", "Propia"],
                  ["_medusa_jwt", "Mantener tu sesión iniciada en tu cuenta", "7 días", "Propia"],
                  [
                    "_medusa_pending_customer",
                    "Conservar tus datos de registro mientras verificas tu correo electrónico",
                    "24 horas",
                    "Propia",
                  ],
                  [
                    "_medusa_cache_id",
                    "Mostrarte la información actualizada del catálogo",
                    "24 horas",
                    "Propia",
                  ],
                  [
                    "__stripe_mid, __stripe_sid",
                    "Procesar el pago de forma segura y prevenir el fraude (solo en el proceso de pago)",
                    "1 año y 30 minutos",
                    "Stripe",
                  ],
                ],
              },
            },
          ],
        },
        {
          heading: "Enlaces a otras webs",
          blocks: [
            "Nuestra web enlaza con nuestros perfiles de Instagram y Facebook y con Google Maps, pero no los inserta en sus páginas. Si los visitas, esos servicios pueden utilizar sus propias cookies según sus políticas.",
          ],
        },
        {
          heading: "Cómo gestionar las cookies",
          blocks: [
            "Puedes ver y eliminar las cookies desde la configuración de tu navegador. Ten en cuenta que, si bloqueas las cookies técnicas, algunas funciones de la web, como la cesta o el pago, dejarán de funcionar.",
          ],
        },
        {
          heading: "Cambios en esta política",
          blocks: [
            "Si en el futuro utilizamos otro tipo de cookies, como las de análisis, actualizaremos esta política y te pediremos tu consentimiento antes de instalarlas.",
            "Tienes más información sobre el tratamiento de tus datos en nuestra [[privacidad|política de privacidad]].",
          ],
        },
      ],
    },
  },
})

export default es
