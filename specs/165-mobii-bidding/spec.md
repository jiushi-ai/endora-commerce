# Feature Specification / 功能规格: Mobii bidding — scarce-stock campaigns, intent receipts, gated fulfilment / 莫比竞价 — 稀缺货活动、意向回执、履约门禁

**Feature Branch / 功能分支**: `feat/165-mobii-bidding` (planned; spec directory `specs/165-mobii-bidding/` / 计划中；规格目录见左)  
**Created / 创建日期**: 2026-10-30  
**Status / 状态**: Draft (Batch B — ready for owner review before plan freeze) / 草稿（批次 B — 待负责人审阅后再冻结计划）  
**Input / 输入依据**: `pro_doc/PRO.md` §一–一附–§四–§六 (Mobii_Bidding_Platform_by_Endora)

## Vocabulary / 词汇表

- **大B / Admin** — platform operator (supplier company), Endora Admin UI. / 平台运营方（卖方公司），使用 Endora 管理端界面。
- **小b / Customer org** — buying Organization on the Storefront. / 店面上的采购方组织（客户公司）。
- **Campaign / 竞价活动** — one scarce-stock competitive allocation event published by 大B. / 由大B 发布的一次稀缺库存竞争性分配活动。
- **BidReceipt / Intent / 竞价回执（意向单）** — one Organization’s sealed submission against a Campaign (意向竞价单). / 某一组织针对某活动提交的密封意向单据。
- **Rule version / 规则版本** — immutable snapshot of min price, qty caps, deposit rules at publish time. / 发布时冻结的最低价、数量上限、预付规则等不可变快照。
- **Trade id / 交易编号** — single business key linking campaign → receipt → payment → order → shipment. / 串联活动→回执→收款→订单→发货的唯一业务键。
- **RFQ / 询价单** — Endora `quote_requests`; **out of primary path** (must not be stretched into bidding). / Endora 的 `quote_requests`；**非主路径**（禁止硬拧成竞价模型）。

## User Scenarios & Testing / 用户场景与测试 *(mandatory / 必填)*

### User Story 1 — Publish a campaign / 用户故事 1 — 发布竞价活动 (Priority / 优先级: P1)

运营在大B 选择货品与数量、客户范围、规则与意向模板，发布竞价活动；小b 在截止前可见（若准入）。  
Ops on 大B picks product & qty, audience, rules and intent template, then publishes; eligible 小b see it before the deadline.

**Why this priority / 为何优先**: Without a campaign there is no bidding loop. / 没有活动就没有竞价闭环。

**Independent Test / 独立验收**: Create draft → publish → eligible org sees it on storefront; ineligible does not (G-C1). / 建草稿→发布→准入组织在店面可见；未准入不可见（G-C1）。

**Acceptance Scenarios / 验收场景**:

1. **Given / 给定** a published product on channel `default` / 渠道 `default` 上已有上架商品, **When / 当** ops publishes a campaign with rules + template / 运营发布带规则与模板的活动, **Then / 则** status is `published` and a rule version is frozen (G-C2). / 状态为 `published` 且规则版本已冻结（G-C2）。
2. **Given / 给定** an org outside the audience / 组织不在活动客户范围内, **When / 当** it opens campaign APIs/UI / 其打开活动接口或页面, **Then / 则** it cannot submit a receipt (G-C1). / 无法提交回执（G-C1）。

---

### User Story 2 — Submit sealed intent / 用户故事 2 — 提交密封意向 (Priority / 优先级: P1)

小b 下载模板、填写并上传、提交回执；截止后不可再投；评审前看不到他人报价。  
小b downloads the template, fills/uploads, submits; no new bids after deadline; peer bids sealed until review ends.

**Why this priority / 为何优先**: This is the buyer-side half of the MVP loop. / 这是 MVP 买方侧主路径。

**Independent Test / 独立验收**: Submit with attachment before deadline succeeds; after deadline fails (G-C3/G-C4/G-C5). / 截止前带附件提交成功；截止后失败（G-C3/G-C4/G-C5）。

**Acceptance Scenarios / 验收场景**:

1. **Given / 给定** an open campaign / 活动开放投递中, **When / 当** customer submits without required attachment / 客户未附必备附件即提交, **Then / 则** rejected (G-C3). / 拒绝（G-C3）。
2. **Given / 给定** deadline passed / 已过截止时间, **When / 当** customer submits or amends price / 客户仍提交或改价, **Then / 则** rejected (G-C4). / 拒绝（G-C4）。

---

### User Story 3 — Dual review then deposit / 用户故事 3 — 双审后再预付 (Priority / 优先级: P1)

运营核对 → 销售确认（法务可选）→ 待预付 → 财务确认到账；每步记人记时。  
Ops review → sales confirm (legal optional) → await deposit → finance confirms funds; each step records actor and time.

**Why this priority / 为何优先**: Large-ticket deals need accountable human gates. / 大额交易必须可追责的人工门禁。

**Independent Test / 独立验收**: Receipt cannot reach “deposit confirmed” without both required sign-offs and finance confirm (G-M1–G-M3, G-M5). / 缺少必审签核或财务确认时，回执不能到达「预付已确认」（G-M1–G-M3、G-M5）。

**Acceptance Scenarios / 验收场景**:

