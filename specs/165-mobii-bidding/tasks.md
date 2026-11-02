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
- [x] T15 Storefront campaign list/detail/submit/status (`/account/bidding`) / 小b 活动列表/详情/提交/状态
- [x] T16 Allocate winners/losers (email notify deferred to E polish) / 分配中选/落选（邮件通知延后润色）
- [x] T17 Convert won+deposited receipt → order (thin; Order row deferred to E) / 薄转单（Order 行延至 E）

## P3 / Batch E — Gates & acceptance / 门禁与验收

- [ ] T20 Deposit confirm + amount check (G-M3/G-M5) / 预付确认 + 金额校验
- [ ] T21 Trade id wiring across payment/order/shipment / 交易编号贯穿收款/订单/发货
- [ ] T22 Ship checklist gate (G-S1/G-S2) / 发货清单门禁
- [ ] T23 Inventory reserve/release (G-S3/G-S5) / 库存预留/释放
- [ ] T24 E2E / acceptance against `pro_doc/acceptance-checklist-mvp.md` / 对照验收清单做端到端验收
- [ ] T25 Off-state coverage for `bidding` module / `bidding` 关闭态覆盖

## Explicitly later / 明确后置

- Mini-program (小c) / 小程序（小c）
- Live auction engine / 实时升价拍卖引擎
- Overlay `apps/mobii` unless needed earlier for seeds / overlay 壳（除非更早需要部署种子）
