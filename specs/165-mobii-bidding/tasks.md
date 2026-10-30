# Tasks / 任务清单: 165-mobii-bidding

Mapped to PRO batches C → E. TDD: failing test first where the repo pattern requires it. / 对应 PRO 批次 C→E。仓库要求处先写失败测试（TDD）。

## P1 / Batch C — Foundation / 底座

- [ ] T1 Seed admin roles: ops / sales / after-sales (+ permission codes for later bidding) / 种子管理员角色：运营/销售/售后（含后续竞价权限码）
- [ ] T2 Extend organization owners: ops + sales + after-sales assignment model/UI / 扩展组织对接人：运营+销售+售后的分配模型与界面
- [ ] T3 Offline contacts strategy (custom fields and/or CRM) documented + minimal UI / 线下联系人策略（自定义字段和/或 CRM）成文 + 最小界面
- [ ] T4 Catalog/CMS attachment conventions for high-end docs (install / after-sales / process pages) / 高端文档挂载约定（安装说明/售后/流程页）
- [ ] T5 Optionally deactivate cart-first promotions modules on Mobii deploy notes / 可选：在 Mobii 部署说明中关闭以购物车为主的促销等模块

## P2 / Batch D — Bidding MVP / 竞价最小可行产品

- [ ] T10 Module scaffold `packages/modules/bidding` (manifest, composition, migrations empty→entities) / 模块脚手架（清单、组合、迁移由空到实体）
- [ ] T11 Campaign CRUD + publish/close (Command Bus + audit) / 活动增删改查 + 发布/截止（命令总线 + 审计）
- [ ] T12 BidReceipt submit + seal + deadline enforcement / 回执提交 + 密封 + 截止强制
- [ ] T13 Approval steps ops/sales/(legal) / 审批步骤：运营/销售/（法务）
- [ ] T14 Admin campaign + receipt desk UI / 大B 活动台 + 回执审核台界面
- [ ] T15 Storefront campaign list/detail/submit/status / 小b 活动列表/详情/提交/状态
- [ ] T16 Allocate winners/losers + notify (email) / 分配中选/落选 + 邮件通知
- [ ] T17 Convert won+deposited receipt → order (thin; deposit may stub to P3) / 中选且预付后的回执转订单（可薄实现；预付完整逻辑可放到 P3）

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
