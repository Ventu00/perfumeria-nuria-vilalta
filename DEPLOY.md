# Publicar la tienda gratis en modo prueba

Esta guía pone la tienda en internet sin coste para probarla desde el móvil. Se usan dos servicios gratuitos:

| Servicio | Para qué | Coste |
| --- | --- | --- |
| [Oracle Cloud, Always Free](https://www.oracle.com/es/cloud/free/) | Servidor, panel de la tienda, base de datos y fotos | 0 € (pide tarjeta solo para verificar tu identidad) |
| [Vercel](https://vercel.com), plan Hobby | La web que ven los clientes | 0 € |

El servidor gratuito de Oracle tiene 4 procesadores y 24 GB de memoria, de sobra para la tienda, y no se apaga solo. Las fotos de los productos se guardan en ese mismo servidor.

Los pagos siguen desactivados hasta tener cuenta de Stripe (ver el final). Stripe no cobra cuota: solo una comisión por venta.

---

## 1. Elegir la dirección de la tienda

La tienda tendrá una dirección del tipo `https://perfumeria-nuria-vilalta.vercel.app`. La parte del medio es el nombre del proyecto que pondrás en Vercel en el paso 3. Decide ese nombre ahora, porque el servidor lo necesita antes. En esta guía lo llamamos `URL_TIENDA`.

---

## 2. Oracle Cloud (servidor)

### Crear la cuenta

1. Entra en [oracle.com/es/cloud/free](https://www.oracle.com/es/cloud/free/) y pulsa **Empieza gratis**.
2. Como región de inicio elige **Spain Central (Madrid)**. No se puede cambiar después.
3. Pide una tarjeta para verificar. No cobra nada mientras uses solo recursos marcados como **Always Free**.

### Crear la máquina

1. En el menú: **Compute > Instances > Create instance**.
2. **Image**: Canonical Ubuntu 24.04.
3. **Shape**: pulsa **Change shape > Ampere > VM.Standard.A1.Flex** y pon 4 OCPU y 24 GB de memoria. Debe aparecer la etiqueta *Always Free-eligible*.
4. **Add SSH keys**: elige **Generate a key pair for me** y pulsa **Save private key**. Guarda ese archivo, es la llave para entrar.
5. Pulsa **Create**. Cuando salga en verde, copia su **Public IP address**.

Si sale el aviso *Out of capacity*, vuelve a intentarlo más tarde o elige otro *Availability domain*. Pasa a veces con las máquinas gratuitas.

### Abrir la máquina a internet

1. En la página de la máquina, pulsa el enlace de la **Subnet** y después la **Default Security List**.
2. **Add Ingress Rules** con origen `0.0.0.0/0`, protocolo TCP y puertos de destino `80,443`.

### Instalar la tienda

Desde el terminal de tu ordenador (cambia la ruta de la llave y la IP):

```bash
chmod 600 ~/Descargas/ssh-key-*.key
ssh -i ~/Descargas/ssh-key-*.key ubuntu@<IP_PUBLICA>
```

Ya dentro de la máquina, ejecuta:

```bash
curl -fsSL https://raw.githubusercontent.com/Ventu00/perfumeria-nuria-vilalta/main/deploy/oracle/install.sh | bash
```

El script te hará tres preguntas: la `URL_TIENDA`, tu correo y una contraseña para el panel. Después instala todo solo. La primera vez tarda entre 5 y 10 minutos. Al terminar muestra dos direcciones:

- **Panel de la tienda**: `https://<ip-con-guiones>.sslip.io/app`
- **Dirección del servidor**: `https://<ip-con-guiones>.sslip.io`. En esta guía es la `URL_SERVIDOR`.

La dirección `sslip.io` es gratuita y lleva su candado HTTPS. Cuando paséis al dominio propio se cambiará por algo como `panel.perfumerianuriavilalta.com`.

### Primer acceso al panel

1. Abre el panel y entra con tu correo y contraseña.
2. Ve a **Settings > Publishable API Keys** y copia la clave que empieza por `pk_`. La necesitas para Vercel.
3. Para dar acceso a tus padres: **Settings > Users > Invite**. Cada uno tendrá su propio usuario. El apartado que usarán es **Mis productos (fácil)**, en el menú de la izquierda.

---

## 3. Vercel (la tienda)

1. Crea una cuenta en Vercel entrando con GitHub.
2. **Add New > Project > Import `Ventu00/perfumeria-nuria-vilalta`**.
3. **Project Name**: el nombre que elegiste en el paso 1.
4. **Root Directory**: `apps/storefront`. Vercel detecta Next.js solo.
5. En **Environment Variables** añade:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=<URL_SERVIDOR>
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<clave pk_ del paso anterior>
NEXT_PUBLIC_BASE_URL=<URL_TIENDA>
NEXT_PUBLIC_DEFAULT_REGION=es
```

6. Pulsa **Deploy**.

Si Vercel te da una dirección distinta de la que pusiste en el servidor, cámbiala allí. En la máquina de Oracle, ejecuta `nano ~/perfumeria/deploy/oracle/.env`, corrige la dirección en `STORE_CORS` y `AUTH_CORS`, guarda y ejecuta:

```bash
cd ~/perfumeria/deploy/oracle && sudo docker compose up -d
```

---

## 4. Comprobar que todo funciona

Desde el móvil:

1. Abre el panel, entra en **Mis productos (fácil)** y crea un producto con foto, precio y descripción.
2. Abre la tienda. El producto debería aparecer en menos de un minuto.
3. Prueba los botones **ES · CA · EN** del menú.
4. Añade el producto a la cesta y marca **Envolver para regalo**.

El pago todavía no se puede completar porque falta Stripe.

---

## 5. Actualizar la tienda tras cambios en GitHub

- **La web de la tienda**: Vercel la actualiza sola con cada cambio.
- **El servidor y el panel**: entra en la máquina por SSH y vuelve a ejecutar el mismo comando de instalación. Detecta que ya está instalado y solo descarga lo nuevo. Tus productos, fotos y contraseñas se conservan.

---

## 6. Activar los pagos (más adelante)

Cuando tengáis cuenta de Stripe a nombre del negocio:

1. En Stripe, copia la clave secreta: `sk_test_...` para pruebas o `sk_live_...` para cobrar de verdad.
2. Crea un webhook a `<URL_SERVIDOR>/hooks/payment/stripe_stripe` y copia su secreto `whsec_...`.
3. En la máquina de Oracle, añade al final de `~/perfumeria/deploy/oracle/.env` estas dos líneas:

   ```env
   STRIPE_API_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Ejecuta:

   ```bash
   cd ~/perfumeria/deploy/oracle && sudo docker compose up -d
   sudo docker compose exec medusa npx medusa exec ./src/scripts/enable-stripe.js
   ```

5. En Vercel añade `NEXT_PUBLIC_STRIPE_KEY=<pk_test_... o pk_live_...>` y vuelve a desplegar.
6. En Stripe, en **Settings > Payment methods**, activa tarjeta, Bizum, Apple Pay, Google Pay y Amazon Pay. Para Apple Pay hay que verificar el dominio de la tienda en esa misma pantalla.

---

## Si algo falla

- **Ver qué pasa en el servidor**: `cd ~/perfumeria/deploy/oracle && sudo docker compose logs -f medusa`.
- **El panel no abre o no tiene candado**: revisa que los puertos 80 y 443 estén abiertos en la *Security List* (paso 2).
- **La tienda dice que no encuentra la región**: revisa que `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` sea la clave `pk_` correcta y que `STORE_CORS` lleve la dirección de la tienda sin barra final.
- **Oracle avisa de que la máquina está inactiva**: en cuentas gratuitas, Oracle puede recuperar máquinas que casi no se usan durante una semana. Si os pasa, pasad la cuenta a *Pay As You Go* en **Billing > Upgrade**. Seguís sin pagar nada mientras uséis solo recursos *Always Free*, y la máquina ya no se recupera.

---

## Otras opciones de alojamiento

La carpeta `deploy/` también tiene la configuración para Railway, de pago (unos 5 $ al mes). Sirve si más adelante preferís no mantener vosotros el servidor.
