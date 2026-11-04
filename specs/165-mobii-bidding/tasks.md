# Tasks / 任务清单: 165-mobii-bidding

Mapped to PRO batches C → E. TDD: failing test first where the repo pattern requires it. / 对应 PRO 批次 C→E。仓库要求处先写失败测试（TDD）。

## P1 / Batch C — Foundation / 底座

- [x] T1 Seed admin roles: ops / sales / after-sales (existing catalogue perms; `bidding:*` deferred to D) / 种子管理员角色：运营/销售/售后（现有权限目录；`bidding:*` 延至 D）
- [x] T2 Extend organization owners: ops + sales + after-sales assignment model + API (Admin UI deferred) / 扩展组织对接人：模型+API（管理端界面后置）
- [x] T3 Offline contacts strategy (custom fields and/or CRM) documented + minimal UI / 线下联系人策略成文（见 `pro_doc/mobii-foundation-conventions.md`）
- [x] T4 Catalog/CMS attachment conventions for high-end docs / 高端文档挂载约定（同上）
- [x] T5 Optionally deactivate cart-first modules — Mobii deploy notes / 可选关闭购物车主路径模块的部署说明（同上）

## P2 / Batch D — Bidding MVP / 竞价最小可行产品

- [x] T10 Module scaffold `packages/modules/bidding` (manifest, composition, migrations→entities) / 模块脚手架（清单、组合、迁移与实体）
- [x] T11 Campaign CRUD + publish/close (audit via recordAuditFromContext) / 活动增删改查 + 发布/截止（审计）
- [x] T12 BidReceipt submit + seal + deadline enforcement / 回执提交 + 密封 + 截止强制
- [x] T13 Approval steps ops/sales/(legal) / 审批步骤：运营/销售/（法务）
- [x] T14 Admin campaign + receipt desk UI / 大B 活动台 + 回执审核台界面
- [x] T14b Admin create-draft form on campaigns desk / 活动台新建 draft 表单（D UI 补齐）
- [x] T15 Storefront campaign list/detail/submit/status (`/account/bidding`) / 小b 活动列表/详情/提交/状态
- [x] T15b Storefront account nav link to `/account/bidding` / 账户侧栏 Bidding 入口（D UI 补齐）
- [x] T16 Allocate winners/losers API (desk + email → E / T16′) / 分配 API（台面与邮件 → E / T16′）
- [x] T17 Thin convert won+deposited → tradeId stub (real Order → E / T17′) / 薄转单（真 Order → E / T17′）
- [x] T14c Intent template upload/download + signed PDF on receipts (D.9; not re-done in E) / 意向模板与签章 PDF（D.9；E 不再做该 UI）
- [x] T14d Receipts human-readable campaign/org + PDF preview/download (D.10) / 回执台人读列与 PDF 预览下载（D.10）

## P3 / Batch E — Fulfilment gates & acceptance / 履约门禁与验收

> D polish (§99 batches 5–9) already shipped create form, nav, filters/pagination, intent template UI, and receipts PDF preview. **E does not redo that UI.** Ship gate only asserts attachment-on-file.
> D 人工补齐（§99 批次 5–9）已交付建单、菜单、筛选分页、意向模板 UI、回执 PDF 预览。**E 不再做上述 UI**；发货门禁只校验附件已在档。

**Order of work / 建议执行顺序：** T17′ → T20 → T16′ → T21 → T22/T23 → T24/T25

- [x] T17′ Convert won+deposited → **real Order** (replace thin convert) / 真转订单（接替薄转单）
- [x] T20 Deposit confirm + amount check (G-M3/G-M5); desk-operable path / 预付确认 + 金额校验；台面可操作
- [x] T16′ Allocate winners/losers **desk** (email notify still deferred) / 分配中选/落选台（邮件仍后置）
- [x] T21 Trade id on receipt + order customer note + ship gate (G-M4 MVP) / 交易编号回执/订单备注/发货门禁
- [x] T22 Ship checklist gate (G-S1) **incl. intent attachment present**; shipments wired / 发货门禁含附件在档；shipments 已接线
- [x] T23 Inventory reserve via `placeOrder` on convert (allocate-time reserve deferred) / 转单时由 placeOrder 预留库存（分配时预留后置）
- [ ] T24 E2E / acceptance against `pro_doc/acceptance-checklist-mvp.md` (human) / 对照验收清单做人工业务验收
- [x] T25 Off-state coverage for `bidding` module (activation + kernel gates) / 关闭态：activation 声明 + 内核门控
- [x] T26 Campaign detail view (`/bidding/campaigns/:id`); draft editable, published+ read-only / 活动详情页；draft 可编辑，已发布只读

## Explicitly later / 明确后置

- Mini-program (小c) / 小程序（小c）
- Live auction engine / 实时升价拍卖引擎
- Overlay `apps/mobii` unless needed earlier for seeds / overlay 壳（除非更早需要部署种子）
