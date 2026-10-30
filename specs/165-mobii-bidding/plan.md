# Implementation Plan: 165-mobii-bidding

**Spec**: `specs/165-mobii-bidding/spec.md`  
**Created**: 2026-10-30  
**Status**: Draft (Batch B)

## Summary

Add module `bidding` for scarce-stock campaigns and sealed bid receipts; extend admin roles / org owners in P1; gate payments/orders/shipments in P3. Storefront and Admin UIs for campaign + receipt. No RFQ reuse as primary model; no mini-program in MVP.

## Phases (map to PRO §六 / batches C–E)

| Phase | Batch | Deliver |
| --- | --- | --- |
| P1 foundation | C | Role seeds, typed org owners, catalog/CMS conventions, optional weaken cart-first nav |
| P2 bidding MVP | D | `bidding` entities/APIs/UI; campaign+receipt+sign-off; thin link to order |
| P3 fulfilment gates | E | Deposit confirm, trade id, G-S1 ship gate, release stock, E2E |

## Technical approach

- **Module layout**: `packages/modules/bidding/` per AGENTS module map (manifest, backend, migrations, admin, i18n, docs, colocated tests).
- **Writes**: Command Bus for audited mutations (publish, approve, allocate, convert).
- **Tenancy**: Campaign platform-scoped; receipts org-scoped via TenantContext.
- **Channel**: Campaigns and catalog visibility on request sales channel (`default` in Mobii local).
- **Documents**: Intent template via `document_templates` / `assets_library` upload on receipt.
- **Contracts**: Zod in `@endora-commerce/contracts` (see `contracts/`).

## Complexity / dependencies

- No new runtime dependency planned (Constitution IV).
- Depends on existing: organizations, catalog, inventory, payments, orders, shipments, admin_roles, audit, assets/document_templates.
- Optional: crm/tasks for offline chase.

## Risks

| Risk | Mitigation |
| --- | --- |
| Accidental RFQ coupling | Explicit non-goal; CI/docs; separate permission codes |
| Gate bypass via raw order APIs | Central checklist before shipment create |
| Channel mismatch | P0 convention + env defaults |

## Out of scope here

Implementing production code (starts after tasks approved). Overlay `mobii` shell.
