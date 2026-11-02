---
title: Bidding
description: Scarce-stock bidding campaigns, sealed receipts, dual review, and thin order convert
---

# Bidding

The `bidding` module owns Mobii-style scarce-stock allocation: campaigns, sealed
bid receipts, dual review, allocate, and a thin convert-to-order path.

## Roles (Batch C)

| Code | Default name | Notes |
| --- | --- | --- |
| `ops` | Operations | Campaign write + receipt review + allocate |
| `sales` | Sales | Receipt review |
| `after_sales` | After-sales | Order write + campaign read |

## Permissions (Batch D)

| Code | Purpose |
| --- | --- |
| `bidding:campaigns:read` | List/get campaigns |
| `bidding:campaigns:write` | Create/edit/publish/close/convert |
| `bidding:receipts:review` | Desk list + approve/reject |
| `bidding:deposit:confirm` | Finance deposit confirm (thin) |
| `bidding:allocate` | Record winners/losers |

## Admin API

Base: `/api/v1/admin/bidding/…` — see `specs/165-mobii-bidding/contracts/bidding-api.md`.

## Storefront API

Base: `/api/v1/bidding/…` — campaign list/detail, submit receipt, my receipts.

## Thin convert (Batch D)

`POST …/receipts/:id/convert-to-order` requires a **won** allocation and
`deposit_confirmed` (or `won_pending_fulfilment`). It sets status `converted`
and ensures a `tradeId`. Creating the Order row is deferred to Batch E.

## Activation

| Setting | Default | Meaning |
| --- | --- | --- |
| `bidding.activation` | on | Operator switch. Off skips seeder + routes/UI. |

## Non-goals

Do **not** stretch `quote_requests` into this model. Mini-program and live
auction engines are out of MVP.
