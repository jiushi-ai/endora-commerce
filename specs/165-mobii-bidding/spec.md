# Feature Specification: Mobii bidding — scarce-stock campaigns, intent receipts, gated fulfilment

**Feature Branch**: `feat/165-mobii-bidding` (planned; spec directory `specs/165-mobii-bidding/`)  
**Created**: 2026-10-30  
**Status**: Draft (Batch B — ready for owner review before plan freeze)  
**Input**: `pro_doc/PRO.md` §一–一附–§四–§六 (Mobii_Bidding_Platform_by_Endora)

## Vocabulary

- **大B / Admin** — platform operator (supplier company), Endora Admin UI.
- **小b / Customer org** — buying Organization on the Storefront.
- **Campaign** — one scarce-stock competitive allocation event published by 大B.
- **BidReceipt / Intent** — one Organization’s sealed submission against a Campaign (意向竞价单).
- **Rule version** — immutable snapshot of min price, qty caps, deposit rules at publish time.
- **Trade id** — single business key linking campaign → receipt → payment → order → shipment.
- **RFQ** — Endora `quote_requests`; **out of primary path** (must not be stretched into bidding).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Publish a campaign (Priority: P1)

运营在大B 选择货品与数量、客户范围、规则与意向模板，发布竞价活动；小b 在截止前可见（若准入）。

**Why this priority**: Without a campaign there is no bidding loop.

**Independent Test**: Create draft → publish → eligible org sees it on storefront; ineligible does not (G-C1).

**Acceptance Scenarios**:

1. **Given** a published product on channel `default`, **When** ops publishes a campaign with rules + template, **Then** status is `published` and a rule version is frozen (G-C2).
2. **Given** an org outside the audience, **When** it opens campaign APIs/UI, **Then** it cannot submit a receipt (G-C1).

---

### User Story 2 — Submit sealed intent (Priority: P1)

小b 下载模板、填写并上传、提交回执；截止后不可再投；评审前看不到他人报价。

**Independent Test**: Submit with attachment before deadline succeeds; after deadline fails (G-C3/G-C4/G-C5).

**Acceptance Scenarios**:

1. **Given** an open campaign, **When** customer submits without required attachment, **Then** rejected (G-C3).
2. **Given** deadline passed, **When** customer submits or amends price, **Then** rejected (G-C4).

---

### User Story 3 — Dual review then deposit (Priority: P1)

运营核对 → 销售确认（法务可选）→ 待预付 → 财务确认到账；每步记人记时。

**Independent Test**: Receipt cannot reach “deposit confirmed” without both required sign-offs and finance confirm (G-M1–G-M3, G-M5).

**Acceptance Scenarios**:

1. **Given** a submitted receipt, **When** only ops approves, **Then** sales step still required (G-M1).
2. **Given** deposit not confirmed, **When** user tries to create fulfilable order / ship, **Then** blocked (G-M3).

---

### User Story 4 — Allocate, convert, ship under gates (Priority: P2)

大B 公布中选/落选；中选确认采购承诺（G-C6）；转订单；仅当 G-S1 清单通过且售后角色才可发货。

**Independent Test**: Ship without deposit or missing attachment fails; with full checklist succeeds; cancel/lose frees stock (G-S*).

**Acceptance Scenarios**:

1. **Given** G-S1 incomplete, **When** after-sales creates shipment, **Then** refused (G-S1/G-S2).
2. **Given** loser or cancel, **When** transition completes, **Then** reserved qty released and audited (G-S5).

---

### Edge Cases

- Resubmit after reject; duplicate receipt per org per campaign (policy: one active receipt).
- Concurrent submits near deadline.
- Module `bidding` off → no campaign routes/UI (Constitution XVII).
- Must not use RFQ approve/convert as substitute for BidReceipt.

## Requirements *(mandatory)*

### Functional

- **FR-001**: New module `bidding` owns Campaign, RuleVersion, BidReceipt, AllocationResult, approval steps; does not fork `quote_requests`.
- **FR-002**: Campaign state machine per PRO §4.4 A; BidReceipt per §4.4 B; fulfilment gates on orders/payments/shipments per §4.4 C + G-S*.
- **FR-003**: Enforce G-C1…G-C6, G-M1…G-M5, G-S1…G-S5 in backend (not remarks-only).
- **FR-004**: Trade id links campaign → receipt → payment → order → shipment.
- **FR-005**: Admin UI: campaign desk + receipt review; Storefront: list/detail/submit/status (non-cart primary nav for this flow).
- **FR-006**: Reuse catalog, organizations, document_templates/assets, orders, payments, shipments, audit/Command Bus.
- **FR-007**: MVP excludes mini-program, live ascending auction, card gateways, deep courier integration.

### Non-goals (MVP)

- 小c WeChat mini-program.
- Public realtime auction.
- Treating RFQ as the bidding model.
- Rewriting platform kernel for cart metaphors.

## Success Criteria

- End-to-end path in PRO §6.2 passes on channel `default`.
- Checklist `pro_doc/acceptance-checklist-mvp.md` bidding section can be ticked.
- Off-state: switching `bidding` off removes surfaces (except activation control).

## Assumptions

- Seller-operated scarce stock (Mobii), not buyer RFx.
- Local/dev sales channel code `default` (Batch A).
- Overlay `apps/mobii` deferred; implement as module package first.
