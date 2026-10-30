# Data model / 数据模型: 165-mobii-bidding

## Entities / 实体 (module `bidding`)

### Campaign / 竞价活动

| Field / 字段 | Notes / 说明 |
| --- | --- |
| id | UUID |
| code / title | Operator-facing / 运营可见编码与标题 |
| status | draft → published → closed_for_bids → allocated → closed \| cancelled / 草稿→已发布→已截止投递→已分配→已关闭\|已取消 |
| productVariantId / qty | Scarce stock offered / 稀缺货品变体与数量 |
| salesChannelId | Visibility / 可见销售渠道 |
| audience | customer group ids and/or org allow-list / 客户分组和/或组织白名单 |
| opensAt / closesAt | Bid window / 投递时间窗 |
| currentRuleVersionId | Frozen on publish / 发布时冻结的当前规则版本 |
| intentTemplateAssetId | Downloadable intent template / 可下载意向书模板资产 |
| createdByAdminUserId | Creating admin / 创建人（管理员） |

### CampaignRuleVersion / 活动规则版本

| Field / 字段 | Notes / 说明 |
| --- | --- |
| id | UUID |
| campaignId | Parent campaign / 所属活动 |
| version | monotonic / 单调递增版本号 |
| minUnitPrice / currency | Floor price / 最低单价与币种 |
| maxQtyPerOrg / minQty | Qty bounds / 每组织上限与下限 |
| depositPercent or depositAmount | Prepay rule / 预付比例或固定额 |
| payloadJson | other published rules snapshot / 其余已发布规则快照 |

### BidReceipt / 竞价回执（意向单）

| Field / 字段 | Notes / 说明 |
| --- | --- |
| id | UUID |
| campaignId | Parent campaign / 所属活动 |
| organizationId | tenant / 租户组织 |
| ruleVersionId | G-C2 / 绑定规则版本 |
| status | submitted → ops_review → sales_review → [legal_review] → await_deposit → deposit_confirmed → won_pending_fulfilment → converted \| rejected \| withdrawn \| lost \| expired / 已提交→运营审→销售审→[法务]→待预付→预付已确认→中选待履约→已转单\|驳回\|撤回\|落选\|逾期 |
| bidUnitPrice / bidQty | sealed from peers until allocated / 分配前对同侪密封 |
| attachmentAssetIds | G-C3 / 必备附件 |
| tradeId | set when entering fulfilable path (G-M4) / 进入可履约路径时写入 |
| orderId | set on convert / 转订单时写入 |

### BidApprovalStep / 回执审批步骤

| Field / 字段 | Notes / 说明 |
| --- | --- |
| receiptId | Parent receipt / 所属回执 |
| step | ops \| sales \| legal \| finance_deposit / 运营\|销售\|法务\|财务预付 |
| actorAdminUserId | Who decided / 操作管理员 |
| decidedAt | When / 决定时间 |
| decision | approve \| reject / 通过\|驳回 |
| note | optional; not a substitute for decision / 可选备注；不能代替正式决定 |

### AllocationResult / 分配结果

| Field / 字段 | Notes / 说明 |
| --- | --- |
| campaignId | Parent campaign / 所属活动 |
| receiptId | Linked receipt / 关联回执 |
| outcome | won \| lost \| waitlist / 中选\|落选\|候补 |
| allocatedQty | Qty awarded / 分配数量 |
| decidedByAdminUserId / at | Who/when / 决定人与时间 |

## Links outside module / 模块外关联

- **Inventory / 库存**: reservation / release on allocate / cancel (G-S3/G-S5) via inventory ports. / 分配/取消时经库存端口预留或释放。
- **Payment / 收款**: deposit receivable + manual receive → finance step. / 预付应收 + 人工确认到账 → 财务步骤。
- **Order / Shipment / 订单·发货**: convert creates order; shipment create calls bidding checklist port. / 转单创建订单；创建发货时调用竞价清单端口。

## State machines / 状态机

See PRO.md §4.4; this file owns persistence columns only — transitions enforced in services. / 见 PRO.md §4.4；本文件只定持久化字段，迁移规则在服务层强制。
