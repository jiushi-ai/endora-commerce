# Implementation Plan / 实现计划: 165-mobii-bidding

**Spec / 规格**: `specs/165-mobii-bidding/spec.md`  
**Created / 创建**: 2026-10-30  
**Status / 状态**: Approved (Batch C in progress) / 已批准（批次 C 进行中）

## Summary / 摘要

Add module `bidding` for scarce-stock campaigns and sealed bid receipts; extend admin roles / org owners in P1; gate payments/orders/shipments in P3. Storefront and Admin UIs for campaign + receipt. No RFQ reuse as primary model; no mini-program in MVP. / 新增 `bidding` 模块承载稀缺活动与密封回执；P1 扩展角色/对接人；P3 为收款/订单/发货加门禁。大B/小b 提供活动与回执界面。不以 RFQ 作主模型；MVP 不含小程序。

## Phases / 阶段 (map to PRO §六 / batches C–E / 对应 PRO §六与批次 C–E)

| Phase / 阶段 | Batch / 批次 | Deliver / 交付 |
| --- | --- | --- |
| P1 foundation / 底座 | C | Role seeds, typed org owners, catalog/CMS conventions, optional weaken cart-first nav / 角色种子、分类型对接人、货品/CMS 约定、可选弱化购物车主路径 |
| P2 bidding MVP / 竞价 MVP | D | `bidding` entities/APIs/UI; campaign+receipt+sign-off; thin link to order / 实体/API/界面；活动+回执+签核；薄接到订单 |
| P3 fulfilment gates / 履约门禁 | E | Deposit confirm, trade id, G-S1 ship gate, release stock, E2E / 预付确认、交易编号、发货门禁、释放库存、端到端 |

## Technical approach / 技术路径

- **Module layout / 模块布局**: `packages/modules/bidding/` per AGENTS module map (manifest, backend, migrations, admin, i18n, docs, colocated tests). / 按 AGENTS 模块地图（清单、后端、迁移、管理端、i18n、文档、同列测试）。
- **Writes / 写操作**: Command Bus for audited mutations (publish, approve, allocate, convert). / 经命令总线的可审计变更（发布、审批、分配、转单）。
- **Tenancy / 租户**: Campaign platform-scoped; receipts org-scoped via TenantContext. / 活动为平台级；回执经 TenantContext 按组织隔离。
- **Channel / 渠道**: Campaigns and catalog visibility on request sales channel (`default` in Mobii local). / 活动与目录可见性跟请求销售渠道（Mobii 本地为 `default`）。
- **Documents / 文档**: Intent template via `document_templates` / `assets_library` upload on receipt. / 意向模板走文档模板；回执附件走资产库上传。
- **Contracts / 契约**: Zod in `@endora-commerce/contracts` (see `contracts/`). / Zod 契约落在 contracts 包（见本目录 `contracts/`）。

## Complexity / dependencies / 复杂度与依赖

- No new runtime dependency planned (Constitution IV). / 计划不新增运行时依赖（宪章 IV）。
- Depends on existing: organizations, catalog, inventory, payments, orders, shipments, admin_roles, audit, assets/document_templates. / 依赖既有：组织、目录、库存、收款、订单、发货、角色、审计、资产/文档模板。
- Optional: crm/tasks for offline chase. / 可选：CRM/任务用于线下跟进。

## Risks / 风险

| Risk / 风险 | Mitigation / 缓解 |
| --- | --- |
| Accidental RFQ coupling / 误与 RFQ 耦合 | Explicit non-goal; CI/docs; separate permission codes / 明确非目标；文档/检查；独立权限码 |
| Gate bypass via raw order APIs / 经裸订单 API 绕过门禁 | Central checklist before shipment create / 发货创建前统一清单检查 |
| Channel mismatch / 渠道不一致 | P0 convention + env defaults / P0 约定 + 环境默认值 |

## Out of scope here / 本文范围外

Implementing production code (starts after tasks approved). Overlay `mobii` shell. / 实现生产代码（任务批准后开始）。`mobii` overlay 壳。
