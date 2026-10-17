# Builds the Medusa backend (server + admin panel) from the repo root.
FROM node:22-bookworm-slim AS build
WORKDIR /repo
COPY package.json package-lock.json turbo.json .npmrc ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN npm ci
COPY apps/backend apps/backend
RUN cd apps/backend && npx medusa build \
  && cd .medusa/server && npm install --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/apps/backend/.medusa/server ./
COPY deploy/oracle/start.sh /start.sh
RUN chmod +x /start.sh && mkdir -p static
EXPOSE 9000
CMD ["/start.sh"]
