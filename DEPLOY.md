# Publicar la tienda en modo prueba

Esta guía deja la tienda en internet para probarla desde el móvil. Usa tres servicios con plan gratuito o de prueba:

| Servicio | Para qué | Coste aproximado |
| --- | --- | --- |
| [Railway](https://railway.com) | Servidor, panel de la tienda, base de datos y Redis | 5 $/mes (plan Hobby; trae crédito de prueba) |
| [Cloudflare R2](https://dash.cloudflare.com) | Fotos de los productos | Gratis hasta 10 GB |
| [Vercel](https://vercel.com) | La web de la tienda que ven los clientes | Gratis (plan Hobby) |

Los pagos siguen desactivados hasta tener cuenta de Stripe (ver el final).

Hazlo en este orden: primero R2, luego Railway y por último Vercel, porque cada paso necesita datos del anterior.

---

## 1. Cloudflare R2 (fotos)

1. Crea una cuenta en Cloudflare y entra en **R2 Object Storage**. Te pedirá una tarjeta aunque el uso sea gratis.
2. **Create bucket** con el nombre `nuria-vilalta-fotos`, ubicación automática.
3. Dentro del bucket: **Settings > Public access > R2.dev subdomain > Allow access**. Copia la URL pública, del tipo `https://pub-xxxxxxxx.r2.dev`.
4. Vuelve a R2 y abre **Manage R2 API Tokens > Create API token**:
   - Permisos: **Object Read & Write**.
   - Limitar al bucket `nuria-vilalta-fotos`.
5. Apunta estos cuatro datos (solo se muestran una vez):
   - Access Key ID
   - Secret Access Key
   - Endpoint, del tipo `https://<id-de-cuenta>.r2.cloudflarestorage.com`
   - La URL pública del paso 3

Más adelante, cuando se use el dominio propio, la URL `r2.dev` se puede cambiar por `fotos.perfumerianuriavilalta.com`.

---

## 2. Railway (servidor y panel)

1. Crea una cuenta en Railway entrando con GitHub (usuario `Ventu00`).
2. **New Project > Deploy PostgreSQL**. Después, dentro del mismo proyecto, **+ Create > Database > Redis**.
3. **+ Create > GitHub Repo > `Ventu00/perfumeria-nuria-vilalta`**. Este será el servicio **servidor**:
   - En **Settings > Config-as-code** pon la ruta `deploy/railway-server.json`.
   - En **Settings > Networking > Generate Domain** crea su dirección pública, por ejemplo `https://perfumeria-server.up.railway.app`. Esta es la `URL_SERVIDOR` de abajo.
4. Repite **+ Create > GitHub Repo** con el mismo repositorio para el servicio **worker** (tareas en segundo plano):
   - Config-as-code: `deploy/railway-worker.json`.
   - No le generes dominio.

### Variables del servidor

En el servicio servidor, pestaña **Variables > Raw Editor**, pega esto y rellena lo que va entre `< >`:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
MEDUSA_WORKER_MODE=server
MEDUSA_BACKEND_URL=<URL_SERVIDOR>
MEDUSA_FF_TRANSLATION=true

JWT_SECRET=<texto aleatorio largo>
COOKIE_SECRET=<otro texto aleatorio largo>

STORE_CORS=<URL_TIENDA>
ADMIN_CORS=<URL_SERVIDOR>
AUTH_CORS=<URL_SERVIDOR>,<URL_TIENDA>

S3_BUCKET=nuria-vilalta-fotos
S3_ENDPOINT=<Endpoint de R2>
S3_REGION=auto
S3_ACCESS_KEY_ID=<Access Key ID de R2>
S3_SECRET_ACCESS_KEY=<Secret Access Key de R2>
S3_FILE_URL=<URL pública r2.dev>

ADMIN_EMAIL=<tu correo>
ADMIN_PASSWORD=<una contraseña segura>
```

- Para los secretos puedes usar el botón **Generate** de Railway, o el comando `openssl rand -hex 32`.
- `URL_TIENDA` aún no existe. Pon de momento `https://localhost` y cámbiala en el paso 4.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` crean tu usuario del panel en el primer arranque. Cuando hayas entrado, borra `ADMIN_PASSWORD`.

### Variables del worker

Las mismas que el servidor, cambiando dos líneas y sin `ADMIN_EMAIL` ni `ADMIN_PASSWORD`:

```env
MEDUSA_WORKER_MODE=worker
DISABLE_MEDUSA_ADMIN=true
```

### Primer arranque

Pulsa **Deploy** en los dos servicios. El primer arranque del servidor tarda unos minutos porque crea la base de datos, las categorías en tres idiomas y tu usuario. Cuando el servicio salga en verde:

1. Abre `<URL_SERVIDOR>/app` y entra con tu correo y contraseña.
2. Ve a **Settings > Publishable API Keys** y copia la clave que empieza por `pk_`. La necesitas para Vercel.
3. Para dar acceso a tus padres: **Settings > Users > Invite**. Cada uno tendrá su propio usuario. El apartado que usarán es **Mis productos (fácil)**, en el menú de la izquierda.

---

## 3. Vercel (la tienda)

1. Crea una cuenta en Vercel entrando con GitHub.
2. **Add New > Project > Import `Ventu00/perfumeria-nuria-vilalta`**.
3. **Root Directory**: `apps/storefront`. Vercel detecta Next.js solo.
4. En **Environment Variables** añade:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=<URL_SERVIDOR>
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<clave pk_ del paso anterior>
NEXT_PUBLIC_BASE_URL=<URL_TIENDA>
NEXT_PUBLIC_DEFAULT_REGION=es
```

`URL_TIENDA` es la dirección que Vercel muestra tras el primer despliegue, por ejemplo `https://perfumeria-nuria-vilalta.vercel.app`. Si aún no la sabes, despliega una vez, cópiala, ponla en `NEXT_PUBLIC_BASE_URL` y pulsa **Redeploy**.

---

## 4. Conectar tienda y servidor

En Railway, en las variables del servidor **y** del worker, cambia `https://localhost` por la `URL_TIENDA` real en `STORE_CORS` y `AUTH_CORS`. Railway vuelve a desplegar solo.

---

## 5. Comprobar que todo funciona

Desde el móvil:

1. Abre `<URL_SERVIDOR>/app`, entra en **Mis productos (fácil)** y crea un producto con foto, precio y descripción.
2. Abre `<URL_TIENDA>`. El producto debería aparecer en menos de un minuto.
3. Prueba los botones **ES · CA · EN** del menú.
4. Añade el producto a la cesta y marca **Envolver para regalo**.

El pago todavía no se puede completar: falta Stripe.

---

## 6. Activar los pagos (más adelante)

Cuando tengáis cuenta de Stripe a nombre del negocio:

1. En Stripe, copia la clave secreta (`sk_test_...` para pruebas, `sk_live_...` para cobrar de verdad).
2. Crea un webhook a `<URL_SERVIDOR>/hooks/payment/stripe_stripe` y copia su secreto `whsec_...`.
3. Añade `STRIPE_API_KEY` y `STRIPE_WEBHOOK_SECRET` al servidor y al worker en Railway.
4. En la consola del servidor de Railway ejecuta una vez:
   `cd apps/backend/.medusa/server && npx medusa exec ./src/scripts/enable-stripe.js`
5. En Vercel añade `NEXT_PUBLIC_STRIPE_KEY=<pk_test_... o pk_live_...>` y vuelve a desplegar.
6. En Stripe, **Settings > Payment methods**, activa tarjeta, Bizum, Apple Pay, Google Pay y Amazon Pay. Para Apple Pay hay que verificar el dominio de la tienda en esa misma pantalla.

---

## Si algo falla

- **El servidor no arranca**: abre los registros (**Deployments > View logs**) del servicio. Casi siempre es una variable mal copiada.
- **La tienda dice que no encuentra la región**: revisa que `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` sea la clave `pk_` correcta y que `STORE_CORS` lleve la URL de la tienda sin barra final.
- **Las fotos no se ven**: revisa que el acceso público del bucket R2 esté activado y que `S3_FILE_URL` sea la URL `r2.dev`.
