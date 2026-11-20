# 2026-11-20-chat3-Feature85-account-i18n融合方案步骤 会话沟通记录

用途：将开源 debt/issue **#85**（storefront account 区 i18n + `codeLabel`）按与 167/168 相同的 cherry-pick 模式合入本地；编号对标开源 **85**。
范围：方案确认 + 操作步骤（执行以本文件 §推荐操作步骤 为准）。
对照： [2026-11-11-chat2-cherry-pick-168](../../2026-11-11-chat2-cherry-pick-168/2026-11-11-chat2-cherry-pick-168.md)、[2026-11-13-chat1-Feature167融合方案步骤](../../2026-11-13-chat1-Feature167融合方案步骤/2026-11-13-chat1-Feature167融合方案步骤.md)。

---

## chat ask

时间：2026-11-20 00:00

选 B：对标开源 demo 三类（枚举码 → `codeLabel`；后台多语言名 → `resolveOrderStatusLabel`；个别领域少量专用 label）。
按 167/168 模式新开分支 pick；pick 号与开源一致。对比 `4645fffc1`、`73ea184c2`。是否就是 **85 pick**？

---

## chat rep

时间：2026-11-20 00:05

### 编号结论

| 项 | 值 |
| --- | --- |
| 开源编号 | **Issue / debt `#85`**（不是 specs Feature 085） |
| 对外称呼 | **85 pick**（与 167/168 一样跟开源数字） |
| 建议分支 | `feat/storefront-85-from-upstream` |
| 基础 tip | `feat/batch-44-invoice-pdf-locale`（已含批次 47/48） |
| 上游 remote | `upstream` → `endora-commerce/endora-commerce` |
| 核心提交 | 见下表（**不要** pick merge 提交 `c113253da`） |

### 与 167/168 的差异（心里有数）

- 167/168 = **Feature** 号；85 = **GitHub debt/issue** 号。称呼仍统一「85」。
- #85 是一条史诗：account / auth / chrome / commerce / content 多 PR。**本次默认只合 account 切片**（`codeLabel` + account 页枚举与壳层），不一次吞掉整个 #85。
- 你们已有单文件 `messages.ts` + zh-CN/zh-TW；上游先把 catalogue **拆 namespace**。冲突会集中在 `messages*`。

### 建议 cherry-pick 顺序（功能提交，非 merge）

| 顺序 | Commit | 说明 |
| --- | --- | --- |
| 1（依赖） | `30d0e3ba7` | Storefront i18n: split catalogue into per-area namespaces |
| 2（主刀） | `4645fffc1` | account 全量 key + 引入 `lib/account/labels.tsx` / `codeLabel`（Part of #85） |
| 3（术语） | `85880a87c` | settle the #85 terminology rulings（建议带） |
| 4（收尾） | `73ea184c2` | finish the #85 cross-area wiring and terminology |

合并 PR 仅作对照：`c113253da` Merge PR #588 `debt/85-sf-account` — **勿 cherry-pick merge**。

### 三类能力落地（合入后应对齐 demo）

1. **枚举码** → `codeLabel(t, prefix, code)`（支付、购物车状态、地址 kind、退货 kind…）
2. **后台多语言名字** → `resolveOrderStatusLabel`（订单履约 `statusName`，含短码回退）
3. **个别领域** → `quoteRequestStatusLabel` / event label 等少量专用（与上游 `labels.tsx` 一致）

批次 48 的 `paymentStatusLabel` / `orderStatusLabel`：合入后支付列改为 `codeLabel`；履约状态保留 resolve + 必要时 catalogue 兜底，避免再扩散自定义 Label。

---

## 推荐操作步骤（对齐 167/168）

### 0. 工作区干净 + 备份点

```bash
cd ~/github/endora-commerce
git status
# 必须 clean。批次 47/48 已在 tip：0a0f00c82 时可直接继续
git branch --show-current
# 期望：feat/batch-44-invoice-pdf-locale
```

### 1. 确认 upstream 并 fetch

```bash
git remote -v
# 若无 upstream：
# git remote add upstream https://github.com/endora-commerce/endora-commerce.git

git fetch upstream master
```

### 2. 从当前 48 基础新开分支（勿在 master 试）

```bash
git checkout feat/batch-44-invoice-pdf-locale
git pull origin feat/batch-44-invoice-pdf-locale   # 若需要与远端对齐
git checkout -b feat/storefront-85-from-upstream
```

### 3. 按序 Cherry-pick（不要 pick merge）

```bash
# 1) namespace 拆分（冲突高发：messages.ts）
git cherry-pick 30d0e3ba7

# 2) account i18n + codeLabel（主刀）
git cherry-pick 4645fffc1

# 3) 术语裁定（建议）
git cherry-pick 85880a87c

# 4) 跨区接线收尾
git cherry-pick 73ea184c2
```

某一 pick 冲突时：

