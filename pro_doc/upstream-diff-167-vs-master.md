# 差异清单：feat/storefront-167-from-upstream ↔ upstream/master

**日期：** 2026-11-14  
**范围：** 仅分析，**不执行 merge / Sync fork**  
**对照：** 本地/已推送 `feat/storefront-167-from-upstream` vs 远程 `upstream/master`（[endora-commerce/endora-commerce](https://github.com/endora-commerce/endora-commerce)）  
**GitHub 网页等价表述：** This branch is **57 commits ahead** and **2371 commits behind** `endora-commerce/endora-commerce:master`

测量命令（可复现）：

```bash
git fetch upstream
git rev-list --left-right --count feat/storefront-167-from-upstream...upstream/master
# → 57  2371
```

分叉点（merge-base）：`2e19e93cc`（2026-10-28）— 约等于你们 init-0 / clone 前后。

上游 tip（本次测量）：见 `git log -1 upstream/master`。  
我方 tip：含 167/168 融合、account Bidding/i18n 恢复、chatlog 等。

---

## 1. 体量一览

| 指标 | 数值 | 含义 |
| --- | --- | --- |
| ahead | **57** | 开源 master 没有的提交（Mobii bidding、自有修、挑合的 167/168 片、文档/脚本） |
| behind | **2371** | 开源在分叉后的演进（多 feature、平台、测试、i18n 缓存等） |
| 开源侧相对 merge-base 文件变更 | **~6092 files**，+53 万 / −4.5 万行量级 | 「一次总体合并」的冲突与回归面 |
| 开源发布标签（分叉后可见） | 至少 **v0.109.0、v0.110.0**（本地已 fetch 到 v0.106–v0.110） | 若要对齐，优先按 **tag** 评估，而不是盲追 tip |

**结论重申：** 适合做**路线图与分批 cherry-pick**；**不适合**一次 `merge upstream/master` 或 GitHub **Sync fork**。

---

## 2. 分类说明（A / B1 / B2）

| 类型 | 定义 | 默认处置 |
| --- | --- | --- |
| **A** | 开源有、我方无（behind 里的能力） | 按业务价值排队；需要时 cherry-pick / 合到选定 tag；不要整包 |
| **B1** | 我方有、开源无（ahead 里的产品） | **永久保留**（bidding、Mobii 壳、zh 包、生产脚本/文档） |
| **B2** | 我方已修、开源仍缺或行为不同 | **合上游时保留我方**；冲突勿盲目 theirs |

---

## 3. 类型 B1 — 我方多、建议永久保留

### 3.1 模块 / 规格

| 项 | 说明 |
| --- | --- |
| `packages/modules/bidding` | 竞价域模块（开源 modules 列表无同名包） |
| `specs/165-mobii-bidding` | Mobii 竞价规格（开源另有 `165-task-management`，**同号不同事**） |

### 3.2 产品与体验（提交主题归纳）

- 小 b：竞价主 CTA 首页、Account 竞价入口与 desk、BFF 上传 PDF 等  
- 大 B / 小 b：zh-CN / zh-TW Admin 与 storefront 文案、Mobii 品牌与「竞价批采」标题  
- 生产：ECS 上架脚本、pluginTimeout、Bindings languages 修复（见 B2）  
- 流程文档：`pro_doc/`、`chatlog/`、pick 167/168 手册  

### 3.3 已挑合进我方、开源 master 上也有的能力（勿当「开源没有」删掉）

| Feature | 我方 | 开源 master | 备注 |
| --- | --- | --- | --- |
| **167** locale-in-path | 有 `specs/167-storefront-locale-path` + 已合代码 | 有同名 specs | 我方在 168 线上合入，并**裁掉 product-scopes 依赖**；与开源完整 167 路径可能仍有细节差 |
| **168** megamenu NavigationBar | 有 `specs/168-megamenu-navigation-bar` + 合入代码 | 同有该 specs | 我方从 168 挑合；开源 master 上同主题后续可能还有修补，需按 diff 再看 |

---

## 4. 类型 B2 — 我方已修、合上游时建议保留

| 项 | 依据 | 合上游时 |
| --- | --- | --- |
| Megamenu **Bindings** 选渠道 + languages | 批次 33：`fd2725242` 等 | 冲突保留我方 UI/校验；回归 Admin Bindings |
| pick 167 后 account 侧栏 Bidding + `t()` | 批次 36：`192105ff4` | 上游 167 转换易冲成英文硬编码；保留 LocalizedLink + `t('account.nav.*')` |
| 167 合入时裁掉 **product-scopes / R19D** | 批次 35 汇总 | 开源有 `specs/163-product-data-scopes`；若整包合 163，会重新引入你们刻意去掉的依赖——需单独决策 |
| storefront 同源 BFF 竞价 PDF | 批次 26 | 生产 401 相关；合上游时勿丢 BFF 路由 |

---

## 5. 类型 A — 开源有、我方无（specs 目录级）

下列为 **仅存在于 `upstream/master:specs/`**、我方工作树没有的 feature 目录（**18** 个）。名称来自目录名，合入价值需对照你们 B2B/竞价优先级再定。

| Spec 目录 | 粗读用途（供排队，非完整规格） | 与 Mobii 关系（初判） |
| --- | --- | --- |
| `163-product-data-scopes` | 产品数据范围 / URL 等 | 高耦合平台；你们合 167 时**主动裁掉** → 慎整包合 |
| `165-task-management` | 任务管理（与 mobii-bidding **同号不同规格**） | 非竞价；按需 |
| `166-asset-reference-visibility` | 资产引用可见性 | 按需 |
| `166-mfa-totp-hardening` | MFA 加固 | 安全向；可评估 |
| `169-page-builder-contact-form` | 页面构建联系表单 | 营销向；按需 |
| `170-forms-module` | 表单模块（对应 modules：`forms`） | 新模块；按需 |
| `170-organization-roles` | 组织角色 | B2B 相关；可评估 |
| `171-blog-i18n-authors` | 博客作者 i18n | 低优先（若不用 blog） |
| `172-product-content-attributes` | 产品内容属性 | 目录向；可评估 |
| `173-b2c-address-book-merge` | B2C 地址簿 | 偏 B2C；可后置 |
| `173-registration-registry-lookup` | 注册登记查询 | 按需 |
| `174-product-editor-scope-switcher` | 产品编辑 scope 切换 | 依赖 scopes 生态；慎 |
| `175-buyer-input-custom-fields` | 买家输入自定义字段 | 可评估 |
| `175-sales-rep-reach-rule` | 销售代表触达规则 | 可评估 |
| `176-command-hooks-outbox` | Command hooks / outbox | 平台基础设施；评估后有利于稳定性 |
| `177-tax-id-scope` | 税号 scope | 按需 |
| `178-extensible-columns` | 可扩展列 | 平台；按需 |
| `179-rfq-and-customer-notifications` | RFQ + 客户通知（模块 `customer_notifications` 等） | 与询价/通知体验相关；**较值得排队** |

### 5.1 开源多出的 modules（目录级）

| 模块 | 说明 |
| --- | --- |
| `packages/modules/forms` | 与 forms-module 规格对应 |
| `packages/modules/customer_notifications` | 买家通知中心；与 179 / #238 等工作相关 |

`packages/` 顶层包名集合与我方相同（无整包只在一侧的新顶层 package）；差异主要在 **modules 内** 与大量文件内容演进。

### 5.2 开源 behind 的路径热点（相对 merge-base）

变更文件数最多的前缀（示意，非完整列表）：

- `packages/modules/**`（~2300+）
- `backend/test/**`、`admin/test/**`、`storefront/test/**`
- `packages/contracts`、`packages/platform`、`packages/cms-components`、`packages/admin-shell`
- `storefront/app|components|lib`、`docs/**`

即：即使用「只合业务模块」策略，**contracts / platform / 测试与检查**仍常被拖动——这是一次总体合并危险的根因之一。

---

## 6. 建议的同步策略（讨论用）

1. **基线保持** `feat/storefront-167-from-upstream`（或合入自有 `master` 后锁定生产 tag）。  
2. **不要** Sync fork / 一次 merge 2371。  
3. **对照** GitHub Compare 或本地 `git log merge-base..upstream/master`，结合上表 **A 排队**。  
4. **优先评估**（示例，可改）：客户通知 / RFQ（179）、组织角色（170）、MFA（166）、outbox（176）；**后置/慎合** product-data-scopes（163）及强依赖它的 174 等。  
5. **每合一项**：独立分支 → 冲突时 B1/B2 优先 → storefront/admin 冒烟 → 再进生产。  
6. **可选中期目标**：对齐某一 upstream **release tag**（如 v0.110.0）做「有界升级」，仍保留 bidding overlay，而不是追每日 tip。

---

## 7. 相关链接

- 我方分支：https://github.com/jiushi-ai/endora-commerce/tree/feat/storefront-167-from-upstream  
- 开源 master：https://github.com/endora-commerce/endora-commerce/tree/master  
- 策略讨论归档：[chatlog/2026-11-13-chat4-上游合并策略与远程分支](../chatlog/2026-11-13-chat4-上游合并策略与远程分支/2026-11-13-chat4-上游合并策略与远程分支.md)

---

*本文件由批次 37 生成；数字随 `git fetch upstream` 会变，复测时重跑文首命令。*
