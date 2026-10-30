# Contracts draft: bidding HTTP API (165)

Zod schemas will land in `@endora-commerce/contracts` during implement. Shapes below are the Batch B draft.

## Admin

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/admin/bidding/campaigns` | Create draft |
| PATCH | `/api/v1/admin/bidding/campaigns/:id` | Edit draft |
| POST | `/api/v1/admin/bidding/campaigns/:id/publish` | Freeze rule version, open bids |
| POST | `/api/v1/admin/bidding/campaigns/:id/close-bids` | Stop accepts |
| POST | `/api/v1/admin/bidding/campaigns/:id/allocate` | Record winners/losers |
| GET | `/api/v1/admin/bidding/campaigns` | List |
| GET | `/api/v1/admin/bidding/receipts` | Desk list / filters |
| POST | `/api/v1/admin/bidding/receipts/:id/approve` | Body: `{ step, note? }` |
| POST | `/api/v1/admin/bidding/receipts/:id/reject` | |
| POST | `/api/v1/admin/bidding/receipts/:id/confirm-deposit` | Finance |
| POST | `/api/v1/admin/bidding/receipts/:id/convert-to-order` | After deposit + win |

Permissions (indicative): `bidding:campaigns:write`, `bidding:receipts:review`, `bidding:deposit:confirm`, `bidding:allocate`.

## Storefront (customer session)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/bidding/campaigns` | Visible open/allocated campaigns |
| GET | `/api/v1/bidding/campaigns/:id` | Detail + own receipt summary |
| POST | `/api/v1/bidding/campaigns/:id/receipts` | Submit intent + attachments |
| GET | `/api/v1/bidding/receipts/mine` | Status list |

## Shared errors

- `BIDDING_NOT_ELIGIBLE` (G-C1)
- `BIDDING_CLOSED` (G-C4)
- `BIDDING_ATTACHMENT_REQUIRED` (G-C3)
- `BIDDING_STEP_REQUIRED` (G-M1)
- `BIDDING_DEPOSIT_REQUIRED` (G-M3)
- `BIDDING_SHIP_CHECKLIST_FAILED` (G-S1)

## Fulfilment seam

Shipment create (existing module) must call a port e.g. `BiddingFulfilmentGate.assertShipAllowed(orderId)` when order originates from bidding trade id.
