import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from '@medusajs/framework/http'
import {
  PostCompetitor,
  PostCompetitorUpdate,
  PostListing,
  PostManualSnapshot,
  PostOpportunityStatus,
  PostSettings,
  PostSupplier,
  PostSupplierUpdate,
  PostTariff,
} from './admin/market/validators'

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
    // Análisis de mercado
    {
      method: ['POST'],
      matcher: '/admin/market/competitors',
      middlewares: [validateAndTransformBody(PostCompetitor)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/competitors/:id',
      middlewares: [validateAndTransformBody(PostCompetitorUpdate)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/listings',
      middlewares: [validateAndTransformBody(PostListing)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/listings/:id/snapshots',
      middlewares: [validateAndTransformBody(PostManualSnapshot)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/suppliers',
      middlewares: [validateAndTransformBody(PostSupplier)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/suppliers/:id',
      middlewares: [validateAndTransformBody(PostSupplierUpdate)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/suppliers/:id/tariff',
      // Tariffs arrive base64-encoded inside JSON.
      bodyParser: { sizeLimit: '12mb' },
      middlewares: [validateAndTransformBody(PostTariff)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/opportunities/:id',
      middlewares: [validateAndTransformBody(PostOpportunityStatus)],
    },
    {
      method: ['POST'],
      matcher: '/admin/market/settings',
      middlewares: [validateAndTransformBody(PostSettings)],
    },
  ],
})
