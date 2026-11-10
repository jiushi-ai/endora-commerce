#!/usr/bin/env bash
# Seed ETFE 36V 300W flexible solar panel on production (ECS).
# Category: 绿色算力硬件 (slug: green-compute). Run on a host that can reach the API.
#
# Usage:
#   export ADMIN_EMAIL='you@example.com'
#   export ADMIN_PASSWORD='your-password'
#   bash seed-etfe-300w-on-ecs.sh
#
# Optional:
#   export API_BASE='https://api.justgoai.com'
#   export SKU='GHGN-ETFE-36V-300W'
#
# Flow: admin login → ensure category → create active product → CNY base price 1299 (net).
# Needs: curl, python3 (no jq required).

set -euo pipefail

API_BASE="${API_BASE:-https://api.justgoai.com}"
SKU="${SKU:-GHGN-ETFE-36V-300W}"
CAT_SLUG='green-compute'
CAT_NAME_ZH='绿色算力硬件'
CAT_NAME_EN='Green computing hardware'
PRICE_CNY='1299.0000'
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

echo "==> 2) Ensure category slug=${CAT_SLUG} (${CAT_NAME_ZH})"
CATEGORY_ID=""
LIST_JSON="$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X GET "${API_BASE}/api/v1/admin/catalog/categories" \
  -H 'Content-Type: application/json' || true)"

CATEGORY_ID="$(echo "$LIST_JSON" | CAT_SLUG="$CAT_SLUG" CAT_NAME_ZH="$CAT_NAME_ZH" py '
import json, os, sys
try:
  d = json.load(sys.stdin)
except Exception:
  print(""); raise SystemExit
rows = d.get("data") or []
slug = os.environ["CAT_SLUG"]
name_zh = os.environ["CAT_NAME_ZH"]
for r in rows:
  if (r.get("slug") or "") == slug:
    print(r.get("id") or ""); raise SystemExit
for r in rows:
  name = r.get("name") or {}
  if isinstance(name, dict) and (name.get("zh-CN") or "") == name_zh:
    print(r.get("id") or ""); raise SystemExit
print("")
')" || true

if [[ -z "$CATEGORY_ID" ]]; then
  CREATE_CAT_BODY="$(CAT_SLUG="$CAT_SLUG" CAT_NAME_ZH="$CAT_NAME_ZH" CAT_NAME_EN="$CAT_NAME_EN" py '
import json, os
print(json.dumps({
  "slug": os.environ["CAT_SLUG"],
  "name": {"zh-CN": os.environ["CAT_NAME_ZH"], "en-US": os.environ["CAT_NAME_EN"]},
  "isActive": True,
  "sortOrder": 40,
}))
')"
  CREATE_CAT_JSON="$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
    -X POST "${API_BASE}/api/v1/admin/catalog/categories" \
    -H 'Content-Type: application/json' \
    -d "$CREATE_CAT_BODY" || true)"
  CATEGORY_ID="$(echo "$CREATE_CAT_JSON" | py 'import json,sys
try:
  d=json.load(sys.stdin); print((d.get("data") or {}).get("id") or "")
except Exception:
  print("")
')" || true
  if [[ -n "$CATEGORY_ID" ]]; then
    echo "    created categoryId=${CATEGORY_ID}"
  else
    echo "    WARN: create category failed; falling back to categoryIds=[]"
    echo "$CREATE_CAT_JSON" >&2 || true
  fi
else
  echo "    found categoryId=${CATEGORY_ID}"
fi

NAME_ZH='光合硅能 ETFE 发电光伏软板 36V 300W'
NAME_EN='GHGN ETFE Flexible Solar Panel 36V 300W'
DESC_ZH='光合硅能半柔性 ETFE 发电光伏软板：标称约 36V / 300W，适合车载、房车顶及轻量铺装场景（静态资料常见搭配 12V 系统充电描述，以实际接线与控制器为准）。本站标价人民币 1299 元（不含税）。规格说明为运营摘要，详情以厂商公开资料为准。'
DESC_EN='GHGN semi-flexible ETFE solar panel: ~36V / 300W nominal, for vehicle/RV roof and light mounts (12V charging notes in source materials depend on controller wiring). List price CNY 1299 excluding tax. Summary only; see vendor public specs for details.'

CAT_IDS_JSON='[]'
if [[ -n "$CATEGORY_ID" ]]; then
  CAT_IDS_JSON="$(CATEGORY_ID="$CATEGORY_ID" py 'import json,os; print(json.dumps([os.environ["CATEGORY_ID"]]))')"
fi

echo "==> 3) Create product SKU=${SKU} (status=active, categoryIds=${CAT_IDS_JSON})"
CREATE_BODY="$(SKU="$SKU" NAME_ZH="$NAME_ZH" NAME_EN="$NAME_EN" DESC_ZH="$DESC_ZH" DESC_EN="$DESC_EN" CAT_IDS_JSON="$CAT_IDS_JSON" py '
import json, os
print(json.dumps({
  "sku": os.environ["SKU"],
  "type": "simple",
  "name": {"zh-CN": os.environ["NAME_ZH"], "en-US": os.environ["NAME_EN"]},
  "description": {"zh-CN": os.environ["DESC_ZH"], "en-US": os.environ["DESC_EN"]},
  "categoryIds": json.loads(os.environ["CAT_IDS_JSON"]),
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

echo "==> 4) Base price CNY ${PRICE_CNY} (net / excl. tax)"
PRICE_BODY="$(PRICE_CNY="$PRICE_CNY" py '
import json, os
print(json.dumps({"byCurrency":{"CNY":{"product":[{"minQuantity":1,"maxQuantity":None,"amount":os.environ["PRICE_CNY"]}],"variants":{}}}}))
')"
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
echo "  Store: https://b2b.justgoai.com/c/${CAT_SLUG}"
echo "  id:    ${PRODUCT_ID}"
echo "  cat:   ${CATEGORY_ID:-none}"
