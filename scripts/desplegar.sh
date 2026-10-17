#!/usr/bin/env bash
# Despliega un overlay de Kustomize reemplazando las imágenes locales por las del registro.
# Uso: scripts/desplegar.sh <overlay> <registro/prefijo> <tag>
#   scripts/desplegar.sh k8s/overlays/dev ghcr.io/usuario/demo-cicd sha-abc1234
#
# Los manifiestos de k8s/base usan imágenes "demo-cicd-web:local", "demo-cicd-api:local" y
# "demo-cicd-db:local". Aquí se cambian por "<registro/prefijo>-web:<tag>", etc.
# Es lo mismo que hace "kustomize edit set image", pero sin necesitar el binario de kustomize:
# con kubectl alcanza.
set -euo pipefail

OVERLAY="${1:?overlay, por ejemplo k8s/overlays/dev}"
PREFIJO="${2:?registro/prefijo, por ejemplo ghcr.io/usuario/demo-cicd}"
TAG="${3:?tag de la imagen, por ejemplo sha-abc1234}"

kubectl kustomize "$OVERLAY" \
  | sed -E "s#image: demo-cicd-(web|api|db):local#image: ${PREFIJO}-\1:${TAG}#" \
  | kubectl apply -f -
