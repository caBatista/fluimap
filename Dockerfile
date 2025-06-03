# ---------- Stage 1: Build ---------- 
FROM node:18-alpine AS builder

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas package.json e package-lock.json (cache de dependências)
COPY package.json package-lock.json ./

# Instala dependências em modo production
RUN npm ci --production

# Copia todo o restante do código-fonte
COPY . .

# Gera o build de produção do Next.js
RUN npm run build


# ---------- Stage 2: Runtime ----------
FROM node:18-alpine

WORKDIR /app

# Copia só o que precisa para rodar: 
#  - node_modules (do builder)
#  - .next (build do Next.js)
#  - public, next.config.js, tsconfig.json, etc.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next       ./.next
COPY --from=builder /app/public       ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json  ./
# Caso você tenha outras pastas/membros essenciais, copie aqui:
COPY --from=builder /app/src         ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Expõe a porta que o Next.js vai rodar
EXPOSE 3000

# Comando para iniciar em modo produção
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
