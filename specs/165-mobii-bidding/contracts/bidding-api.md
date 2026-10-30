# Contracts draft / 契约草稿: bidding HTTP API (165)

Zod schemas will land in `@endora-commerce/contracts` during implement. Shapes below are the Batch B draft. / 实现阶段 Zod 将落入 `@endora-commerce/contracts`。下列为批次 B 草稿形状。

> API **Method / Path / 权限码 / 错误码 / Body 字段名** 保持英文标准写法，不加中英对照。 / Keep standard API spellings in English only.

## Admin / 管理端

| Method | Path | Purpose / 用途 |
| --- | --- | --- |
| POST | `/api/v1/admin/bidding/campaigns` | Create draft / 创建草稿 |
| PATCH | `/api/v1/admin/bidding/campaigns/:id` | Edit draft / 编辑草稿 |
| POST | `/api/v1/admin/bidding/campaigns/:id/publish` | Freeze rule version, open bids / 冻结规则版本并开放投递 |
| POST | `/api/v1/admin/bidding/campaigns/:id/close-bids` | Stop accepts / 停止接收回执 |
| POST | `/api/v1/admin/bidding/campaigns/:id/allocate` | Record winners/losers / 记录中选/落选 |
| GET | `/api/v1/admin/bidding/campaigns` | List / 列表 |
| GET | `/api/v1/admin/bidding/receipts` | Desk list / filters / 审核台列表与筛选 |
| POST | `/api/v1/admin/bidding/receipts/:id/approve` | Body: `{ step, note? }` / 审批通过 |
| POST | `/api/v1/admin/bidding/receipts/:id/reject` | Reject / 驳回 |
| POST | `/api/v1/admin/bidding/receipts/:id/confirm-deposit` | Finance / 财务确认预付 |
| POST | `/api/v1/admin/bidding/receipts/:id/convert-to-order` | After deposit + win / 预付且中选后转订单 |

Permissions (indicative) / 权限码（示意）: `bidding:campaigns:write`, `bidding:receipts:review`, `bidding:deposit:confirm`, `bidding:allocate`.

## Storefront (customer session) / 店面（客户会话）

| Method | Path | Purpose / 用途 |
| --- | --- | --- |
| GET | `/api/v1/bidding/campaigns` | Visible open/allocated campaigns / 可见的开放或已分配活动 |
| GET | `/api/v1/bidding/campaigns/:id` | Detail + own receipt summary / 详情 + 本组织回执摘要 |
| POST | `/api/v1/bidding/campaigns/:id/receipts` | Submit intent + attachments / 提交意向与附件 |
| GET | `/api/v1/bidding/receipts/mine` | Status list / 我的回执状态列表 |

## Shared errors / 共用错误码

（代码本身保持英文；括号内为中文说明。）

- `BIDDING_NOT_ELIGIBLE` — not in audience (G-C1) / 不在客户范围
- `BIDDING_CLOSED` — past deadline (G-C4) / 已截止
- `BIDDING_ATTACHMENT_REQUIRED` — missing intent file (G-C3) / 缺意向附件
- `BIDDING_STEP_REQUIRED` — prior approval missing (G-M1) / 缺少前置审批步骤
- `BIDDING_DEPOSIT_REQUIRED` — deposit not confirmed (G-M3) / 预付未确认
- `BIDDING_SHIP_CHECKLIST_FAILED` — G-S1 checklist incomplete / 发货清单未齐

## Fulfilment seam / 履约缝合

Shipment create (existing module) must call a port e.g. `BiddingFulfilmentGate.assertShipAllowed(orderId)` when order originates from bidding trade id. / 既有发货创建在订单来自竞价交易编号时，须调用竞价履约门禁端口（示例见左）。