1. **Given / 给定** a submitted receipt / 已提交回执, **When / 当** only ops approves / 仅运营通过, **Then / 则** sales step still required (G-M1). / 仍须销售步骤（G-M1）。
2. **Given / 给定** deposit not confirmed / 预付未确认, **When / 当** user tries to create fulfilable order / ship / 试图建可履约订单或发货, **Then / 则** blocked (G-M3). / 阻断（G-M3）。

---

### User Story 4 — Allocate, convert, ship under gates / 用户故事 4 — 分配、转单、门禁下发货 (Priority / 优先级: P2)

大B 公布中选/落选；中选确认采购承诺（G-C6）；转订单；仅当 G-S1 清单通过且售后角色才可发货。  
大B publishes win/lose; winners confirm purchase commitment (G-C6); convert to order; ship only if G-S1 checklist passes and after-sales role acts.

**Why this priority / 为何优先**: Completes money–goods–accountability; can follow P1 stories. / 完成钱货人闭环；可接在 P1 故事之后。

**Independent Test / 独立验收**: Ship without deposit or missing attachment fails; with full checklist succeeds; cancel/lose frees stock (G-S*). / 无预付或缺附件时发货失败；清单齐全则成功；取消/落选释放库存（G-S*）。

**Acceptance Scenarios / 验收场景**:

1. **Given / 给定** G-S1 incomplete / G-S1 清单未齐, **When / 当** after-sales creates shipment / 售后创建发货单, **Then / 则** refused (G-S1/G-S2). / 拒绝（G-S1/G-S2）。
2. **Given / 给定** loser or cancel / 落选或取消, **When / 当** transition completes / 状态迁移完成, **Then / 则** reserved qty released and audited (G-S5). / 预留数量释放并记审计（G-S5）。

---

### Edge Cases / 边界情况

- Resubmit after reject; duplicate receipt per org per campaign (policy: one active receipt). / 驳回后可再投；同一组织同一活动默认仅一份有效回执。
- Concurrent submits near deadline. / 截止时刻附近的并发提交。
- Module `bidding` off → no campaign routes/UI (Constitution XVII). / 模块关闭则无活动路由/界面（宪章 XVII）。
- Must not use RFQ approve/convert as substitute for BidReceipt. / 禁止用 RFQ 审批/转单冒充竞价回执。

## Requirements / 需求 *(mandatory / 必填)*

### Functional / 功能需求

- **FR-001**: New module `bidding` owns Campaign, RuleVersion, BidReceipt, AllocationResult, approval steps; does not fork `quote_requests`. / 新建模块 `bidding` 拥有活动、规则版本、回执、分配结果、审批步骤；不叉改 `quote_requests`。
- **FR-002**: Campaign state machine per PRO §4.4 A; BidReceipt per §4.4 B; fulfilment gates on orders/payments/shipments per §4.4 C + G-S*. / 活动状态机见 PRO §4.4 A；回执见 §4.4 B；履约门禁落在订单/收款/发货，见 §4.4 C + G-S*。
- **FR-003**: Enforce G-C1…G-C6, G-M1…G-M5, G-S1…G-S5 in backend (not remarks-only). / 后端强制执行上述门禁（禁止只靠备注）。
- **FR-004**: Trade id links campaign → receipt → payment → order → shipment. / 交易编号串联活动→回执→收款→订单→发货。
- **FR-005**: Admin UI: campaign desk + receipt review; Storefront: list/detail/submit/status (non-cart primary nav for this flow). / 大B：活动台+回执审核；小b：列表/详情/提交/状态（本流程不以购物车为主导航）。
- **FR-006**: Reuse catalog, organizations, document_templates/assets, orders, payments, shipments, audit/Command Bus. / 复用目录、组织、文档模板/资产、订单、收款、发货、审计/命令总线。
- **FR-007**: MVP excludes mini-program, live ascending auction, card gateways, deep courier integration. / MVP 不含小程序、公开升价拍卖、卡付网关、深度快递对接。

### Non-goals (MVP) / 非目标（MVP）

- 小c WeChat mini-program. / 小c 微信小程序。
- Public realtime auction. / 公开实时拍卖。
- Treating RFQ as the bidding model. / 把 RFQ 当作竞价主模型。
- Rewriting platform kernel for cart metaphors. / 为迁就购物车隐喻而改写平台内核。

## Success Criteria / 成功标准

- End-to-end path in PRO §6.2 passes on channel `default`. / 在渠道 `default` 上跑通 PRO §6.2 端到端路径。
- Checklist `pro_doc/acceptance-checklist-mvp.md` bidding section can be ticked. / `acceptance-checklist-mvp.md` 中竞价相关项可勾选通过。
- Off-state: switching `bidding` off removes surfaces (except activation control). / 关闭 `bidding` 后相关界面/API 消失（激活开关本身除外）。

## Assumptions / 假设

- Seller-operated scarce stock (Mobii), not buyer RFx. / 卖方主导稀缺库存（Mobii），非买方寻源招投标。
- Local/dev sales channel code `default` (Batch A). / 本地/开发销售渠道码为 `default`（批次 A）。
- Overlay `apps/mobii` deferred; implement as module package first. / 暂缓 `apps/mobii` overlay；先做模块包实现。
