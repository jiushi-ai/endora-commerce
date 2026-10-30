# Research / 调研决策: 165-mobii-bidding

## Decision / 决策: new `bidding` module, not RFQ stretch / 新建 `bidding` 模块，不硬拧 RFQ

**Choice / 选择**: Own Campaign / BidReceipt domain in `bidding`. / 在 `bidding` 中自有活动与回执领域。  
**Why / 原因**: Endora `quote_requests` is customer-initiated negotiation (one org, seller offer PDF). Mobii is platform-published scarce allocation (one campaign, many sealed intents). Force-fitting RFQ inverts initiator and cardinality. / Endora 询价是客户发起、一单一客户、卖方报价 PDF；Mobii 是平台发布稀缺分配、一活动多密封意向。硬拧会颠倒发起方与一对多关系。  
**Rejected / 否决**: Rename RFQ statuses to look like bidding; shadow RFQ tables. / 仅改 RFQ 状态名冒充竞价；或影子复制 RFQ 表。

## Decision / 决策: channel `default` for greenfield / 干净库使用渠道 `default`

**Choice / 选择**: Align storefront + backend on `default`. / 店面与后端统一为 `default`。  
**Why / 原因**: Empty `setup` DB creates system-default `default`; `.env.example` historically said `pl_default` (demo shape) and caused UNKNOWN_SALES_CHANNEL. / 空库 setup 后系统默认渠道是 `default`；历史示例写 `pl_default`（演示形态）会导致未知销售渠道错误。  
**Rejected / 否决**: Require demo seed before any storefront use. / 必须先灌演示数据才能用店面。

## Decision / 决策: defer `apps/mobii` overlay / 暂缓 mobii overlay 壳

**Choice / 选择**: Spec and first implementation as a normal module package. / 规格与首版实现按普通模块包落地。  
**Why / 原因**: Overlay is for deployment-specific decoration; core bidding rules are product. Shell can wait until role seeds / module-off lists are deployment-specific. / Overlay 用于部署级装饰；竞价核心规则属于产品本身。角色种子/关模块清单若需按部署区分时再开壳。  
**Rejected / 否决**: Block Batch B on overlay scaffolding. / 因未建 overlay 而卡住批次 B。

## Decision / 决策: fulfilment via existing orders/payments/shipments + gates / 履约复用订单/收款/发货并加门禁

**Choice / 选择**: After allocation, create/link Order; deposit confirm extends payment receive; ship blocked by checklist port. / 分配后创建/关联订单；预付确认扩展收款确认；发货由清单端口阻断。  
**Why / 原因**: Reuse ledger and admin UX; gates encode PRO G-M*/G-S*. / 复用账本与管理端体验；门禁编码 PRO 的 G-M*/G-S*。  
**Rejected / 否决**: Separate parallel “shipping” tables outside shipments module. / 在 shipments 外另建平行发货表。
