# Mobii-by-Endora — P1 底座约定（批次 C）

**Status**: Active 2026-11-02  
**Parent**: `pro_doc/PRO.md` §八 批次 C；规格 `specs/165-mobii-bidding/`  
**English / 中文**: operational conventions for roles, org owners, offline contacts, catalog/CMS docs, and optional cart-first module deactivation. / 角色、组织对接人、线下联系人、货品/CMS 文档挂载，以及可选关闭购物车主路径模块的约定。

---

## T1 — Admin roles / 管理员角色

| Code | Default name | Seed owner | Notes |
| --- | --- | --- | --- |
| `ops` | Operations | `bidding` boot seeder | Customers + catalog + orders read |
| `sales` | Sales | `bidding` boot seeder | Aligned with demo sales-rep catalogue + `customers:read` |
| `after_sales` | After-sales | `bidding` boot seeder | `orders:read` / `orders:write` (shipment admin shares these) |

- Codes are registered via `systemRoleCodePort` (deletion-protected while `bidding` is present).
- **No `bidding:*` permission codes** until Batch D routes exist (permission-inventory).
- Seeder is skipped when `bidding.activation` is off; existing role rows are left in place.

---

## T2 — Typed org staff owners / 分类型组织对接人

| Kind | Meaning | Table |
| --- | --- | --- |
| `ops` | Operations owner | `organization_staff_assignments` |
| `sales` | Sales owner | same |
| `after_sales` | After-sales owner | same |

- **Separate** from `organization_sales_rep_assignments` (RFQ sales-rep scope). Do not merge.
- Admin API (Batch C):  
  - `GET/POST /api/v1/admin/organizations/:organizationId/staff-assignments`  
  - `DELETE …/staff-assignments/:adminUserId/:kind`  
- Gate reuses `organizations:assign-sales-rep` for C; Admin UI deferred.
- Port name: `organizationStaffAssignmentPort`.

---

## T3 — Offline contacts / 线下联系人

| Approach | When to use |
| --- | --- |
| **Organization custom fields** | Stable labels (legal name of contact, WeChat, phone) that must appear on org desk without CRM. Prefer runtime custom fields (Constitution XIV). |
| **CRM / tasks** | Chase workflows, call logs, opportunity follow-up. Optional; do not block MVP bidding path. |

Convention for Mobii MVP:

1. Prefer **custom fields on Organization** for 2–5 sticky offline contact attributes.
2. Use **CRM** only when chase/task lifecycle is required; link by organization id.
3. Do **not** invent a third “offline contact” entity in Batch C.

Minimal UI: Organization admin detail already hosts custom-field values; CRM screens stay optional.

---

## T4 — High-end catalog / CMS attachments / 高端文档挂载

| Content | Home | Storefront surface |
| --- | --- | --- |
| Install / configuration guides | Product assets (`assets_library`) and/or CMS pages | PDP tabs / linked CMS page |
| After-sales / warranty process | CMS page (channel-scoped) | Footer / account help / PDP link |
| Bidding process / rules explainer | CMS page or document template | Campaign detail (Batch D) + help |

Conventions:

1. Channel-scoped CMS reads go through the resolved request channel (Constitution XII).
2. Heavy PDFs live in `assets_library`; pages describe *where* to download, not embed multi-MB blobs in CMS HTML.
3. Intent / bid document templates belong to `document_templates` (Batch D wiring).

---

## T5 — Optional cart-first modules on Mobii deploy / 可选弱化购物车主路径

For a Mobii-first deployment that wants bidding as the primary path, operators **may** deactivate (Principle XVII — non-destructive) modules that push cart-first UX when they are not needed:

| Module id (examples) | Why optional |
| --- | --- |
| `promotions` | Discount/cart promo UX |
| `shopping_lists` | Cart-adjacent list UX |
| `quick_order` | SKU paste → cart |
| `comparisons` | Catalog compare → cart |

**Do not** deactivate tenancy / catalogue / orders / payments / shipments / organizations / settings / admin_roles / bidding.

Record the chosen off-set in the deployment runbook when an overlay exists; until then this document is the Mobii deploy note.

Activation is operator-owned on `/platform/modules`; CLI availability remains orthogonal.
