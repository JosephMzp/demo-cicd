FROM nginxinc/nginx-unprivileged:1.29-alpine

USER root
RUN apk update && apk upgrade --no-cache
USER 101

ENV API_URL="http://api:3000"

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY public/ /usr/share/nginx/html/

EXPOSE 8080
