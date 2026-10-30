# Tasks: 165-mobii-bidding

Mapped to PRO batches C → E. TDD: failing test first where the repo pattern requires it.

## P1 / Batch C — Foundation

- [ ] T1 Seed admin roles: ops / sales / after-sales (+ permission codes for later bidding)
- [ ] T2 Extend organization owners: ops + sales + after-sales assignment model/UI
- [ ] T3 Offline contacts strategy (custom fields and/or CRM) documented + minimal UI
- [ ] T4 Catalog/CMS attachment conventions for high-end docs (install / after-sales / process pages)
- [ ] T5 Optionally deactivate cart-first promotions modules on Mobii deploy notes

## P2 / Batch D — Bidding MVP

- [ ] T10 Module scaffold `packages/modules/bidding` (manifest, composition, migrations empty→entities)
- [ ] T11 Campaign CRUD + publish/close (Command Bus + audit)
- [ ] T12 BidReceipt submit + seal + deadline enforcement
- [ ] T13 Approval steps ops/sales/(legal)
- [ ] T14 Admin campaign + receipt desk UI
- [ ] T15 Storefront campaign list/detail/submit/status
- [ ] T16 Allocate winners/losers + notify (email)
- [ ] T17 Convert won+deposited receipt → order (thin; deposit may stub to P3)

## P3 / Batch E — Gates & acceptance

- [ ] T20 Deposit confirm + amount check (G-M3/G-M5)
- [ ] T21 Trade id wiring across payment/order/shipment
- [ ] T22 Ship checklist gate (G-S1/G-S2)
- [ ] T23 Inventory reserve/release (G-S3/G-S5)
- [ ] T24 E2E / acceptance against `pro_doc/acceptance-checklist-mvp.md`
- [ ] T25 Off-state coverage for `bidding` module

## Explicitly later

- Mini-program (小c)
- Live auction engine
- Overlay `apps/mobii` unless needed earlier for seeds
