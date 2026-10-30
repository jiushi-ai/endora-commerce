# Data model: 165-mobii-bidding

## Entities (module `bidding`)

### Campaign

| Field | Notes |
| --- | --- |
| id | UUID |
| code / title | Operator-facing |
| status | draft → published → closed_for_bids → allocated → closed \| cancelled |
| productVariantId / qty | Scarce stock offered |
| salesChannelId | Visibility |
| audience | customer group ids and/or org allow-list |
| opensAt / closesAt | Bid window |
| currentRuleVersionId | Frozen on publish |
| intentTemplateAssetId | Downloadable 意向书 template |
| createdByAdminUserId | |

### CampaignRuleVersion

| Field | Notes |
| --- | --- |
| id | UUID |
| campaignId | |
| version | monotonic |
| minUnitPrice / currency | |
| maxQtyPerOrg / minQty | |
| depositPercent or depositAmount | |
| payloadJson | other published rules snapshot |

### BidReceipt

| Field | Notes |
| --- | --- |
| id | UUID |
| campaignId | |
| organizationId | tenant |
| ruleVersionId | G-C2 |
| status | submitted → ops_review → sales_review → [legal_review] → await_deposit → deposit_confirmed → won_pending_fulfilment → converted \| rejected \| withdrawn \| lost \| expired |
| bidUnitPrice / bidQty | sealed from peers until allocated |
| attachmentAssetIds | G-C3 |
| tradeId | set when entering fulfilable path (G-M4) |
| orderId | set on convert |

### BidApprovalStep

| Field | Notes |
| --- | --- |
| receiptId | |
| step | ops \| sales \| legal \| finance_deposit |
| actorAdminUserId | |
| decidedAt | |
| decision | approve \| reject |
| note | optional; not a substitute for decision |

### AllocationResult

| Field | Notes |
| --- | --- |
| campaignId | |
| receiptId | |
| outcome | won \| lost \| waitlist |
| allocatedQty | |
| decidedByAdminUserId / at | |

## Links outside module

- **Inventory**: reservation / release on allocate / cancel (G-S3/G-S5) via inventory ports.
- **Payment**: deposit receivable + manual receive → finance step.
- **Order / Shipment**: convert creates order; shipment create calls bidding checklist port.

## State machines

See PRO.md §4.4; this file owns persistence columns only — transitions enforced in services.
