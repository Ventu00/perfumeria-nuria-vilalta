#!/bin/sh
set -e
npx medusa db:migrate
# Creates the first admin user once; ignored when it already exists.
if [ -n "$ADMIN_EMAIL" ]; then
  npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" || true
fi
exec npm run start
