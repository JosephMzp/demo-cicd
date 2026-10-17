#!/usr/bin/env bash
# Smoke test: las cinco comprobaciones mínimas de que la aplicación desplegada funciona.
# Uso: scripts/smoke.sh http://localhost:8080
# Reintenta durante un minuto, porque un ambiente recién desplegado tarda unos segundos en responder.
set -euo pipefail

BASE="${1:-http://localhost:8080}"
BASE="${BASE%/}"

echo "Smoke test contra $BASE"

# 1. La página responde 200 (con reintentos)
for i in $(seq 1 30); do
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/")" = "200" ]; then break; fi
  if [ "$i" = "30" ]; then echo "FALLO: $BASE/ no responde 200"; exit 1; fi
  sleep 2
done
echo "OK  GET /            200"

# 2. La página tiene título
curl -s "$BASE/" | grep -q "<title>" || { echo "FALLO: la página no tiene <title>"; exit 1; }
echo "OK  GET /            tiene <title>"

# 3. La API está sana (con reintentos, la base de datos puede tardar)
for i in $(seq 1 30); do
  if curl -s "$BASE/api/health" | grep -q '"ok"'; then break; fi
  if [ "$i" = "30" ]; then echo "FALLO: /api/health no está ok"; curl -s "$BASE/api/health"; exit 1; fi
  sleep 2
done
echo "OK  GET /api/health  ok"

# 4. Se puede crear un mensaje
TEXTO="smoke $(date +%s)"
CODIGO=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/mensajes" \
  -H 'Content-Type: application/json' -d "{\"nombre\":\"Smoke\",\"mensaje\":\"$TEXTO\"}")
[ "$CODIGO" = "201" ] || { echo "FALLO: POST /api/mensajes devolvió $CODIGO"; exit 1; }
echo "OK  POST /api/mensajes 201"

# 5. Y aparece en la lista
curl -s "$BASE/api/mensajes" | grep -q "$TEXTO" || { echo "FALLO: el mensaje creado no aparece en la lista"; exit 1; }
echo "OK  GET /api/mensajes  contiene el mensaje"

echo "Smoke test: todo en verde"
