import { InfoContent, InfoContext } from "./types"

const en = (c: InfoContext): InfoContent => ({
  updated: "Last updated: October 2026",
  otherPages: "More information",
  pages: {
    "envios-y-devoluciones": {
      title: "Shipping & returns",
      description:
        "Shipping options and prices, collection from our Rubí shop, same-day delivery and how to return or exchange a product.",
      intro:
        "Every order is packed by hand in our shop in Rubí. Here is everything you need to know about how it reaches you, and what to do if you want to return or exchange something.",
      sections: [
        {
          heading: "Shipping options",
          blocks: [
            {
              cards: {
                head: ["Option", "Price", "Delivery time"],
                rows: [
                  [
                    "Standard delivery within Spain",
                    c.standard,
                    "2-4 working days",
                  ],
                  ["Express delivery", c.express, "24-48 working hours"],
                  [
                    "Collect from our Rubí shop",
                    "Free",
                    "We'll let you know as soon as it's ready",
                  ],
                  [
                    "Same-day delivery in Rubí",
                    c.rubi,
                    `Same day for orders placed before ${c.cutoff}, Monday to Saturday`,
                  ],
                ],
              },
            },
            "Shipping costs, including VAT, are always shown before you confirm your order. Delivery times are counted in working days from order confirmation and may be longer at busy times such as Christmas.",
          ],
        },
        {
          heading: "Shop collection and delivery in Rubí",
          blocks: [
            `If you choose to collect your order, we'll let you know when it's ready. You can pick it up at ${c.address}, Monday to Saturday, 9:30-13:30 and 17:00-20:30.`,
            `If you live in Rubí, we'll bring it to your door the same day: orders placed before ${c.cutoff}, Monday to Saturday, are delivered that day. Orders placed later, or on a Sunday, go out on the next delivery day.`,
          ],
        },
        {
          heading: "Gifts and samples",
          blocks: [
            "Gift wrapping is free. If your order is a present, just let us know and we'll wrap it for you.",
            "With every order you can choose free samples, subject to availability, so you can discover new fragrances and treatments.",
          ],
        },
        {
          heading: "If your parcel arrives damaged",
          blocks: [
            `Please check your parcel when it arrives. If it is damaged, or an item is missing or wrong, let us know as soon as possible by phone (${c.phone}) or email (${c.email}) and we'll put it right at no cost to you.`,
          ],
        },
        {
          heading: "Returns",
          blocks: [
            `You have ${c.returnDays} calendar days from receiving your order to return any unopened product with its original seal, without giving a reason.`,
            "For health and hygiene reasons, we cannot accept returns of fragrances, cosmetics or make-up that have been opened or unsealed after delivery, unless the product is faulty.",
            { h3: "How to return an item" },
            {
              ul: [
                `Let us know by email (${c.email}), by phone (${c.phone}) or in the shop, giving your order number and the items you want to return.`,
                `Bring the item to our Rubí shop or send it to ${c.address} within ${c.returnDays} days of telling us.`,
                "If you send it back by courier, you pay the return shipping, unless the product is faulty or we sent you the wrong one.",
              ],
            },
            "We'll refund the price of the product and the standard shipping cost within 14 days of hearing from you, using the same payment method you used. We may wait until we have received the item, or proof that you have sent it, before issuing the refund.",
            "You'll find the full legal details in our [[condiciones-de-venta|terms of sale]].",
          ],
        },
        {
          heading: "Exchanges",
          blocks: [
            "Picked the wrong shade or scent? You can exchange any unopened product free of charge in our Rubí shop within the same return period. We'll help you find the one that suits you best.",
          ],
        },
      ],
    },

    "preguntas-frecuentes": {
      title: "Frequently asked questions",
      description:
        "Quick answers about orders, shipping, payment, returns and our shop in Rubí.",
      intro:
        "Can't find what you're looking for? Give us a call or drop by the shop. We'll be happy to help.",
      sections: [
        {
          heading: "Orders",
          blocks: [
            { h3: "Do I need an account to shop?" },
            "No. You can check out as a guest, although with an account you can see your orders and save your addresses.",
            { h3: "How do I know my order has gone through?" },
            "You'll see a confirmation on screen when you complete your purchase, and we'll email you an order summary.",
            { h3: "Can I change or cancel my order?" },
            `Yes, as long as it hasn't been shipped yet. Get in touch as soon as possible by phone (${c.phone}) or email (${c.email}).`,
          ],
        },
        {
          heading: "Shipping",
          blocks: [
            { h3: "How much is shipping?" },
            `Standard delivery costs ${c.standard}. Express delivery costs ${c.express}. Collecting your order from our Rubí shop is free.`,
            { h3: "How long does delivery take?" },
            "Standard delivery takes 2-4 working days and express delivery 24-48 working hours.",
            { h3: "I live in Rubí. Can you deliver today?" },
            `Yes. Order before ${c.cutoff}, Monday to Saturday, and we'll deliver the same day for ${c.rubi}.`,
            { h3: "Do you ship outside Spain?" },
            "We ship to the whole of Spain, including the Balearic and Canary Islands. Parcels to the Canary Islands, Ceuta and Melilla go through customs and may take a few extra days. If you live in another country, please contact us before ordering.",
            "Find all the details on our [[envios-y-devoluciones|shipping & returns]] page.",
          ],
        },
        {
          heading: "Payment",
          blocks: [
            { h3: "Which payment methods do you accept?" },
            "Credit or debit card, Bizum, Apple Pay, Google Pay and Amazon Pay.",
            { h3: "Is it safe to pay on your website?" },
            "Yes. Payments are processed by Stripe, a certified payment platform. We never see or store your card details.",
            { h3: "Do prices include VAT?" },
            "Yes, all prices include VAT. Shipping costs are shown separately before you confirm your order.",
            { h3: "Can I get an invoice?" },
            "Of course. Email us your order number and billing details and we'll send it to you.",
          ],
        },
        {
          heading: "Products and gifts",
          blocks: [
            { h3: "Are your products genuine?" },
            "Yes. They are the same products we sell in our perfumery in Rubí.",
            { h3: "Can you give me some advice?" },
            `Absolutely, it's what we love doing. Call us on ${c.phone} or visit the shop and we'll help you choose the right fragrance or treatment.`,
            { h3: "Can I get samples?" },
            "Yes, you can choose free samples with every order, subject to availability.",
            { h3: "Do you gift wrap?" },
            "Yes, and it's free. Just tell us it's a present and we'll wrap it with care.",
          ],
        },
        {
          heading: "Returns and exchanges",
          blocks: [
            { h3: "Can I return a product?" },
            `Yes, you have ${c.returnDays} days from delivery to return unopened products with their seal intact.`,
            { h3: "What if I've already opened it?" },
            "For hygiene reasons, opened or unsealed fragrances and cosmetics cannot be returned unless they are faulty.",
            { h3: "Can I exchange a product?" },
            "Yes, exchanges are free in our Rubí shop as long as the product is unopened.",
          ],
        },
        {
          heading: "Our shop",
          blocks: [
            { h3: "Where are you?" },
            `At ${c.address}. We're open Monday to Saturday, 9:30-13:30 and 17:00-20:30, and closed on Sundays.`,
            { h3: "Do you have a beauty salon?" },
            `Yes. As well as a perfumery we are a beauty salon and a member of Passion Beauté. To book an appointment, call us on ${c.phone}.`,
          ],
        },
      ],
    },

    "condiciones-de-venta": {
      title: "Terms of sale",
      description:
        "General terms for buying from the Perfumería Núria Vilalta online shop: prices, payment, delivery, cancellation and guarantee.",
      intro:
        "These terms apply to purchases made in our online shop. Please read them before ordering: by confirming your order, you accept them.",
      sections: [
        {
          heading: "1. Who we are",
          blocks: [
            `The online shop is run by ${c.company} (${c.name}), tax ID (NIF) ${c.nif}, registered address ${c.address}. You can contact us by phone (${c.phone}) or email (${c.email}). Our other details are in the [[aviso-legal|legal notice]].`,
          ],
        },
        {
          heading: "2. Scope",
          blocks: [
            "These terms apply to purchases made on this website by consumers, mainly for delivery within Spain. You must be 18 or over to place an order.",
            "The contract may be concluded in Spanish, Catalan or English, depending on the language you choose on the website. We keep an electronic record of every order; you can view it in your account, if you have one, or ask us for a copy.",
          ],
        },
        {
          heading: "3. How to order",
          blocks: [
            {
              ul: [
                "Add products to your cart.",
                "Enter your contact details and delivery address.",
                "Choose a shipping method and a payment method.",
                "Review the summary and click «Place order».",
              ],
            },
            "Before confirming, you can review and correct any details, change quantities or remove items from your cart. Once your order is placed, we'll email you a confirmation with a summary.",
            "If an item turns out to be out of stock after you've ordered, we'll let you know and refund it straight away, or suggest an alternative if you prefer.",
          ],
        },
        {
          heading: "4. Prices",
          blocks: [
            "Prices are shown in euros and include VAT. Shipping costs are shown separately, always before you confirm your order. The price that applies is the one shown when you place the order.",
            "If we spot an obvious pricing error, we'll tell you, and you can either confirm the order at the correct price or cancel it at no cost.",
          ],
        },
        {
          heading: "5. Payment",
          blocks: [
            "You can pay by credit or debit card, Bizum, Apple Pay, Google Pay or Amazon Pay. Payments are processed securely by Stripe; we never receive or store your card details. Your bank may ask you to confirm the payment (strong customer authentication).",
            "Payment is taken when you confirm your order.",
          ],
        },
        {
          heading: "6. Shipping and delivery",
          blocks: [
            {
              ul: [
                `Standard delivery: ${c.standard}. Delivered in 2-4 working days.`,
                `Express delivery: ${c.express}. Delivered in 24-48 working hours.`,
                "Collection from our Rubí shop: free.",
                `Same-day delivery in Rubí: ${c.rubi}, for orders placed before ${c.cutoff}, Monday to Saturday.`,
              ],
            },
            "Delivery times are estimates. In any case we will deliver your order within 30 calendar days at the latest; if we can't, we'll let you know and you can cancel it for a full refund.",
            "More information on our [[envios-y-devoluciones|shipping & returns]] page.",
          ],
        },
        {
          heading: "7. Right of withdrawal",
          blocks: [
            `You have the right to cancel your purchase within ${c.returnDays} calendar days without giving any reason. The period starts on the day you, or someone you nominate, receive the goods.`,
            `To exercise this right, tell us clearly that you wish to cancel: by email (${c.email}), by phone (${c.phone}), by post to ${c.address} or in our shop. You may use the model form below, but you don't have to. It is enough to contact us before the period runs out.`,
            { h3: "Effects of cancellation" },
            "We'll refund all payments received from you, including standard delivery costs, within 14 calendar days of hearing from you. If you chose a more expensive delivery method than standard (for example, express), we won't refund the difference. We'll use the same payment method you used, at no cost to you. We may withhold the refund until we have received the goods back or you have provided proof of sending them.",
            `Please send or bring the goods back to ${c.address} within ${c.returnDays} calendar days of telling us you are cancelling. If you send them by courier, you pay the direct cost of returning them. You are only liable for any loss in value resulting from handling the goods beyond what is necessary to establish their nature and characteristics.`,
            { h3: "Exceptions" },
            "Under article 103 of the Spanish consumer protection law (Real Decreto Legislativo 1/2007), the right of withdrawal does not apply to:",
            {
              ul: [
                "Sealed goods which are not suitable for return for health protection or hygiene reasons and have been unsealed after delivery, such as opened fragrances, cosmetics and make-up.",
                "Goods made to your specifications or clearly personalised.",
              ],
            },
            { h3: "Model withdrawal form" },
            {
              box: [
                `To ${c.company} (${c.name}), ${c.address}. Email: ${c.email}.`,
                "I hereby give notice that I withdraw from my contract of sale of the following goods:",
                "Ordered on / received on:",
                "Name of consumer:",
                "Address of consumer:",
                "Signature of consumer (only if this form is notified on paper):",
                "Date:",
              ],
            },
          ],
        },
        {
          heading: "8. Guarantee",
          blocks: [
            "All products are covered by the three-year legal guarantee of conformity from delivery. If a product arrives faulty or isn't what you ordered, contact us and we'll replace it or refund it at no cost to you.",
            "Please let us know as soon as possible if your parcel arrives damaged. Bear in mind that cosmetics have an expiry date or a period after opening, shown on the packaging.",
          ],
        },
        {
          heading: "9. Customer service and complaints",
          blocks: [
            `For any question or complaint, call us on ${c.phone}, email us at ${c.email} or visit us at ${c.address}. We'll reply as soon as we can, and within one month at the latest.`,
            "Official complaint forms are available in our shop, and we can send you one on request. If you're not satisfied with our response, you can contact the Rubí municipal consumer information office (OMIC) or the [[https://consum.gencat.cat|Catalan Consumer Agency]].",
            `Consumer arbitration: ${c.arbitration}.`,
          ],
        },
        {
          heading: "10. Governing law",
          blocks: [
            "These terms are governed by Spanish law and Catalan consumer legislation. As a consumer, you may bring proceedings before the courts of your place of residence.",
          ],
        },
      ],
    },

    "aviso-legal": {
      title: "Legal notice",
      description:
        "Details of the owner of the Perfumería Núria Vilalta website and terms of use.",
      sections: [
        {
          heading: "Website owner",
          blocks: [
            "In accordance with article 10 of Spanish Law 34/2002 of 11 July on information society services and electronic commerce (LSSI-CE), the owner of this website is:",
            {
              ul: [
                `Owner: ${c.company}`,
                `Trading name: ${c.name}`,
                `Tax ID (NIF): ${c.nif}`,
                `Address: ${c.address}`,
                `Phone: ${c.phone}`,
                `Email: ${c.email}`,
                `Registration details: ${c.registry}`,
              ],
            },
          ],
        },
        {
          heading: "Purpose of the website",
          blocks: [
            "This website provides information about our perfumery and beauty salon in Rubí and lets you buy fragrances and cosmetics online. Purchases are governed by our [[condiciones-de-venta|terms of sale]].",
          ],
        },
        {
          heading: "Terms of use",
          blocks: [
            "By using this website you agree to use its content appropriately, in accordance with the law, good faith and these terms, and not to use it for unlawful purposes or in any way that could harm the website or others.",
          ],
        },
        {
          heading: "Intellectual and industrial property",
          blocks: [
            `The text, photographs, design, logos and other content on this website belong to ${c.company} or its licensors and are protected by intellectual and industrial property law. They may not be reproduced, distributed or altered without permission.`,
            "The brands and product names we sell belong to their respective owners and are used only to identify those products.",
          ],
        },
        {
          heading: "Liability",
          blocks: [
            "We take care to keep the information on this website accurate and up to date, but occasional errors may occur; we'll correct them as soon as we notice. Product colours may look slightly different depending on your screen.",
            "We are not responsible for service interruptions beyond our control, or for the content of third-party websites we link to, such as our social media pages.",
          ],
        },
        {
          heading: "Data protection and cookies",
          blocks: [
            "Our [[privacidad|privacy policy]] explains how we handle your data, and our [[cookies|cookie policy]] lists the cookies we use.",
          ],
        },
        {
          heading: "Governing law and jurisdiction",
          blocks: [
            "This legal notice is governed by Spanish law. Consumers may bring proceedings before the courts of their place of residence; in all other cases, the parties submit to the courts of Rubí.",
          ],
        },
      ],
    },

    privacidad: {
      title: "Privacy policy",
      description:
        "How Perfumería Núria Vilalta handles your personal data and how to exercise your rights.",
      intro:
        "Your trust matters to us. This policy explains what personal data we process, why, and what your rights are under the General Data Protection Regulation (GDPR) and the Spanish data protection act (LOPDGDD, Organic Law 3/2018).",
      sections: [
        {
          heading: "Data controller",
          blocks: [
            {
              ul: [
                `Controller: ${c.company} (${c.name})`,
                `Tax ID (NIF): ${c.nif}`,
                `Address: ${c.address}`,
                `Phone: ${c.phone}`,
                `Email: ${c.email}`,
              ],
            },
          ],
        },
        {
          heading: "What data we process",
          blocks: [
            {
              ul: [
                "Identification and contact details: first name, last name, email address, phone number, and delivery and billing addresses.",
                "Order details: products purchased, amounts, delivery method and purchase history.",
                "Account details, if you create an account: email address and password, which is stored encrypted.",
                "Any correspondence you have with us.",
              ],
            },
            "We never receive or store your card details: they are handled directly by our payment provider, Stripe.",
          ],
        },
        {
          heading: "Why we use it and on what legal basis",
          blocks: [
            {
              ul: [
                "To process your orders, payments, deliveries, returns and exchanges. Legal basis: performance of the sales contract.",
                "To manage your customer account, if you choose to create one. Legal basis: performance of the contract and your request.",
                "To answer your enquiries. Legal basis: your request and, where applicable, steps taken before entering into a contract.",
                "To meet our tax and accounting obligations, such as invoicing. Legal basis: compliance with legal obligations.",
                "To prevent payment fraud. Legal basis: our legitimate interest in protecting our customers and our business.",
                "To send you news and offers, only if you have given your consent. You can withdraw it at any time.",
              ],
            },
            "The details we ask for at checkout are needed to process your order; without them we cannot fulfil it.",
          ],
        },
        {
          heading: "How long we keep it",
          blocks: [
            "We keep your data for as long as our relationship lasts and then for the periods required by law: for example, six years for accounting records and invoices, and as long as needed to deal with any claims. Account data is kept until you ask us to delete your account.",
          ],
        },
        {
          heading: "Who we share it with",
          blocks: [
            "We do not sell your data or pass it on to third parties, except where required by law (for example, to the Spanish Tax Agency). To provide our service we rely on suppliers who process data on our behalf, under contracts that guarantee its confidentiality and security:",
            {
              ul: [
                "Stripe, to process payments.",
                "The courier companies that deliver your order.",
                "Our web hosting, email and IT service providers.",
              ],
            },
            "If you pay with Apple Pay, Google Pay or Amazon Pay, those providers also process your data under their own privacy policies.",
          ],
        },
        {
          heading: "International transfers",
          blocks: [
            "Some of our suppliers, such as Stripe, may process data outside the European Economic Area. When they do, they use the safeguards required by the GDPR, such as European Commission adequacy decisions or standard contractual clauses.",
          ],
        },
        {
          heading: "Your rights",
          blocks: [
            "You can exercise your rights of access, rectification, erasure, objection, restriction of processing and data portability at any time, and withdraw any consent you have given.",
            `To do so, email us at ${c.email} or write to us at ${c.address}, saying which right you wish to exercise. If we have reasonable doubts about your identity, we may ask for further information to confirm it. We'll reply within one month.`,
            "If you believe we have not handled your data properly, you can lodge a complaint with the [[https://www.aepd.es|Spanish Data Protection Agency (AEPD)]].",
          ],
        },
        {
          heading: "Children",
          blocks: [
            "Our online shop is not aimed at children under 14 and we do not knowingly process their data. You must be 18 or over to place an order.",
          ],
        },
        {
          heading: "Security and changes to this policy",
          blocks: [
            "We apply appropriate technical and organisational measures to protect your data. If we change this policy, we'll publish the new version on this page.",
          ],
        },
      ],
    },

    cookies: {
      title: "Cookie policy",
      description:
        "Which cookies the Perfumería Núria Vilalta website uses and what they are for.",
      intro:
        "Cookies are small files that a website stores in your browser so it can remember information between visits or from one page to the next.",
      sections: [
        {
          heading: "We only use technical cookies",
          blocks: [
            "Our website only uses technical cookies that it needs in order to work: remembering your language, keeping your cart, keeping you signed in and processing payments securely. We do not use analytics, advertising or tracking cookies.",
            "Under article 22.2 of the LSSI-CE, these cookies do not require your consent, which is why we don't show you a cookie banner.",
          ],
        },
        {
          heading: "Cookies we use",
          blocks: [
            {
              cards: {
                head: ["Cookie", "Purpose", "Duration", "Set by"],
                rows: [
                  ["_medusa_locale", "Remembers the language you chose", "1 year", "Us"],
                  ["_medusa_cart_id", "Keeps the items in your cart", "7 days", "Us"],
                  ["_medusa_jwt", "Keeps you signed in to your account", "7 days", "Us"],
                  [
                    "_medusa_pending_customer",
                    "Keeps your sign-up details while you verify your email address",
                    "24 hours",
                    "Us",
                  ],
                  [
                    "_medusa_cache_id",
                    "Shows you up-to-date catalogue information",
                    "24 hours",
                    "Us",
                  ],
                  [
                    "__stripe_mid, __stripe_sid",
                    "Processes payments securely and prevents fraud (checkout only)",
                    "1 year and 30 minutes",
                    "Stripe",
                  ],
                ],
              },
            },
          ],
        },
        {
          heading: "Links to other websites",
          blocks: [
            "Our website links to our Instagram and Facebook pages and to Google Maps, but does not embed them. If you visit them, those services may use their own cookies under their own policies.",
          ],
        },
        {
          heading: "Managing cookies",
          blocks: [
            "You can view and delete cookies in your browser settings. Please note that if you block technical cookies, some features of the website, such as the cart or checkout, will stop working.",
          ],
        },
        {
          heading: "Changes to this policy",
          blocks: [
            "If we start using other kinds of cookies in the future, such as analytics cookies, we'll update this policy and ask for your consent before setting them.",
            "You can find more about how we handle your data in our [[privacidad|privacy policy]].",
          ],
        },
      ],
    },
  },
})

export default en
