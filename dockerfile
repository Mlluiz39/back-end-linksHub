# ---------- Production ----------
FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código fonte
COPY index.js ./
COPY src/ ./src/

EXPOSE 3000

CMD ["node", "index.js"]