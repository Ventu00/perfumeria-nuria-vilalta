import { InfoContent, InfoContext } from "./types"

const ca = (c: InfoContext): InfoContent => ({
  updated: "Darrera actualització: octubre de 2026",
  otherPages: "Més informació",
  pages: {
    "envios-y-devoluciones": {
      title: "Enviaments i devolucions",
      description:
        "Opcions i preus d'enviament, recollida a la botiga de Rubí, lliurament el mateix dia i com retornar o canviar un producte.",
      intro:
        "Preparem cada comanda a mà a la nostra botiga de Rubí. Aquí trobaràs tot el que cal saber sobre com te la fem arribar i què has de fer si la vols retornar o canviar.",
      sections: [
        {
          heading: "Opcions d'enviament",
          blocks: [
            {
              cards: {
                head: ["Opció", "Preu", "Termini"],
                rows: [
                  [
                    "Enviament estàndard a tot Espanya",
                    c.standard,
                    "2-4 dies laborables",
                  ],
                  ["Enviament urgent", c.express, "24-48 hores laborables"],
                  [
                    "Recollida a la botiga de Rubí",
                    "Gratis",
                    "T'avisem tan bon punt estigui a punt",
                  ],
                  [
                    "Lliurament el mateix dia a Rubí",
                    c.rubi,
                    `El mateix dia, en comandes fetes abans de les ${c.cutoff}, de dilluns a dissabte`,
                  ],
                ],
              },
            },
            "Les despeses d'enviament sempre es mostren abans de confirmar la comanda, amb l'IVA inclòs. Els terminis es compten en dies laborables des de la confirmació de la comanda i es poden allargar en èpoques de molta feina, com ara Nadal.",
          ],
        },
        {
          heading: "Recollida a la botiga i lliurament a Rubí",
          blocks: [
            `Si tries la recollida a la botiga, t'avisarem quan la comanda estigui preparada. Pots passar a buscar-la a ${c.address}, de dilluns a dissabte de 9.30 a 13.30 i de 17.00 a 20.30.`,
            `Si vius a Rubí, te la portem a casa el mateix dia: les comandes fetes abans de les ${c.cutoff}, de dilluns a dissabte, es lliuren aquell mateix dia. Les que ens arribin més tard, o en diumenge, les lliurem el següent dia de repartiment.`,
          ],
        },
        {
          heading: "Regals i mostres",
          blocks: [
            "T'emboliquem els regals gratis. Si la comanda és per regalar, digues-nos-ho i la preparem amb el nostre paper de regal.",
            "Amb cada comanda pots triar mostres gratuïtes, segons disponibilitat, per descobrir nous perfums i tractaments.",
          ],
        },
        {
          heading: "Si el paquet arriba malmès",
          blocks: [
            `Revisa el paquet quan el rebis. Si arriba malmès, o hi falta algun producte o no és el correcte, avisa'ns com més aviat millor per telèfon (${c.phone}) o per correu electrònic (${c.email}) i ho solucionarem sense cap cost per a tu.`,
          ],
        },
        {
          heading: "Devolucions",
          blocks: [
            `Tens ${c.returnDays} dies naturals des que reps la comanda per retornar-nos qualsevol producte sense obrir i amb el precinte original, sense haver de donar-nos cap explicació.`,
            "Per motius d'higiene i de protecció de la salut, no podem acceptar la devolució de perfums, cosmètics o maquillatge que s'hagin obert o desprecintat després del lliurament, tret que el producte sigui defectuós.",
            { h3: "Com fer una devolució" },
            {
              ul: [
                `Avisa'ns per correu electrònic (${c.email}), per telèfon (${c.phone}) o a la botiga, i indica'ns el número de comanda i els productes que vols retornar.`,
                `Porta'ns el producte a la botiga de Rubí o envia'ns-el a ${c.address} en un termini de ${c.returnDays} dies des que ens ho comuniques.`,
                "Si el retornes per missatgeria, el cost de l'enviament de tornada va a càrrec teu, tret que el producte sigui defectuós o te n'hàgim enviat un d'equivocat.",
              ],
            },
            "Et retornarem l'import del producte i les despeses d'enviament estàndard en un màxim de 14 dies des que ens comuniques la devolució, amb el mateix mètode de pagament que vas fer servir. Podem esperar a rebre el producte, o que ens enviïs el justificant d'enviament, abans de fer el reemborsament.",
            "Trobaràs tots els detalls legals a les nostres [[condiciones-de-venta|condicions de venda]].",
          ],
        },
        {
          heading: "Canvis",
          blocks: [
            "T'has equivocat de to o de fragància? Pots canviar gratis qualsevol producte sense obrir a la nostra botiga de Rubí, dins del mateix termini de devolució. T'ajudarem a trobar el que et va millor.",
          ],
        },
      ],
    },

    "preguntas-frecuentes": {
      title: "Preguntes freqüents",
      description:
        "Respostes ràpides sobre comandes, enviaments, pagaments, devolucions i la nostra botiga de Rubí.",
      intro:
        "Si no hi trobes el que busques, truca'ns o passa per la botiga: t'ajudarem encantats.",
      sections: [
        {
          heading: "Comandes",
          blocks: [
            { h3: "Cal crear un compte per comprar?" },
            "No cal. Pots comprar com a convidat; això sí, amb un compte podràs consultar les teves comandes i desar les teves adreces.",
            { h3: "Com sé que la comanda s'ha fet correctament?" },
            "En acabar la compra veuràs la confirmació a la pantalla i rebràs un correu electrònic amb el resum de la comanda.",
            { h3: "Puc modificar o cancel·lar una comanda?" },
            `Sí, si encara no l'hem enviada. Posa't en contacte amb nosaltres com més aviat millor per telèfon (${c.phone}) o per correu electrònic (${c.email}).`,
          ],
        },
        {
          heading: "Enviaments",
          blocks: [
            { h3: "Quant costa l'enviament?" },
            `L'enviament estàndard costa ${c.standard}. L'urgent costa ${c.express}. Recollir la comanda a la botiga de Rubí és gratis.`,
            { h3: "Quant triga a arribar?" },
            "L'enviament estàndard triga entre 2 i 4 dies laborables, i l'urgent, entre 24 i 48 hores laborables.",
            { h3: "Visc a Rubí: me la podeu portar avui?" },
            `Sí. Si fas la comanda abans de les ${c.cutoff}, de dilluns a dissabte, te la portem el mateix dia per ${c.rubi}.`,
            { h3: "Envieu fora d'Espanya?" },
            "Enviem a tot Espanya, incloses les Balears i les Canàries. A les Canàries, Ceuta i Melilla el paquet passa per duana i pot trigar uns dies més. Si vius en un altre país, consulta'ns abans de comprar.",
            "Trobaràs tots els detalls a [[envios-y-devoluciones|Enviaments i devolucions]].",
          ],
        },
        {
          heading: "Pagaments",
          blocks: [
            { h3: "Quines formes de pagament accepteu?" },
            "Targeta de crèdit o de dèbit, Bizum, Apple Pay, Google Pay i Amazon Pay.",
            { h3: "És segur pagar al web?" },
            "Sí. Els pagaments es processen a través de Stripe, una plataforma de pagament certificada. Nosaltres no veiem ni desem mai les dades de la teva targeta.",
            { h3: "Els preus inclouen l'IVA?" },
            "Sí, tots els preus inclouen l'IVA. Les despeses d'enviament es mostren a part abans de confirmar la comanda.",
            { h3: "Puc demanar una factura?" },
            "És clar. Escriu-nos amb el número de comanda i les dades de facturació i te l'enviarem.",
          ],
        },
        {
          heading: "Productes i regals",
          blocks: [
            { h3: "Els productes són originals?" },
            "Sí. Són els mateixos productes que venem a la nostra perfumeria de Rubí.",
            { h3: "Em podeu aconsellar?" },
            `I tant, és el que més ens agrada. Truca'ns al ${c.phone} o vine a veure'ns a la botiga i t'ajudarem a triar el perfum o el tractament ideal.`,
            { h3: "Puc demanar mostres?" },
            "Sí, amb cada comanda pots triar mostres gratuïtes, segons disponibilitat.",
            { h3: "Emboliqueu per a regal?" },
            "Sí, i és gratis. Digues-nos que és un regal i el prepararem amb molta cura.",
          ],
        },
        {
          heading: "Devolucions i canvis",
          blocks: [
            { h3: "Puc retornar un producte?" },
            `Sí, tens ${c.returnDays} dies des que el reps per retornar productes sense obrir i amb el precinte.`,
            { h3: "I si ja l'he obert?" },
            "Per motius d'higiene, els perfums i cosmètics oberts o desprecintats no es poden retornar, tret que siguin defectuosos.",
            { h3: "Puc canviar un producte?" },
            "Sí, el canvi és gratis a la nostra botiga de Rubí, sempre que el producte estigui sense obrir.",
          ],
        },
        {
          heading: "La nostra botiga",
          blocks: [
            { h3: "On sou?" },
            `A ${c.address}. Obrim de dilluns a dissabte de 9.30 a 13.30 i de 17.00 a 20.30; diumenge, tancat.`,
            { h3: "Teniu centre d'estètica?" },
            `Sí, a més de perfumeria som centre d'estètica i formem part de Passion Beauté. Per demanar hora, truca'ns al ${c.phone}.`,
          ],
        },
      ],
    },

    "condiciones-de-venta": {
      title: "Condicions de venda",
      description:
        "Condicions generals de compra a la botiga en línia de Perfumeria Núria Vilalta: preus, pagament, lliurament, desistiment i garantia.",
      intro:
        "Aquestes condicions regulen les compres que facis a la nostra botiga en línia. Et demanem que les llegeixis abans de fer la comanda: en confirmar-la, les acceptes.",
      sections: [
        {
          heading: "1. Qui som",
          blocks: [
            `La botiga en línia la gestiona ${c.company} (${c.name}), amb NIF ${c.nif} i domicili a ${c.address}. Pots contactar amb nosaltres per telèfon (${c.phone}) o per correu electrònic (${c.email}). Trobaràs la resta de dades a l'[[aviso-legal|avís legal]].`,
          ],
        },
        {
          heading: "2. Àmbit d'aplicació",
          blocks: [
            "Aquestes condicions s'apliquen a les compres que fan els consumidors en aquest lloc web, principalment amb lliurament a Espanya. Per comprar has de ser major d'edat.",
            "El contracte es pot formalitzar en català, castellà o anglès, segons l'idioma que triïs al web. Conservem el document electrònic de cada comanda; el pots consultar al teu compte, si en tens, o demanar-nos-en una còpia.",
          ],
        },
        {
          heading: "3. Com fer una comanda",
          blocks: [
            {
              ul: [
                "Afegeix els productes a la cistella.",
                "Indica les teves dades de contacte i l'adreça de lliurament.",
                "Tria el mètode d'enviament i la forma de pagament.",
                "Revisa el resum i prem «Fer la comanda».",
              ],
            },
            "Abans de confirmar-la pots revisar i corregir qualsevol dada, canviar les quantitats o treure productes de la cistella. Un cop feta la comanda, rebràs un correu electrònic de confirmació amb el resum.",
            "Si un producte s'esgotés després de la teva comanda, t'avisaríem i et retornaríem l'import immediatament, o et proposaríem una alternativa si ho prefereixes.",
          ],
        },
        {
          heading: "4. Preus",
          blocks: [
            "Els preus es mostren en euros i inclouen l'IVA. Les despeses d'enviament s'indiquen per separat i sempre abans que confirmis la comanda. S'aplica el preu vigent en el moment de fer la comanda.",
            "Si detectem un error evident en el preu d'un producte, t'ho comunicarem i podràs confirmar la comanda amb el preu correcte o cancel·lar-la sense cap cost.",
          ],
        },
        {
          heading: "5. Formes de pagament",
          blocks: [
            "Pots pagar amb targeta de crèdit o de dèbit, Bizum, Apple Pay, Google Pay o Amazon Pay. Els pagaments es processen de manera segura a través de Stripe; nosaltres no rebem ni desem les dades de la teva targeta. El teu banc et pot demanar que confirmis el pagament (autenticació reforçada).",
            "L'import es carrega quan confirmes la comanda.",
          ],
        },
        {
          heading: "6. Enviament i lliurament",
          blocks: [
            {
              ul: [
                `Enviament estàndard: ${c.standard}. Lliurament en 2-4 dies laborables.`,
                `Enviament urgent: ${c.express}. Lliurament en 24-48 hores laborables.`,
                "Recollida a la botiga de Rubí: gratis.",
                `Lliurament el mateix dia a Rubí: ${c.rubi}, per a comandes fetes abans de les ${c.cutoff}, de dilluns a dissabte.`,
              ],
            },
            "Els terminis són orientatius. En tot cas, lliurarem la comanda en un màxim de 30 dies naturals; si no ho poguéssim fer, t'avisaríem i la podries cancel·lar amb el reemborsament íntegre del que has pagat.",
            "Trobaràs més informació a [[envios-y-devoluciones|Enviaments i devolucions]].",
          ],
        },
        {
          heading: "7. Dret de desistiment",
          blocks: [
            `Tens dret a desistir de la compra en un termini de ${c.returnDays} dies naturals sense haver-ho de justificar. El termini comença el dia que tu, o la persona que indiquis, rebeu els productes.`,
            `Per exercir-lo, comunica'ns la teva decisió de manera clara: per correu electrònic (${c.email}), per telèfon (${c.phone}), per carta a ${c.address} o a la nostra botiga. Pots fer servir el model de formulari que trobaràs més avall, tot i que no és obligatori. N'hi ha prou que ens ho comuniquis abans que acabi el termini.`,
            { h3: "Conseqüències del desistiment" },
            "Et retornarem tots els pagaments rebuts, incloses les despeses d'enviament estàndard, en un màxim de 14 dies naturals des que ens comuniquis la decisió. Si vas triar un enviament més car que l'estàndard (per exemple, l'urgent), no et retornarem la diferència. El reemborsament es farà amb el mateix mètode de pagament que vas fer servir, sense cap cost per a tu. Podem retenir el reemborsament fins que haguem rebut els productes o fins que ens presentis el justificant d'haver-los enviat.",
            `Has de retornar-nos els productes en un termini de ${c.returnDays} dies naturals des que ens comuniquis el desistiment, enviant-los a ${c.address} o portant-los a la botiga. Si els envies per missatgeria, el cost directe de la devolució va a càrrec teu. Només seràs responsable de la pèrdua de valor dels productes si es deu a una manipulació diferent de la necessària per comprovar-ne la naturalesa i les característiques.`,
            { h3: "Excepcions" },
            "D'acord amb l'article 103 del text refós de la Llei general per a la defensa dels consumidors i usuaris, el dret de desistiment no s'aplica a:",
            {
              ul: [
                "Productes precintats que no es poden retornar per raons de protecció de la salut o d'higiene i que s'han desprecintat després del lliurament, com ara perfums, cosmètics i maquillatge oberts.",
                "Productes fets segons les teves indicacions o clarament personalitzats.",
              ],
            },
            { h3: "Model de formulari de desistiment" },
            {
              box: [
                `A l'atenció de ${c.company} (${c.name}), ${c.address}. Correu electrònic: ${c.email}.`,
                "Per la present us comunico que desisteixo del meu contracte de venda dels béns següents:",
                "Demanat el / rebut el:",
                "Nom del consumidor:",
                "Adreça del consumidor:",
                "Signatura del consumidor (només si el formulari es presenta en paper):",
                "Data:",
              ],
            },
          ],
        },
        {
          heading: "8. Garantia",
          blocks: [
            "Tots els productes tenen la garantia legal de conformitat de tres anys des del lliurament. Si un producte arriba defectuós o no es correspon amb el que vas demanar, posa't en contacte amb nosaltres i te'l substituirem o te'n retornarem l'import, sense cap cost per a tu.",
            "T'agrairem que ens avisis com més aviat millor si el paquet arriba malmès. Tingues en compte que els cosmètics tenen una data de caducitat o un període d'ús un cop oberts, indicats a l'envàs.",
          ],
        },
        {
          heading: "9. Atenció al client i reclamacions",
          blocks: [
            `Per a qualsevol dubte, queixa o reclamació, pots trucar-nos al ${c.phone}, escriure'ns a ${c.email} o visitar-nos a ${c.address}. Et respondrem al més aviat possible i, com a màxim, en un mes.`,
            "Tenim a la teva disposició fulls oficials de queixa, reclamació i denúncia a la botiga, i també te'ls podem enviar si ens els demanes. Si no quedes satisfet amb la nostra resposta, pots adreçar-te a l'Oficina Municipal d'Informació al Consumidor (OMIC) de Rubí o a l'[[https://consum.gencat.cat|Agència Catalana del Consum]].",
            `Arbitratge de consum: ${c.arbitration}.`,
          ],
        },
        {
          heading: "10. Legislació aplicable",
          blocks: [
            "Aquestes condicions es regeixen per la legislació espanyola i per la normativa catalana de consum. Si ets consumidor, pots adreçar-te als jutjats i tribunals del teu domicili.",
          ],
        },
      ],
    },

    "aviso-legal": {
      title: "Avís legal",
      description:
        "Dades identificatives del titular del lloc web de Perfumeria Núria Vilalta i condicions d'ús.",
      sections: [
        {
          heading: "Dades del titular",
          blocks: [
            "En compliment de l'article 10 de la Llei 34/2002, d'11 de juliol, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE), t'informem de les dades del titular d'aquest lloc web:",
            {
              ul: [
                `Titular: ${c.company}`,
                `Nom comercial: ${c.name}`,
                `NIF: ${c.nif}`,
                `Domicili: ${c.address}`,
                `Telèfon: ${c.phone}`,
                `Correu electrònic: ${c.email}`,
                `Dades registrals: ${c.registry}`,
              ],
            },
          ],
        },
        {
          heading: "Objecte del lloc web",
          blocks: [
            "Aquest lloc web ofereix informació sobre la nostra perfumeria i centre d'estètica de Rubí i permet comprar productes de perfumeria i cosmètica en línia. Les compres es regeixen per les nostres [[condiciones-de-venta|condicions de venda]].",
          ],
        },
        {
          heading: "Condicions d'ús",
          blocks: [
            "En navegar per aquest lloc web et comprometes a fer un ús adequat dels continguts, d'acord amb la llei, la bona fe i aquestes condicions, i a no utilitzar-lo per a activitats il·lícites o que puguin perjudicar el lloc web o terceres persones.",
          ],
        },
        {
          heading: "Propietat intel·lectual i industrial",
          blocks: [
            `Els textos, fotografies, disseny, logotips i la resta de continguts d'aquest lloc web són propietat de ${c.company} o dels seus llicenciants i estan protegits per la normativa de propietat intel·lectual i industrial. No es permet reproduir-los, distribuir-los ni transformar-los sense autorització.`,
            "Les marques i els noms dels productes que venem pertanyen als seus titulars respectius i només s'utilitzen per identificar aquests productes.",
          ],
        },
        {
          heading: "Responsabilitat",
          blocks: [
            "Vetllem perquè la informació del web sigui correcta i estigui actualitzada, però es poden produir errors puntuals, que corregirem tan bon punt els detectem. Els colors dels productes poden variar lleugerament segons la pantalla.",
            "No ens fem responsables de les interrupcions del servei per causes alienes a nosaltres ni dels continguts dels llocs web de tercers que enllacem, com ara les nostres xarxes socials.",
          ],
        },
        {
          heading: "Protecció de dades i galetes",
          blocks: [
            "T'expliquem com tractem les teves dades a la [[privacidad|política de privacitat]] i quines galetes fem servir a la [[cookies|política de galetes]].",
          ],
        },
        {
          heading: "Legislació i jurisdicció",
          blocks: [
            "Aquest avís legal es regeix per la legislació espanyola. Si ets consumidor, pots adreçar-te als jutjats i tribunals del teu domicili; en els altres casos, les parts se sotmeten als jutjats i tribunals de Rubí.",
          ],
        },
      ],
    },

    privacidad: {
      title: "Política de privacitat",
      description:
        "Com tracta Perfumeria Núria Vilalta les teves dades personals i com pots exercir els teus drets.",
      intro:
        "La teva confiança és important per a nosaltres. Aquí t'expliquem quines dades personals tractem, per a què i quins drets tens, d'acord amb el Reglament general de protecció de dades (RGPD) i la Llei orgànica 3/2018 de protecció de dades personals i garantia dels drets digitals (LOPDGDD).",
      sections: [
        {
          heading: "Responsable del tractament",
          blocks: [
            {
              ul: [
                `Responsable: ${c.company} (${c.name})`,
                `NIF: ${c.nif}`,
                `Adreça: ${c.address}`,
                `Telèfon: ${c.phone}`,
                `Correu electrònic: ${c.email}`,
              ],
            },
          ],
        },
        {
          heading: "Quines dades tractem",
          blocks: [
            {
              ul: [
                "Dades d'identificació i de contacte: nom, cognoms, correu electrònic, telèfon i adreces de lliurament i de facturació.",
                "Dades de les teves comandes: productes comprats, imports, mètode d'enviament i historial de compres.",
                "Dades del teu compte, si en crees un: correu electrònic i contrasenya, que es desa xifrada.",
                "Les comunicacions que mantinguis amb nosaltres.",
              ],
            },
            "No rebem ni desem les dades de la teva targeta: les tracta directament el nostre proveïdor de pagaments, Stripe.",
          ],
        },
        {
          heading: "Per a què les fem servir i amb quina base legal",
          blocks: [
            {
              ul: [
                "Gestionar les teves comandes, pagaments, enviaments, devolucions i canvis. Base legal: l'execució del contracte de compravenda.",
                "Gestionar el teu compte de client, si decideixes crear-lo. Base legal: l'execució del contracte i la teva sol·licitud.",
                "Respondre les teves consultes. Base legal: la teva sol·licitud i, si escau, l'aplicació de mesures precontractuals.",
                "Complir les nostres obligacions fiscals i comptables, com ara la facturació. Base legal: el compliment d'obligacions legals.",
                "Prevenir el frau en els pagaments. Base legal: el nostre interès legítim a protegir els nostres clients i el nostre negoci.",
                "Enviar-te novetats i ofertes, només si ens dones el teu consentiment. El pots retirar en qualsevol moment.",
              ],
            },
            "Les dades que et demanem en el procés de compra són necessàries per gestionar la comanda; si no ens les facilites, no la podrem atendre.",
          ],
        },
        {
          heading: "Quant de temps les conservem",
          blocks: [
            "Conservem les teves dades mentre duri la nostra relació i, després, durant els terminis que exigeix la llei: per exemple, sis anys per a la documentació comptable i les factures, i el temps necessari per atendre possibles reclamacions o responsabilitats. Les dades del teu compte es conserven fins que ens demanis eliminar-lo.",
          ],
        },
        {
          heading: "A qui es comuniquen",
          blocks: [
            "No venem les teves dades ni les cedim a tercers, tret que hi hagi una obligació legal (per exemple, davant l'Agència Tributària). Per prestar-te el servei comptem amb proveïdors que tracten dades en nom nostre, amb contractes que en garanteixen la confidencialitat i la seguretat:",
            {
              ul: [
                "Stripe, per processar els pagaments.",
                "Les empreses de missatgeria que lliuren la teva comanda.",
                "Els proveïdors d'allotjament web, correu electrònic i serveis informàtics.",
              ],
            },
            "Si pagues amb Apple Pay, Google Pay o Amazon Pay, aquests proveïdors també tracten les teves dades d'acord amb les seves pròpies polítiques de privacitat.",
          ],
        },
        {
          heading: "Transferències internacionals",
          blocks: [
            "Alguns dels nostres proveïdors, com ara Stripe, poden tractar dades fora de l'Espai Econòmic Europeu. En aquests casos ho fan amb les garanties que exigeix l'RGPD, com ara decisions d'adequació de la Comissió Europea o clàusules contractuals tipus.",
          ],
        },
        {
          heading: "Els teus drets",
          blocks: [
            "Pots exercir en qualsevol moment els teus drets d'accés, rectificació, supressió, oposició, limitació del tractament i portabilitat, així com retirar el consentiment que ens hagis donat.",
            `Per fer-ho, escriu-nos a ${c.email} o envia'ns una carta a ${c.address}, indicant quin dret vols exercir. Si tenim dubtes raonables sobre la teva identitat, et podrem demanar informació addicional per confirmar-la. Et respondrem en el termini d'un mes.`,
            "Si consideres que no hem tractat correctament les teves dades, pots presentar una reclamació davant l'[[https://www.aepd.es|Agència Espanyola de Protecció de Dades]].",
          ],
        },
        {
          heading: "Menors d'edat",
          blocks: [
            "La nostra botiga en línia no s'adreça a menors de 14 anys i no en tractem conscientment les dades. Per comprar has de ser major d'edat.",
          ],
        },
        {
          heading: "Seguretat i canvis en aquesta política",
          blocks: [
            "Apliquem mesures tècniques i organitzatives adequades per protegir les teves dades. Si modifiquem aquesta política, publicarem la nova versió en aquesta pàgina.",
          ],
        },
      ],
    },

    cookies: {
      title: "Política de galetes",
      description:
        "Quines galetes (cookies) fa servir el web de Perfumeria Núria Vilalta i per a què serveixen.",
      intro:
        "Les galetes (cookies) són petits fitxers que un web desa al teu navegador per recordar informació entre visites o d'una pàgina a una altra.",
      sections: [
        {
          heading: "Només fem servir galetes tècniques",
          blocks: [
            "El nostre web només utilitza galetes tècniques, imprescindibles perquè funcioni: recordar el teu idioma, desar la cistella, mantenir la sessió iniciada i processar el pagament de manera segura. No fem servir galetes d'anàlisi, de publicitat ni de seguiment.",
            "D'acord amb l'article 22.2 de la LSSI-CE, aquestes galetes no requereixen el teu consentiment, i per això no et mostrem cap avís per acceptar-les.",
          ],
        },
        {
          heading: "Galetes que fem servir",
          blocks: [
            {
              cards: {
                head: ["Galeta", "Per a què serveix", "Durada", "Titular"],
                rows: [
                  ["_medusa_locale", "Recordar l'idioma que has triat", "1 any", "Pròpia"],
                  ["_medusa_cart_id", "Desar els productes de la cistella", "7 dies", "Pròpia"],
                  ["_medusa_jwt", "Mantenir la sessió iniciada al teu compte", "7 dies", "Pròpia"],
                  [
                    "_medusa_pending_customer",
                    "Conservar les dades de registre mentre verifiques el correu electrònic",
                    "24 hores",
                    "Pròpia",
                  ],
                  [
                    "_medusa_cache_id",
                    "Mostrar-te la informació actualitzada del catàleg",
                    "24 hores",
                    "Pròpia",
                  ],
                  [
                    "__stripe_mid, __stripe_sid",
                    "Processar el pagament de manera segura i prevenir el frau (només durant el pagament)",
                    "1 any i 30 minuts",
                    "Stripe",
                  ],
                ],
              },
            },
          ],
        },
        {
          heading: "Enllaços a altres webs",
          blocks: [
            "El nostre web enllaça amb els nostres perfils d'Instagram i Facebook i amb Google Maps, però no els insereix a les seves pàgines. Si els visites, aquests serveis poden fer servir les seves pròpies galetes d'acord amb les seves polítiques.",
          ],
        },
        {
          heading: "Com gestionar les galetes",
          blocks: [
            "Pots veure i esborrar les galetes des de la configuració del navegador. Tingues en compte que, si bloqueges les galetes tècniques, algunes funcions del web, com ara la cistella o el pagament, deixaran de funcionar.",
          ],
        },
        {
          heading: "Canvis en aquesta política",
          blocks: [
            "Si en el futur fem servir altres tipus de galetes, com ara les d'anàlisi, actualitzarem aquesta política i et demanarem el consentiment abans d'instal·lar-les.",
            "Trobaràs més informació sobre el tractament de les teves dades a la nostra [[privacidad|política de privacitat]].",
          ],
        },
      ],
    },
  },
})

export default ca
