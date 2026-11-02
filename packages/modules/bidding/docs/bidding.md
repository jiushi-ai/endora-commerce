---
title: Bidding
description: Scarce-stock bidding campaigns and Mobii admin role seeds (ops / sales / after-sales)
---

# Bidding

The `bidding` module is the home for Mobii-style scarce-stock allocation:
campaigns, sealed bid receipts, dual review, and (later) gated fulfilment.

## Batch C (foundation)

This release seeds three **protected** admin roles at boot while the module is
present:

| Code | Default name | Purpose |
| --- | --- | --- |
| `ops` | Operations | Customer org desk, catalog edit, order read |
| `sales` | Sales | Sales-rep style permissions plus `customers:read` |
| `after_sales` | After-sales | Order read/write (shipment admin shares these gates) |

No `bidding:*` permission codes are declared yet — those wait until campaign
and receipt routes exist.

## Activation

| Setting | Default | Meaning |
| --- | --- | --- |
| `bidding.activation` | on | Operator switch for the whole module. Off skips the role seeder and (later) every bidding surface. |

## Out of scope here

Campaign entities, admin/storefront UI, and fulfilment gates land in later
batches of feature 165. Do **not** stretch `quote_requests` into this model.