```bash
git status
# 原则见下表
git add <已解决文件>
git cherry-pick --continue
# 放弃本次：git cherry-pick --abort
```

若缺对象：

```bash
git fetch upstream '+refs/heads/master:refs/remotes/upstream/master'
```

### 4. 冲突时明确处理你们特有改动

| 文件/主题 | 处理 |
| --- | --- |
| `storefront/lib/i18n/messages.ts` 与拆出的 `messages/*.ts` | **接受**上游 namespace 结构；把你们 **zh-CN / zh-TW**（及批次 38–48 词条）**并入**对应 namespace，勿丢 |
| 订单 list/detail（47/48） | 支付列最终用 **`codeLabel(t, 'account.paymentStatus', …)`**（或与上游前缀对齐）；履约状态保留 **`resolveOrderStatusLabel`**；去掉仅 48 临时的 `paymentStatusLabel` 包装 |
| 询价详情（47 PL→t） | 优先接上游 `quoteRequestStatusLabel` / event label；保留中文词条 |
| Mobii 品牌 / 竞价页 / 167 URL 语系 / 168 NavigationBar | **保留本地** |
| 整仓 merge `upstream/master` | **禁止** |

### 5. 备选：冲突过多时的「最小移植」（仍记为 85 pick 分支）

若 `30d0e3ba7` 在单文件大 catalogue + 四语上冲突不可控：

1. 在本分支 **abort** 该 pick。
2. **手工移植**上游 `storefront/lib/account/labels.tsx` 的 `codeLabel`（及必要的 quote status/event helpers），适配现有 `tForLocale` / `MessageKey`（若暂不拆 namespace，用「前缀.码」键存在性检查替代 `MESSAGES['en-US']` 导出）。
3. 按上游调用点，优先改：**orders list/detail**、organization、carts、returns、AddressBook 等枚举列。
4. 词条：在现有 `messages.ts` 四语中补齐 `account.paymentStatus.*` 等（英文 **原样**对齐上游，遵守 format 保留规则）。
5. 提交说明仍标注 `pick-85` / `from upstream 4645fffc1 (adapted)`，chatlog 记录「未整提交 cherry-pick、改为最小移植」原因。

**优先仍尝试完整 cherry-pick**；最小移植是逃逸舱，不是默认。

### 6. 本地验证（先于 ECS）

```bash
pnpm --filter storefront exec vitest run test/account/i18n test/orders/status-labels.test.ts test/i18n/order-quote-detail-locale.test.ts
pnpm --filter storefront run typecheck
```

页面抽查：`/zh-cn/orders` 支付列不再是 `awaiting_payment`；`/en`/`/pl` 与 demo 行为一致。

### 7. 推送与 PR

```bash
git push -u origin feat/storefront-85-from-upstream
# PR base：按你们习惯（常为 feat/batch-44… 或 master）
```

### 8. 文档

- 本 chatlog 追加「执行记录」（每步 pick 结果、冲突文件、是否改走最小移植）。
- `pro_doc/PRO.md` §99 记批次 **49**（85 pick）。

---

## 执行前门禁（已核）

- [x] 工作区 clean（2026-11-20）：tip `0a0f00c82`（含 48.1~48.4）
- [x] 当前不在 master：在 `feat/batch-44-invoice-pdf-locale`
- [x] 已 `git fetch upstream master`
- [x] 已创建 `feat/storefront-85-from-upstream`
- [x] cherry-pick 1→4 完成或改走最小移植并记录

---

## 执行记录

时间：2026-11-20 00:04

1. `git cherry-pick 30d0e3ba7` → **冲突**  
   - `storefront/lib/i18n/messages.ts`：整文件一块冲突（HEAD 四语 monolith ≈4700 行 vs 上游 namespace router）  
   - `storefront/lib/quote-requests/describe-diff.ts`：PL 硬编码 vs `format`+t  
   - 已 staged 上游空壳 `messages/{account,auth,…}.ts`（仅 en/pl，无 zh）  
2. **判定**：强行 continue 会丢掉 zh-CN/zh-TW 与批次 38–48 词条；按 §5 **abort**。  
3. **最小移植（仍在本 85 分支）**  
   - 新增 `storefront/lib/account/labels.ts`：`codeLabel`（适配 monolith：`t` 回退到 key 则返回 raw code）  
   - 订单 list/detail：支付列 `codeLabel(t, 'order.detail.paymentStatus', …)`  
   - `orderStatusLabel`：API `statusName` 优先，否则 `codeLabel(t, 'order.status', …)`  
   - 去掉 `paymentStatusLabel` 专用包装  
   - 测试：`test/account/labels.test.ts` + 更新 status-labels；定向 vitest 12 通过  
4. **未 pick**：`4645fffc1` / `85880a87c` / `73ea184c2`（依赖 namespace 拆分）；整包 account 多页留给后续专批。

---

## 下一步

用户确认后：commit 本最小移植；可选后续专批再处理 namespace 拆分 + 全量 `4645fffc1`。
