# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder
WORKDIR /app

# 1) copie package.json e package-lock.json e instale prod + dev deps
COPY package.json package-lock.json ./
RUN npm ci

# 2) copie todo o código e gere o build
COPY . .
RUN npm run build

# 3) remova devDependencies para manter a imagem final enxuta
RUN npm prune --production


# ---------- Stage 2: Runtime ----------
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 1) copie apenas o que o Next precisa em produção
COPY --from=builder /app/.next            ./.next
COPY --from=builder /app/public           ./public
COPY --from=builder /app/node_modules     ./node_modules
COPY --from=builder /app/package.json     ./package.json
COPY --from=builder /app/next.config.js   ./next.config.js

# 2) garanta que o env.js (ou qualquer arquivo referenciado no next.config.js) esteja presente
COPY --from=builder /app/src/env.js       ./src/env.js

EXPOSE 3000

# 3) comando para iniciar o Next.js em modo produção
CMD ["npm", "start"]
