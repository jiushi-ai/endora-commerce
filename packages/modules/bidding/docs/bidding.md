---
title: Bidding
description: Scarce-stock bidding campaigns, sealed receipts, dual review, and real order convert
---

# Bidding

The `bidding` module owns Mobii-style scarce-stock allocation: campaigns, sealed
bid receipts, dual review, allocate, deposit confirm with amount check, and
convert to a real Order.

## Roles (Batch C)

| Code | Default name | Notes |
| --- | --- | --- |
| `ops` | Operations | Campaign write + receipt review + allocate |
| `sales` | Sales | Receipt review |
| `after_sales` | After-sales | Order write + campaign read |

## Permissions

| Code | Purpose |
| --- | --- |
| `bidding:campaigns:read` | List/get campaigns |
| `bidding:campaigns:write` | Create/edit/publish/close/convert |
| `bidding:receipts:review` | Desk list + approve/reject |
| `bidding:deposit:confirm` | Finance deposit confirm (amount-checked) |
| `bidding:allocate` | Record winners/losers |

## Admin API

Base: `/api/v1/admin/bidding/…` — see `specs/165-mobii-bidding/contracts/bidding-api.md`.

### Convert (Batch E / T17′)

`POST …/receipts/:id/convert-to-order` requires a **won** allocation and
`deposit_confirmed` (or `won_pending_fulfilment`). It seeds the buyer cart at the
bid unit price, places a real Order via `orderPlacementPort` (using the buyer's
one-click defaults), writes `orderId`, and keeps `tradeId` on the receipt and in
the order customer note (G-M4).

### Deposit (T20)

`POST …/receipts/:id/confirm-deposit` body `{ amountReceived }` must match the
frozen rule's expected deposit (fixed amount or percent of bid total).

### Ship gate (T22)

`biddingFulfilmentGatePort.assertShipAllowed(orderId)` refuses bidding-linked
orders that lack converted status, `tradeId`, or intent attachments.
`shipments` calls it when `bidding` is present.

## Storefront API

Base: `/api/v1/bidding/…` — campaign list/detail, submit receipt, my receipts,
intent template download and signed PDF upload.

## Activation

| Setting | Default | Meaning |
| --- | --- | --- |
| `bidding.activation` | on | Operator switch. Off skips seeder + routes/UI. |

## Non-goals

- Live ascending-price auction engine
- Mini-program client
- Using RFQ as the primary scarce-stock model
