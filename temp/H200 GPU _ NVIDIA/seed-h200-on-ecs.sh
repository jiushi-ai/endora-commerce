#!/usr/bin/env bash
# Seed one NVIDIA H200 GPU product on production (ECS).
# Run on a host that can reach the API (ECS is fine).
#
# Usage:
#   export ADMIN_EMAIL='you@example.com'
#   export ADMIN_PASSWORD='your-password'
#   bash seed-h200-on-ecs.sh
#
# Optional:
#   export API_BASE='https://api.justgoai.com'
#   export SKU='NVIDIA-H200'
#
# Flow: admin login → create active product → CNY base price 1,000,000 (net / excl. tax).
# Needs: curl, python3 (no jq required).

set -euo pipefail

API_BASE="${API_BASE:-https://api.justgoai.com}"
SKU="${SKU:-NVIDIA-H200}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

if [[ -z "${ADMIN_EMAIL:-}" || -z "${ADMIN_PASSWORD:-}" ]]; then
  echo "Set ADMIN_EMAIL and ADMIN_PASSWORD." >&2
  exit 1
fi

py() { python3 -c "$1"; }

echo "==> 1) Admin login"
LOGIN_BODY="$(ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" py '
import json, os
print(json.dumps({"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]}))
')"
LOGIN_JSON="$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/v1/auth/admin/login" \
  -H 'Content-Type: application/json' \
  -d "$LOGIN_BODY")"

STATUS="$(echo "$LOGIN_JSON" | py 'import json,sys; d=json.load(sys.stdin); print((d.get("data") or {}).get("status") or "")')"
if [[ "$STATUS" != "authenticated" ]]; then
  echo "Login failed (status=${STATUS:-unknown}):" >&2
  echo "$LOGIN_JSON" >&2
  exit 1
fi
echo "    OK"

NAME_ZH='NVIDIA H200 GPU'
NAME_EN='NVIDIA H200 GPU'
DESC_ZH='NVIDIA H200（Hopper）数据中心 GPU：约 141GB HBM3e、带宽约 4.8TB/s，面向生成式 AI / LLM 与 HPC 负载。本站标价人民币 100 万元（不含税）。规格说明为运营摘要，详情以厂商公开资料为准。'
DESC_EN='NVIDIA H200 (Hopper) data-center GPU: ~141GB HBM3e at ~4.8TB/s, for generative AI / LLM and HPC. List price CNY 1,000,000 excluding tax. Summary only; see vendor public specs for details.'

echo "==> 2) Create product SKU=${SKU} (status=active)"
CREATE_BODY="$(SKU="$SKU" NAME_ZH="$NAME_ZH" NAME_EN="$NAME_EN" DESC_ZH="$DESC_ZH" DESC_EN="$DESC_EN" py '
import json, os
print(json.dumps({
  "sku": os.environ["SKU"],
  "type": "simple",
  "name": {"zh-CN": os.environ["NAME_ZH"], "en-US": os.environ["NAME_EN"]},
  "description": {"zh-CN": os.environ["DESC_ZH"], "en-US": os.environ["DESC_EN"]},
  "categoryIds": [],
  "attributeValues": {},
  "visibility": "public",
  "status": "active",
  "manageStock": False,
  "minOrderQuantity": 1,
  "returnable": False,
}))
')"
CREATE_JSON="$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/v1/admin/catalog/products" \
  -H 'Content-Type: application/json' \
  -d "$CREATE_BODY")"

PRODUCT_ID="$(echo "$CREATE_JSON" | py 'import json,sys; d=json.load(sys.stdin); print((d.get("data") or {}).get("id") or "")')"
if [[ -z "$PRODUCT_ID" ]]; then
  echo "Create product failed:" >&2
  echo "$CREATE_JSON" >&2
  exit 1
fi
echo "    OK productId=${PRODUCT_ID}"

echo "==> 3) Base price CNY 1,000,000 (net / excl. tax)"
PRICE_BODY='{"byCurrency":{"CNY":{"product":[{"minQuantity":1,"maxQuantity":null,"amount":"1000000.0000"}],"variants":{}}}}'
PRICE_JSON="$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X PUT "${API_BASE}/api/v1/admin/price-books/base-prices/${PRODUCT_ID}" \
  -H 'Content-Type: application/json' \
  -d "$PRICE_BODY")"

HAS_DATA="$(echo "$PRICE_JSON" | py 'import json,sys; d=json.load(sys.stdin); print("1" if "data" in d else "0")')"
if [[ "$HAS_DATA" != "1" ]]; then
  echo "Set base price failed:" >&2
  echo "$PRICE_JSON" >&2
  exit 1
fi
echo "    OK"

echo
echo "Done."
echo "  Admin: https://admin.justgoai.com  (search SKU ${SKU})"
echo "  Store: https://b2b.justgoai.com"
echo "  id:    ${PRODUCT_ID}"
