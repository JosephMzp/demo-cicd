# web: nginx sirviendo la página y reenviando /api/ al backend.
# Imagen "unprivileged": corre como usuario nginx (uid 101) y escucha en 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

EXPOSE 8080
