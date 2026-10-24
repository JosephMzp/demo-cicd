# web: nginx sirviendo la página y reenviando /api/ al backend.
# Imagen "unprivileged": corre como usuario nginx (uid 101) y escucha en 8080.
FROM nginx:alpine-slim

USER root
RUN apk update && apk upgrade brotli-libs
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

EXPOSE 8080