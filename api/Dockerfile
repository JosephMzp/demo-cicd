# api: Node.js con Express. Sigue las seis reglas del LAB-02:
# tag fijo, dependencias antes que código, sin root, sin secretos, imagen chica, un proceso.
FROM node:22-alpine

RUN apk update && apk upgrade --no-cache

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY app.js server.js ./

# node es el uid 1000 en la imagen oficial. Numérico para que Kubernetes pueda verificar runAsNonRoot.
USER 1000
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:3000/api/health"]

CMD ["node", "server.js"]