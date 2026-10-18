#!/bin/bash
# Installs the shop backend on a fresh Oracle Cloud "Always Free" Ubuntu VM.
# Usage (on the VM):
#   curl -fsSL https://raw.githubusercontent.com/Ventu00/perfumeria-nuria-vilalta/main/deploy/oracle/install.sh | bash
set -euo pipefail

REPO=https://github.com/Ventu00/perfumeria-nuria-vilalta.git
DIR="$HOME/perfumeria"

echo "== Instalando Docker =="
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

echo "== Abriendo los puertos 80 y 443 =="
# Oracle's Ubuntu images block everything but SSH in iptables.
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo sh -c 'command -v netfilter-persistent >/dev/null && netfilter-persistent save || true'

echo "== Descargando la tienda =="
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull --ff-only
else
  git clone "$REPO" "$DIR"
fi
cd "$DIR/deploy/oracle"

if [ ! -f .env ]; then
  IP=$(curl -fsSL https://api.ipify.org)
  DOMAIN="${IP//./-}.sslip.io"
  echo
  read -rp "Dirección de la tienda en Vercel (ej. https://perfumeria-nuria-vilalta.vercel.app): " STORE_URL </dev/tty
  read -rp "Tu correo para entrar al panel: " ADMIN_EMAIL </dev/tty
  read -rsp "Contraseña para el panel: " ADMIN_PASSWORD </dev/tty
  echo
  STORE_URL="${STORE_URL%/}"
  umask 077
  cat > .env <<ENV
DOMAIN=$DOMAIN
POSTGRES_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
COOKIE_SECRET=$(openssl rand -hex 32)
STORE_CORS=$STORE_URL
ADMIN_CORS=https://$DOMAIN
AUTH_CORS=https://$DOMAIN,$STORE_URL
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
STOREFRONT_URL=$STORE_URL
ENV
fi

echo "== Construyendo y arrancando (tarda unos minutos la primera vez) =="
sudo docker compose up -d --build

DOMAIN=$(grep ^DOMAIN= .env | cut -d= -f2)
echo
echo "Listo. Panel de la tienda: https://$DOMAIN/app"
echo "Dirección del servidor para Vercel: https://$DOMAIN"
