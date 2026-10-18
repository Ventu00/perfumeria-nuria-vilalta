import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL

// Stripe covers cards, Bizum, Apple Pay, Google Pay and Amazon Pay through one
// Payment Element. Which methods show is decided in the Stripe Dashboard
// (Settings > Payment methods), so no code change is needed to add or remove one.
const stripeProvider = process.env.STRIPE_API_KEY
  ? [
      {
        resolve: "@medusajs/medusa/payment-stripe",
        id: "stripe",
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          automaticPaymentMethods: true,
          capture: true,
        },
      },
    ]
  : []

// Product photos go to an S3-compatible bucket (Cloudflare R2) when one is
// configured. Otherwise they stay on the server's disk under /static, served
// from MEDUSA_BACKEND_URL; the Docker setup keeps that folder in a volume.
const localFileModule = process.env.MEDUSA_BACKEND_URL
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/file-local",
              id: "local",
              options: {
                backend_url: `${process.env.MEDUSA_BACKEND_URL}/static`,
              },
            },
          ],
        },
      },
    ]
  : []

const fileModule = process.env.S3_BUCKET
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/file-s3",
              id: "s3",
              options: {
                file_url: process.env.S3_FILE_URL,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                region: process.env.S3_REGION || "auto",
                bucket: process.env.S3_BUCKET,
                endpoint: process.env.S3_ENDPOINT,
                additional_client_config: { forcePathStyle: true },
              },
            },
          ],
        },
      },
    ]
  : localFileModule

// Order emails go out through SMTP when it is configured (see DEPLOY.md).
// Without it they are only written to the server log, so nothing breaks.
const emailProvider = process.env.SMTP_HOST
  ? {
      resolve: "./src/modules/email",
      id: "smtp",
      options: {
        channels: ["email"],
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        storefrontUrl: process.env.STOREFRONT_URL,
      },
    }
  : {
      resolve: "@medusajs/medusa/notification-local",
      id: "local",
      options: { channels: ["email"] },
    }

// With Redis available (production), events, workflows, locks and caching are
// shared between the server and the worker instead of living in memory.
const redisModules = REDIS_URL
  ? [
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: { redisUrl: REDIS_URL },
      },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: { redis: { redisUrl: REDIS_URL } },
      },
      {
        resolve: "@medusajs/medusa/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  // Product and category translations (Spanish, Catalan, English).
  featureFlags: {
    translation: true,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as
      | "shared"
      | "worker"
      | "server",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/translation",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: stripeProvider,
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: { providers: [emailProvider] },
    },
    ...fileModule,
    ...redisModules,
    {
      // Market analysis: competitor prices and stock, supplier tariffs and
      // the buy / price suggestions shown in "Análisis de mercado".
      resolve: "./src/modules/market",
      options: {
        readerContact: process.env.MARKET_READER_CONTACT,
        readerDelayMs: process.env.MARKET_READER_DELAY_MS
          ? Number(process.env.MARKET_READER_DELAY_MS)
          : undefined,
      },
    },
  ],
})
