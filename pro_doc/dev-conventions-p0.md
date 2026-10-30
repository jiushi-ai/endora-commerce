# Mobii-by-Endora — P0 开发约定（批次 A）

**Status**: Confirmed 2026-10-30  
**Parent**: `pro_doc/PRO.md` §八 批次 A

## 1. 销售渠道

| 项 | 约定 |
| --- | --- |
| 本地 / 干净库开发 | 店面 `NEXT_PUBLIC_SALES_CHANNEL_CODE=**default**` |
| 后端默认 | `DEFAULT_SALES_CHANNEL_CODE=default`（`backend/.env`） |
| 演示数据 | `cli demo seed` 可能使用 `pl_default`；仅在库中确有该渠道时改店面 env |
| 含义 | 销售渠道 = 对外店面/生意线，**不是**供货商（英伟达等） |

改 `NEXT_PUBLIC_*` 后须重启 `pnpm run dev`（或至少重启 storefront）。

## 2. Deployment / overlay 壳

| 项 | 约定 |
| --- | --- |
| 本阶段（A/B） | **不新建** `backend/src/apps/mobii/` 壳 |
| 竞价实现首选 | 新模块 `packages/modules/bidding`（或等价模块包） |
| 何时再建 `mobii` overlay | P1/P2 若需要「仅 Mobii 部署」的角色种子、关模块清单、文案时再开 |

## 3. 验收对照

验收以 `pro_doc/acceptance-checklist-mvp.md` 为准（由一附 + §四门禁 + §六 6.2 同步），实施中以 `specs/165-mobii-bidding/` 为工程规格源。
