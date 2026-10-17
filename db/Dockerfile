# Postgres con el esquema del libro de visitas ya incluido.
#
# La imagen oficial ejecuta, en orden alfabético, todo .sql que encuentre en
# /docker-entrypoint-initdb.d/, pero SOLO si el directorio de datos está vacío,
# es decir, la primera vez que arranca con un volumen nuevo.
FROM postgres:16-alpine

COPY init/ /docker-entrypoint-initdb.d/
