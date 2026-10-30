# Research: 165-mobii-bidding

## Decision: new `bidding` module, not RFQ stretch

**Choice**: Own Campaign / BidReceipt domain in `bidding`.  
**Why**: Endora `quote_requests` is customer-initiated negotiation (one org, seller offer PDF). Mobii is platform-published scarce allocation (one campaign, many sealed intents). Force-fitting RFQ inverts initiator and cardinality.  
**Rejected**: Rename RFQ statuses to look like bidding; shadow RFQ tables.

## Decision: channel `default` for greenfield

**Choice**: Align storefront + backend on `default`.  
**Why**: Empty `setup` DB creates system-default `default`; `.env.example` historically said `pl_default` (demo shape) and caused UNKNOWN_SALES_CHANNEL.  
**Rejected**: Require demo seed before any storefront use.

## Decision: defer `apps/mobii` overlay

**Choice**: Spec and first implementation as a normal module package.  
**Why**: Overlay is for deployment-specific decoration; core bidding rules are product. Shell can wait until role seeds / module-off lists are deployment-specific.  
**Rejected**: Block Batch B on overlay scaffolding.

## Decision: fulfilment via existing orders/payments/shipments + gates

**Choice**: After allocation, create/link Order; deposit confirm extends payment receive; ship blocked by checklist port.  
**Why**: Reuse ledger and admin UX; gates encode PRO G-M*/G-S*.  
**Rejected**: Separate parallel “shipping” tables outside shipments module.
