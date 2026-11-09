# Mobii_Bidding_Platform - 莫比竞价服务平台

> **架构命名约定**  
> - **Endora 架构**：上游开源平台 Endora Commerce 的既有架构与模块能力。  
> - **Mobii_Bidding_Platform_by_Endora 改造架构**（下文简称 **Mobii-by-Endora**）：在 Endora 架构之上，为「高端硬件在线竞价 / 稀缺货分配」业务做的改造蓝图（复用 + 扩展 + 新建竞价域）。二者有明确差异，不可混称为同一套产品架构。

---

## 一、我整理：研发平台背景、初步需求、建设思路 意向

### 1、平台背景、建设目的
   - 1.1 目前公司有一批高端硬件设备，如：GPU H200 设备，因为量少，但是订货客户偏多，为了公平起见，要做一个线上竞价平台，服务客户通过上线竞价获取设备，且能为公司提供维护硬件产品信息发布和客户群有深度沟通渠道，把公司产品信息能精准高效推送给意向客户，同时保证真实需求客户能最大优势下单成功，保证货品能最有效地被真实需求客户获取，提高公司订单成功率。
   - 1.2: 后期拓展：通过线上平台，可以长期维护和收集到大客户订单，且在此平台为基础，扩展其他高端商品线上销售品类，为后续业务品类的拓展提供系统基础。

### 2、竞价平台能力含：
   - 2.1：***权限角色管理：***
    平台管理员，运营人员，销售人员（负责对接客户竞价过程和商品订单取人，因为设备价格大金额，需要人工参与线下确认），售后人员（负责发货，验货）。
   - 2.2：***大客户管理：***
    大客户注册，客户公司资料，客户线下联系人信息。对接：我们平台负责人（运营+销售+售后人员，要确定：对接负责人，因为产品价格大）。
   - 2.3: ***高端货品管理：*** 
    产品品类维护（上下架数量，价格维护），因为是高端产品，所以需要附带高端多媒体，性能推文，或性能视频等，安装使用说明，售后维护规则，竞价流程，线下订单规则，发货流程等。
   - 2.4：***发布竞价业务***
    选择产品品类，产品数量，客户类型（向那些客户发起竞价要求），竞价规则（竞价价格标准（含最低价，数量，预付款等信息），意向竞价单模板，供客户下载后，在线上提交到竞价系统，在有平台运营人员+销售人员核对）。
   - 2.5：***竞价单回执处理：***
    每发布”某硬件产品-竞价业务“单后，客户会提交 [意向竞价单模板](docs/设备采购意向书03.pdf)，平台会受到竞价单反馈明细，运营人员+销售人员会按反馈“意向竞价单模板” 和客户沟通，确认线下审核和法务确认流程，以级预付款等流程。
   - 2.6： ***发货售后管理：***
    发货人员，根据线上“竞价单管理”（客户+平台运营人员+销售人员）确认结果后，在结合线下：意向竞价单模板 单，启动发货单流程。这样流程目的：保证：客户+我们自己平台审核流程信息+线下意向单据+付款信息，线上有走流程，且能对应哪个负责人审核，总体流程无误，进行发货。

### 3、系统架构 意向
   - 3.1: 按用户使用角度设计：***系统 [大B+小b+小c ] 模式***
    #### * 大B：PC web系统平台，供我们公司运营竞价平台运营管理平台，功能模块含在：***2：竞价平台能力列表***。
    #### * 小b: PC web 竞价发布平台，供大客户注册，获取竞价信息，参与竞价，提交竞价单，获取竞价结果平台。
    #### * 小c: 移动端 小程序，供所有用户注册，用于同步小b信息，方便用户在移动短，随时获取平台发布竞价信息，个人竞价单处理通知，但不含实际提交竞价处理复杂逻辑功能。
   - 3.2： 开发优先级
    #### * ***mvp：大B+小b***
    #### * ***finall: 大B+小b+小c***
    
### 4、系统核心痛点 → 必须有的状态机 / 门禁清单

> 本节把 4.1～4.3 的业务风险，落成 **Mobii-by-Endora 必须实现的状态机与硬门禁**（系统规范人流程，而不是靠备注）。

#### 4.0 业务定位澄清（相对市场常见「竞价」）

| 维度 | 常见采购/招投标平台 | 本平台（Mobii） |
| --- | --- | --- |
| 主导方 | 多为买方寻源、多供应商竞标 | **卖方握有稀缺库存**，多大客户竞争获取配额 |
| 目标 | 往往偏「价低者得 / 合规寻源」 | **真实需求优先 + 可履约 + 可追责**，不只抬价 |
| 成交形态 | 常线上自动定标 | **人工审核 + 法务 + 预付** 后才履约 |

因此 MVP 采用：**需求申报 / 密封意向 + 资格审核 + 竞争性分配**，而不是公开实时升价拍卖。

#### 4.1 防「假意向 / 轰抢后退单」——客户与回执侧门禁

| 编号 | 门禁 / 状态约束 | 说明 |
| --- | --- | --- |
| G-C1 | 未准入客户不可见或不可投指定活动 | 客户组织须过资质审核；活动可指定客户类型/分组 |
| G-C2 | 回执须绑定活动规则版本 | 最低价、数量上限、预付比例等以活动发布时规则为准 |
| G-C3 | 意向单附件必填才可提交 | 下载模板 → 填写 → 上传（或结构化字段 + 盖章件） |
| G-C4 | 截止后禁止新回执 / 改价 | 截止时间由系统强制 |
| G-C5 | 同行报价对客户默认密封 | 评审结束前小b 不可见他人报价明细 |
| G-C6 | 中选后须确认「采购承诺」才进入履约 | 拒绝或超时 → 释放配额，可候补 |

#### 4.2 钱货人一致——审批与资金门禁

| 编号 | 门禁 / 状态约束 | 说明 |
| --- | --- | --- |
| G-M1 | 回执多角色签核 | 至少：运营核对 + 销售确认；法务确认可配置为必选 |
| G-M2 | 每步签核记人、记时、记前后状态 | 写入审计；禁止「只写备注已确认」 |
| G-M3 | 预付/定金未财务确认 → 不可建可履约订单或不可发货 | 银行转账等须财务（或授权角色）确认到账 |
| G-M4 | 一笔成交唯一交易编号 | 串联：活动 → 回执 → 合同/意向附件 → 收款 → 订单 → 发货 |
| G-M5 | 金额校验 | 应收（规则算出）与实收不一致时阻断发货 |

#### 4.3 发货与责任追溯——履约门禁

| 编号 | 门禁 / 状态约束 | 说明 |
| --- | --- | --- |
| G-S1 | 发货前置检查清单全部通过 | 回执通过 + 意向附件在档 + 款项确认 + 库存锁定 |
| G-S2 | 仅售后（或授权角色）可创建发货 | 与销售/运营权限分离 |
| G-S3 | 库存锁定与活动配额一致 | 超额分配系统拒绝 |
| G-S4 | 全程可查责任人 | 组织对接人（运营/销售/售后）+ 各节点审批人可追溯 |
| G-S5 | 取消/逾期/落选释放库存 | 状态回退有审计，避免「货已被占、人找不到」 |

#### 4.4 主状态机（MVP 必须落地）

**A. 竞价活动（Campaign）**

`草稿 → 已发布(开放投递) → 已截止(评审中) → 已分配(公布结果) → 已关闭`  
旁路：`已取消`（须记操作人与原因）。

**B. 竞价回执 / 意向单（BidReceipt）**

`已提交 → 运营审核中 → 销售确认中 → [法务确认中] → 待预付 → 预付已确认 → 已中选待履约 → 已转订单`  
旁路：`已驳回` / `已撤回` / `已落选` / `已逾期取消`。

**C. 履约（复用 Endora 订单/收款/发货，加门禁）**

`可履约订单 → 待收款/部分收款 → 收款满足发货条件 → 已发货 → 已签收`  
**硬规则：未满足 G-S1 不得进入「已发货」。**

---

## 一附、Endora 改造范围说明书（模块清单 + MVP 边界）

> 决策已确认：**基于 Endora 改造，新建竞价模块**；不以硬改 `quote_requests`（RFQ）冒充竞价。  
> ChatGPT 独立方案（`pro_doc/docs/PRD-by-chatgpt.md`）仅作业务/风控参考，不作从零技术蓝图。

### A. 端映射

| Mobii 端 | Endora 表面 | MVP |
| --- | --- | --- |
| 大B | Admin（`admin` + `admin-shell`） | ✅ 必做 |
| 小b | Storefront（组织登录 + 新竞价页面） | ✅ 必做 |
| 小c | 无现成客户端 | ❌ 不做；预留 API/通知 |

### B. 模块处置清单

| 处置 | Endora 模块 / 能力 | Mobii-by-Endora 用途 |
| --- | --- | --- |
| **复用** | `admin_roles` / `admin_users` | 大B RBAC 引擎 |
| **复用** | `organizations` / `customers` / `customer_accounts` | 大客户租户、注册、审核 |
| **复用** | `catalog` / `inventory` / `price_lists` | 货品、库存、价格 |
| **复用** | `cms` / `blog` / `assets_library` | 性能文案、视频、流程说明、附件 |
| **复用** | `document_templates` | 意向书/规则 PDF 模板 |
| **复用** | `orders` / `payments` / `shipments` / `delivery_methods` | 中选后履约 |
| **复用** | `audit_logs` + Command Bus | 操作审计底座 |
| **复用（可选）** | `crm` / `tasks` | 线下跟进、法务任务 |
| **扩展** | `organizations` | 运营/销售/售后多类型对接人；线下联系人 |
| **扩展** | `admin_roles` | 种子角色：平台管理员、运营、销售、售后 + 竞价/发货权限码 |
| **扩展** | `payments` / `orders` / `shipments` | 预付确认、发货硬门禁（G-M* / G-S*） |
| **扩展** | `customer_groups`（或等价分组） | 活动「客户类型」定向 |
| **新建** | **`bidding`（建议模块 id）** | 活动、规则版本、回执、签核状态机、分配结果、转订单 |
| **新建 UI** | 大B 竞价台 / 小b 活动与意向页 | 非购物车主路径 |
| **保留但非主路径** | `quote_requests` | 可选：中选后议价或普通询价；**禁止当作竞价主模型** |
| **弱化/可关** | 强购物车促销、无关增长模块等 | 按部署需要关闭，避免干扰竞价主流程 |

### C. MVP 边界（做 / 不做）

**做**

1. 大B：角色、大客户、货品内容、发布活动、回执审核台、预付确认、触发履约、发货门禁。  
2. 小b：注册/登录、活动列表与详情、下载模板、提交意向回执、查看状态与结果。  
3. 状态机 A/B/C 与门禁 G-C* / G-M* / G-S* 的系统强制。  
4. 唯一交易编号串联活动→回执→收款→订单→发货。

**不做（MVP 外）**

1. 小c 小程序。  
2. 公开实时升价拍卖、复杂自动分配引擎（可后续配置策略）。  
3. 在线卡付网关 / 承运商深度对接（可用银行转账 + 人工确认 + 基础发货单）。  
4. 改写 Endora 内核以迁就竞价（优先新模块 + overlay）。

### D. 与「独立从零」的差异摘要

| | Endora 架构（底座） | Mobii-by-Endora |
| --- | --- | --- |
| 主交易隐喻 | 目录 + 购物车/RFQ + 订单 | **稀缺活动 + 意向回执 + 签核 + 履约门禁** |
| 价格发现 | 价目表 / RFQ 议价 | 活动规则内的意向/密封申报与评审 |
| 核心新建 | — | `bidding` 域 |
| 文档定位 | 平台通用 | 本文件 §二～§七 |

---

## 二、平台名词简称

| 简称 / 术语 | 含义 |
| --- | --- |
| Mobii / Mobii_Bidding_Platform | 莫比竞价服务平台（产品名） |
| Mobii-by-Endora | 基于 Endora 的改造架构名（本文蓝图） |
| Endora | 上游 Endora Commerce 开源平台及其架构 |
| 大B | 公司侧运营管理端（对应 Endora Admin） |
| 小b | 大客户 PC Web 端（对应 Storefront 改造） |
| 小c | 移动端小程序（Final；MVP 不做） |
| Campaign / 竞价活动 | 平台发布的一次稀缺货竞争性分配活动 |
| BidReceipt / 竞价回执 / 意向单 | 客户针对某活动提交的意向竞价单据 |
| RFQ | Endora `quote_requests` 买方询价；**非**本平台竞价主模型 |
| 对接人 | 某组织在平台侧的运营/销售/售后负责人 |
| 交易编号 | 贯穿活动→回执→收款→订单→发货的唯一业务键 |
| Overlay | Endora 按部署定制层，不改核心源码的扩展方式 |

---

## 三、平台产品架构

产品形态：**同一后端 API + 两套（后三套）前端入口**，业务主线为稀缺硬件的「发布—申报—审核—履约」。

```text
                    ┌─────────────────────────────────────┐
                    │     Mobii-by-Endora（业务产品）       │
                    │  竞价活动 / 回执签核 / 履约门禁        │
                    └──────────┬──────────────┬───────────┘
           MVP ✅               │              │         Final
    ┌──────────────────┐        │        ┌─────┴──────────────┐
    │ 大B Admin Web    │        │        │ 小c 小程序（通知）   │
    │ 运营·销售·售后   │        │        └────────────────────┘
    └────────┬─────────┘        │
             │                  │
             │           ┌──────┴──────────┐
             │           │ 小b Storefront  │
             │           │ 客户竞价与意向   │
             │           └──────┬──────────┘
             └─────────┬────────┘
                       ▼
             ┌─────────────────────┐
             │ Endora Platform API │
             │ + bidding 新模块    │
             └─────────────────────┘
```

**产品原则**

1. 大B 负责规则、审核、责任人、发货放行；小b 负责申报与结果查看。  
2. 小c 只做信息同步与通知，不做复杂提交（与 §一 3.1 一致）。  
3. 内容（性能文案/视频/流程说明）服务「精准触达」，从属于货品与活动，不单独另起CMS产品。

---

## 四、平台系统架构

### 4.1 继承自 Endora 架构（不重复造）

- 模块化单体：Fastify + MikroORM + PostgreSQL；Admin / Storefront / API。  
- 组织多租户、`TenantContext`、Command Bus 审计、模块开关、overlay 定制。  
- 契约优先（Zod / contracts）。

### 4.2 Mobii-by-Endora 相对 Endora 的差异层

| 层次 | Endora 典型能力 | Mobii-by-Endora 差异 |
| --- | --- | --- |
| 领域核心 | 购物车、RFQ、标准结账 | **新增 `bidding`：活动/回执/签核/分配** |
| 小b 主导航 | 目录浏览 → 加购 | **活动中心 → 意向提交 → 状态** |
| 权限模型 | 通用 admin 权限 + 销售代表 | **运营/销售/售后职责分离 + 发货门禁权限** |
| 履约 | 订单满足即可发货 | **G-S1 清单通过才可发货** |
| 文档 | 报价 PDF 等 | **客户意向书模板 + 回执附件** |
| 部署形态 | 通用 commerce 实例 | 建议独立 deployment/overlay 名（如 `mobii`），裁剪无关模块 |

### 4.3 逻辑架构（简图）

```text
[大B Admin] [小b Storefront]     (小c 后期)
        \         /
         v       v
    HTTP API / OpenAPI
         |
    +---- platform kernel (tenancy, command bus, audit)
    +---- reused modules (org, catalog, cms, orders, payments, shipments, …)
    +---- NEW bidding module (campaign, receipt, approval, allocation)
    +---- gates on order/shipment (deposit + checklist)
         |
    PostgreSQL / Redis / Meilisearch / object storage
```

### 4.4 推荐落地方式

- **新模块**优先放在 Endora 模块体系（`packages/modules/bidding` 或 deployment overlay 模块），遵守模块边界与 Command Bus。  
- **禁止**为赶工直接改内核去耦合购物车隐喻。  
- 开发与运行环境仍按 Endora 文档（Docker 起 PG/Redis/Meilisearch 等）。

---

## 五、平台系统功能模块列表

> 对齐 §一 能力 2.1～2.6；标注相对 Endora 的处置。

| 序号 | 功能域 | 主要能力 | Endora 基座 | Mobii 改造 |
| --- | --- | --- | --- | --- |
| M1 | 权限角色 | 管理员/运营/销售/售后；权限码 | `admin_roles` | 扩展角色种子与竞价权限 |
| M2 | 大客户 | 注册、资料、线下联系人、对接人 | `organizations` 等 | 扩展多类型对接人、联系人 |
| M3 | 高端货品 | 品类、库存、价、多媒体、说明文档 | `catalog`+`cms`+`assets` | 配置内容结构与挂载规范 |
| M4 | 竞价活动 | 发布、规则、客户范围、模板、截止 | （无） | **新建 `bidding`** |
| M5 | 竞价回执 | 提交、附件、多级审核、预付确认 | 部分可参考 RFQ/模板 | **新建于 `bidding`** |
| M6 | 分配与结果 | 中选/落选、通知、转订单 | 订单可复用 | **新建分配结果 + 转订单缝** |
| M7 | 资金确认 | 预付应收/实收、财务确认 | `payments` | 扩展确认与门禁 |
| M8 | 发货售后 | 发货单、验货、责任人 | `shipments` | 扩展 G-S* 门禁 |
| M9 | 审计追溯 | 操作人、状态变更、交易编号 | `audit_logs` | 签核节点强制写审计 |
| M10 | 通知（预留） | 活动/状态通知 | `email` / 后期小程序 | MVP 可用邮件；小c Final |

**明确非主路径：** `quote_requests`（RFQ）——可选保留，不承担 M4/M5。

---

## 六、平台研发计划

### 6.1 阶段划分

| 阶段 | 目标 | 主要交付 |
| --- | --- | --- |
| **P0 基线** | 本仓库可运行 + 文档基线 | Docker 依赖、`setup`、本文档定稿、deployment/overlay 命名 |
| **P1 底座裁剪与角色** | 大B 角色与客户可用 | 角色种子、组织对接人扩展、货品+CMS 规范 |
| **P2 竞价域 MVP** | 打通一条完整链 | `bidding` 活动+回执+签核；小b 提交；大B 审核台 |
| **P3 履约门禁** | 钱货人一致 | 预付确认、转订单、发货 G-S1、交易编号串联 |
| **P4 硬化与验收** | 可试运营 | 审计核查、逾期/驳回/释放库存、E2E 验收用例 |
| **P5 Final** | 大B+小b+小c | 小程序通知与只读同步（另立需求） |

### 6.2 MVP 验收口径（最小闭环）

测试客户完成：准入 → 见活动 → 交意向单 → 运营/销售（+可选法务）通过 → 预付确认 → 生成订单 → 门禁通过后发货 → 全程可查责任人与审计。  
异常：驳回、逾期、落选释放库存、未付款不可发货。

### 6.3 工作原则

- TDD / 契约优先（遵循 Endora 工程约定）。  
- 先门禁与状态机，后锦上添花的分配算法。  
- `pro_doc/docs/PRD-by-chatgpt.md` 仅参考风控表述，实现以本文 Mobii-by-Endora 为准。

---

## 七、平台研发文档结构

```text
pro_doc/
  PRO.md                          # 本文：需求意向 + Mobii-by-Endora 蓝图（唯一产品总纲）
  docs/
    PRD-by-chatgpt.md             # 外部参考（独立方案思路）；非实施主文档
    writing-block.md              # 其他笔记
    设备采购意向书03.pdf           # 意向单模板样例（若有）
chatlog/                          # 评估与决策会话归档（如 2026-10-29-chat1-…）
```

**建议后续增补（实施前）**

| 文档 | 用途 |
| --- | --- |
| `pro_doc/Mobii-by-Endora-scope.md` | 若 PRO 过长，可拆出的范围说明书副本（可选） |
| `specs/NNN-mobii-bidding/`（或私有规格） | 按 Endora speckit：spec / plan / tasks |
| 状态机附录 | Campaign / BidReceipt 转换表与权限矩阵 |
| E2E 验收清单 | 对应 §六 6.2 |

**文档效力：** 与 Endora 上游通用文档冲突时，**业务规则以本文 Mobii-by-Endora 为准**；工程约定（模块边界、Command Bus、测试命令等）仍以仓库 `AGENTS.md` 与 `specs/conventions/` 为准。

---


## 八、执行开发任务过程文档

> 总路线图来源：`chatlog/2026-10-30-chat1-Endora-架构改造任务`（A～E）+ 本文件一附 / §四 / §六。  
> **规则：** 每批过程与产出记在对应「批次 *」下；工程规格以 `specs/165-mobii-bidding/` 为准。


### 总体任务批次规划

| 批次 | 对应阶段 | 一句话 |
| --- | --- | --- |
| **A** | P0 收口 | 钉死渠道 / 是否建 overlay 壳 / 验收清单 |
| **B** | 实施前规格 | 施工说明书：spec / plan / data-model / contracts / tasks |
| **C** | P1 底座 | 角色、对接人、货品内容规范（少量代码） |
| **D** | P2 竞价 MVP | 新建 `bidding` + 大B/小b 竞价 UI |
| **E** | P3→P4 | 预付/发货门禁 + 整链验收 |

对齐 speckit：`specify → plan → tasks → implement`（B 完成后再进 C/D 实现）。

---

### 批次 A — 收口 P0（短）

**计划项**

1. 固定开发约定：销售渠道用 `default`（或文档写明 demo/`pl_default`）
2. 确定 deployment/overlay 名（如 `mobii`）是否本阶段就要建壳
3. （可选）把「一附」同步进简短验收清单，避免和 §四门禁漂移

**执行记录（2026-10-30）**

- [x] A.1 约定本地干净库店面渠道 = **`default`**（与 `backend/.env` 的 `DEFAULT_SALES_CHANNEL_CODE` 一致）；演示/`pl_default` 仅在库中存在该渠道时使用。
- [x] A.2 已改 `storefront/.env` 与 `storefront/.env.example` → `NEXT_PUBLIC_SALES_CHANNEL_CODE=default`（改后需重启 storefront / `pnpm run dev`）。
- [x] A.3 **本阶段不建** `apps/mobii` overlay 壳；竞价先落 `packages/modules/bidding`；需要部署专属种子时再开壳。
- [x] A.4 产出文档：
  - `pro_doc/dev-conventions-p0.md` — P0 约定全文
  - `pro_doc/acceptance-checklist-mvp.md` — 验收清单（同步一附 + §四 + §6.2）

---

### 批次 B — 实施前规格（改造开工前必做）

**计划项**

1. 新建 `specs/NNN-mobii-bidding/`（或等价 slug）
2. **spec**：Campaign / BidReceipt 状态机、门禁 G-*、大B/小b 用户故事、非目标
3. **plan / data-model / contracts**：实体、API、与 orders/payments/shipments 缝
4. **tasks**：按 P1→P2→P3 拆可勾选任务（TDD）

**执行记录（2026-10-30）**

- [x] B.1 新建目录 **`specs/165-mobii-bidding/`**（序号接在 164 之后，避免碰撞）
- [x] B.2 产出：
  - `spec.md` — 用户故事、FR、非目标、门禁引用
  - `research.md` — 为何新建 bidding、不用 RFQ、渠道与 overlay 决策
  - `plan.md` — P1–P3 技术路径
  - `data-model.md` — Campaign / RuleVersion / BidReceipt / Approval / Allocation
  - `contracts/bidding-api.md` — Admin/Storefront API 草稿与错误码
  - `tasks.md` — T1–T5（C）、T10–T17（D）、T20–T25（E）
- [x] B.3 规格状态：**Draft** → 已由负责人确认，进入批次 C
- [x] B.4 规格状态更新为 **Approved**（`specs/165-mobii-bidding/spec.md` / `plan.md`）

---

### 批次 C — P1 底座（规格通过后）

**计划项**

1. 角色种子：运营 / 销售 / 售后 + 权限码  
2. 组织多类型对接人（及线下联系人策略）  
3. 货品+CMS 内容挂载规范；弱化购物车主路径（可关模块）

**执行记录（2026-11-02）**

- [x] C.1 规格标为 **Approved**；开工
- [x] C.2 T1：模块包 `packages/modules/bidding/` — boot 种子角色 `ops` / `sales` / `after_sales`（仅既有权限码；无 `bidding:*`）；`bidding.activation` 开关
- [x] C.3 T2：新表 `organization_staff_assignments` + port/API（不碰 RFQ 的 `organization_sales_rep_assignments`）；Admin UI 后置
- [x] C.4 T3/T4/T5：`pro_doc/mobii-foundation-conventions.md`（线下联系人、货品/CMS 挂载、可选关促销等模块）
- [x] C.5 `tasks.md` P1 勾选；本 §八 / §99 台账更新

---

### 批次 D — P2 竞价域 MVP（核心）

**计划项**

1. 新建模块 `bidding`（活动、规则版本、回执、签核）  
2. 大B 竞价台；小b 活动列表/提交意向/看状态  
3. 打通最小闭环（尚可不含完整发货门禁，或薄接到 P3）

**执行记录（2026-11-01）**

- [x] D.1 contracts：`packages/contracts/src/bidding.ts` + ERROR_CODES + 权限/错误码清单
- [x] D.2 实体+迁移：`bidding_campaigns` / rule_versions / `bid_receipts` / approval / allocation
- [x] D.3 Admin/Storefront API：CRUD、publish/close、submit、approve、allocate、confirm-deposit、thin convert
- [x] D.4 Admin UI：`/bidding/campaigns`、`/bidding/receipts`；Storefront：`/account/bidding`
- [x] D.5 角色种子补 `bidding:*`；`tasks.md` P2 勾选；§99 台账
- [x] D.6 UI 补齐（批次 5）：Admin Create draft 表单；Storefront 账户侧栏 Bidding 入口
- [x] D.7 UI 打磨（批次 6，方案二）：列表页 New+ / 筛选 / 分页；独立创建页 + active 商品下拉；Close bids 加深；小b Open 样式 + 分页
- [x] D.8 UI 文案/按钮（批次 7）：Close bids 对齐 Enter new（outline）；列表/创建页短词 label；`i18n:reload` 写入 DB
- [x] D.9 意向模板/附件 UI（批次 8）：Receipts 筛选分页；大B 创建上传模板 PDF；小b 下载模板 + 上传签章 PDF（替换 UUID 粘贴）
- [x] D.10 Receipts 可读性（批次 9）：Campaign code/title、Org name；Intent PDF Preview/Download

---

### 批次 E — P3 履约门禁 → P4 验收

**计划项**（2026-11-03 按 D 人工验证后重排；对照 `specs/165-mobii-bidding/tasks.md` P3）

1. **T17′** 真转订单：Convert 写出真实 Order（接替 D 薄转单）  
2. **T20** 预付确认 + 金额校验（G-M3/G-M5）；Receipts 台面路径可操作  
3. **T16′** 分配中选/落选可操作台 +（可选）邮件通知  
4. **T21** tradeId 贯穿回执→收款→订单→发货（G-M4）  
5. **T22/T23** 发货门禁 G-S1/G-S2（**含意向附件已在档**，不做模板 UI）+ 库存预留/释放 G-S3/G-S5  
6. **T24/T25** 对照 `acceptance-checklist-mvp.md` 端到端验收 + `bidding` 关闭态覆盖  

> 说明：意向书「模板上传 / 小b 下载与签章 PDF 上传」、建单/菜单/筛选分页、Receipts PDF 预览属 **批次 D（D.6–D.10 / §99 5–9）已补齐**；批次 E **不再做该 UI**，只在发货门禁中校验附件已存在。

**执行记录**

- [x] E.1 T17′ 真转订单：`cartWritePort` 播种竞价单价 + `orderPlacementPort.placeOrder`，回写 `orderId`
- [x] E.2 T20 预付金额校验：`confirm-deposit` 要求 `amountReceived` 对齐规则应收；Receipts 台面可点
- [x] E.3 T16′ Receipts 台 Mark won/lost（allocate API）；邮件通知仍后置
- [x] E.4 T21 `tradeId` 写回执 + 订单 customerNote；台面展示 Trade/Order
- [x] E.5 T22 发货门禁含附件在档；`shipments.createShipment` 在 bidding 在场时调用 gate
- [x] E.6 T23 转单路径由 `placeOrder` 预留库存（分配时预留后置）
- [x] E.7 T25 activation 声明 + 单测；T24 人工业务验收留给操作者对照清单

---

## 99、do-task.log List

### 1. Endora竞价评估归档与 PRO Mobii-by-Endora 蓝图

- [x] 1.1 按 chat-log 规则归档上一轮评估 ask/rep → `chatlog/2026-10-29-chat1-Endora竞价改造评估/`
- [x] 1.2 扩展 §4 状态机/门禁清单 + 新增「一附、Endora 改造范围说明书（模块清单 + MVP 边界）」
- [x] 1.3 完善 §二～§七为 Mobii_Bidding_Platform_by_Endora 改造架构（相对 Endora 差异）
- [x] 1.4 更新本 §99 批次记录

汇总：确认「基于 Endora 改造、新建 bidding」后，完成评估会话归档，并将 PRO 从「意向独立开发」调整为 Mobii-by-Endora 蓝图（痛点门禁、模块处置、MVP 边界、产品/系统/模块/计划/文档结构）。

feat-26-10-29 00:55:45 [1.1~1.4]：归档竞价评估 chatlog 并完善 PRO Mobii-by-Endora 蓝图

### 2. §八总计划 + 批次 A/B 落地

- [x] 2.1 将 A～E 总体批次规划写入 `PRO.md` §八，并规定过程记在各批次下
- [x] 2.2 执行批次 A：渠道 `default`、不建 mobii 壳、约定与验收文档
- [x] 2.3 执行批次 B：`specs/165-mobii-bidding/`（spec/plan/data-model/contracts/tasks/research）
- [x] 2.4 更新本 §99

汇总：§八成为执行台账；P0 约定与 MVP 验收清单落入 `pro_doc/`；竞价施工说明书落入 `specs/165-mobii-bidding/`（Draft）。本地店面 env 已改为 `default`（需重启 dev）。

feat-26-10-30 00:48:04 [2.1~2.4]：写入§八总计划并完成批次A/B规格与P0约定

### 3. 批次 C — P1 底座（角色种子 / 对接人 / 约定）

- [x] 3.1 规格标为 Approved；§八批次 C 开工记录
- [x] 3.2 T1：`packages/modules/bidding` 种子角色 ops/sales/after_sales + 注册进 backend
- [x] 3.3 T2：`organization_staff_assignments` 实体/迁移/服务/API（保留 RFQ sales-rep 表）
- [x] 3.4 T3/T4/T5：`pro_doc/mobii-foundation-conventions.md`
- [x] 3.5 更新 tasks.md / PRO §八 / 本 §99

汇总：规格 Approved；bidding 模块仅角色种子（无 bidding:*）；组织多类型对接人 API；底座约定文档落地。Admin UI / 竞价实体延至批次 D。

feat-26-11-01 19:20:16 [3.1~3.5]：完成批次C底座（角色种子、对接人API、约定文档）

### 4. 批次 D — P2 竞价 MVP（活动/回执/审核/薄转单）

- [x] 4.1 contracts：bidding Zod、错误码、权限声明
- [x] 4.2 实体+迁移 Campaign/RuleVersion/Receipt/Approval/Allocation
- [x] 4.3 T11 活动 CRUD/publish/close + 审计
- [x] 4.4 T12 回执提交/密封/截止 + 店面 API
- [x] 4.5 T13 审批 ops/sales + T16 分配（邮件延后）
- [x] 4.6 T17 薄转订单 + T14/T15 Admin/Storefront UI
- [x] 4.7 更新 tasks.md / PRO §八 / 本 §99；composer/manifests 生成

汇总：`bidding` 域 MVP 打通（活动→回执→双审→预付确认→分配→薄转单）；Admin `/bidding/*`；Storefront `/account/bidding`；Order 行创建与发货门禁完整校验留给批次 E。

feat-26-11-01 19:58:16 [4.1~4.7]：完成批次D竞价MVP（实体API界面与薄转单）

### 5. 批次 D UI 补齐 — 建单表单 + 小b 菜单入口

- [x] 5.1 Admin `/bidding/campaigns`：Create draft 表单（渠道选择 + product/variant UUID）
- [x] 5.2 Storefront 账户侧栏增加 Bidding → `/account/bidding`
- [x] 5.3 重建 `mod-bidding` admin dist；更新 §八 D.6 / 本 §99

汇总：补齐 D 薄 UI 缺口——大B 可在页面建 draft 活动再 Publish；小b 登录后可从账户菜单进入竞价页，无需手输 URL。履约门禁仍属批次 E。

feat-26-11-02 19:59:44 [5.1~5.3]：补齐竞价建单表单与小b账户Bidding菜单

### 6. 批次 D UI 打磨 — 方案二列表/创建拆分 + 筛选分页

- [x] 6.1 Admin Campaigns 列表：New+、搜索/状态筛选、PaginationFooter；Close bids 加深
- [x] 6.2 Admin 独立创建页 `/bidding/campaigns/new` + active simple 商品下拉
- [x] 6.3 Storefront Open 按钮样式（btn--dark）+ campaigns/receipts 本地分页
- [x] 6.4 重建 `mod-bidding` dist；更新 §八 D.7 / 本 §99

汇总：大B 对齐 Projects 列表交互（筛选+分页+独立 New 页）；小b 竞价台 Open CTA 与分页可读性提升。履约门禁仍属批次 E。

feat-26-11-02 23:33:13 [6.1~6.4]：竞价Admin列表筛选分页与独立创建页、Storefront Open与分页

### 7. 批次 D UI — Close bids outline + 人读短词 i18n

- [x] 7.1 Close bids 改为与订单「Enter new」同款 `variant="outline"`（去掉偏紫底）
- [x] 7.2 列表/创建页 label 改为短词（New campaign、Search、Status、Bidding code、Create…）；`pnpm --filter backend run i18n:reload`
- [x] 7.3 rebuild `mod-bidding`；更新 §八 D.8 / 本 §99

汇总：修复 Admin 显示 i18n key 的问题（新 key 需 reload 进 `translation_bundles`）；Close bids 视觉对齐订单地址模式按钮。

feat-26-11-03 00:08:14 [7.1~7.3]：竞价Close bids outline与Admin人读短词i18n

### 8. 批次 D 补齐 — Receipts 列表 + 意向模板下载/上传

- [x] 8.1 Admin `/bidding/receipts`：搜索/状态筛选 + PaginationFooter
- [x] 8.2 Admin 创建活动：`AssetFieldPicker` 上传意向模板 PDF → `intentTemplateAssetId`
- [x] 8.3 小b 提交页：下载模板 + 上传签章 PDF（`intent-template` / `intent-attachments` API）；替换 UUID 输入
- [x] 8.4 rebuild / `i18n:reload`；§八 D.9；批次 E 清单改为仅履约校验附件在档

汇总：补齐 G-C3 用户路径（模板→线下盖章→上传）；Receipts 对齐列表标准；E 不再重复做模板 UI。

feat-26-11-03 01:11:01 [8.1~8.4]：竞价Receipts筛选分页与意向模板下载上传

### 9. 批次 D — Receipts 列表可读性 + 意向 PDF 预览下载

- [x] 9.1 Admin list API 补齐 campaignCode/Title、organizationName、attachments[{id,filename,url}]
- [x] 9.2 ReceiptsPage：Campaign/Org 人读列；Intent PDF Preview/Download；按钮 title 说明
- [x] 9.3 contracts+bidding build、`i18n:reload`、backend 热重启；§八 D.10 / 本 §99

汇总：大B 回执台不再只显示 UUID；可在线预览/下载小b 签章意向 PDF。Ops approve = 运营过审；Convert = 预付确认后薄转订单。

feat-26-11-03 01:39:16 [9.1~9.3]：竞价Receipts显示活动与商户名并支持意向PDF预览下载

### 10. 批次 E — 任务清单重排（D 验证后；仅文档）

- [x] 10.1 调整 `specs/165-mobii-bidding/tasks.md`：P2 标注 D 补齐项；P3 写入 T17′/T16′ 与执行顺序
- [x] 10.2 对齐 `pro_doc/PRO.md` §八 批次 E 计划项与移出范围说明
- [x] 10.3 更新本 §99

汇总：基于 D 人工验证与批次 5–9 补齐结果，将 E 收窄为「真 Order → 预付金额 → 分配台 → tradeId → 发货/库存 → 验收/关闭态」；模板/建单/PDF 预览 UI 明确移出 E。业务代码未改。

feat-26-11-03 22:08:15 [10.1~10.3]：按D验证结果重排批次E任务清单（仅文档）

### 11. 批次 E — 履约门禁与真转订单实现

- [x] 11.1 T17′：`convertToOrder` 经 cart seed + `orderPlacementPort` 写真实 Order / `orderId`
- [x] 11.2 T20：`confirm-deposit` 金额校验 + Receipts 台输入实收
- [x] 11.3 T16′：Receipts Mark won/lost（allocate）；邮件仍后置
- [x] 11.4 T21/T22：tradeId 订单备注 + 发货门禁（含附件）+ shipments 接线
- [x] 11.5 T23/T25：placeOrder 预留库存；activation 关闭态单测；更新 tasks/PRO/docs

汇总：批次 E 工程项落地（真 Order、预付金额、分配台、tradeId、发货门禁含附件、shipments 可选调用）。T24 人工业务验收与 allocate 邮件通知仍待操作者/后置。Convert 依赖买家 one-click 默认地址与支付方式。

feat-26-11-03 22:33:03 [11.1~11.5]：完成批次E真转订单与履约门禁（发货接线）

### 12. T24 补齐 — 竞价活动详情页（draft 可编辑 / 已发布只读）

- [x] 12.1 GET `/campaigns/:id` 返回 `{ campaign, rules }`；Admin 路由 `/bidding/campaigns/:id`
- [x] 12.2 列表 code/title/View 进详情；详情可返回列表；draft 可 PATCH，非 draft 只读
- [x] 12.3 i18n en/pl；rebuild；tasks T26；本 §99

汇总：T24 人工验收发现无法查看活动详情；补齐详情页与 draft-only 编辑（与后端 update 门禁一致）。Publish / Close bids 仍在列表操作。

feat-26-11-03 23:39:56 [12.1~12.3]：竞价活动详情页（draft可编辑，已发布只读）

### 13. Admin UI 多语 — en / zh-CN / zh-TW（保留 pl 包）

- [x] 13.1 `SUPPORTED_LANGUAGES` 增加 `zh-CN`/`zh-TW`；`normalise` 先精确匹配；Admin 顶栏/Profile 选项改为 en/zh-CN/zh-TW
- [x] 13.2 全模块 + platform `_lifecycle` 新增 `zh-CN.json`/`zh-TW.json`（`pl.json` 保留）；`check:bundle-pairing` 清零
- [x] 13.3 bidding 关键中文译稿；`_i18n` 语言选项文案；contracts/platform/admin-shell build；本 §99

汇总：大B 界面语言切换改为英文/简体/繁体。字典业务语言池未改；小b 店面内容语言仍走 Dictionary，需另批若要对齐 zh-CN/zh-TW。多数模块中文包暂为英文拷贝占位，可后续分模块润色。

feat-26-11-04 00:18:02 [13.1~13.3]：Admin界面多语改为en/zh-CN/zh-TW并全量补齐语言包

### 14. Admin A0–A2 — 机翻补齐 zh-CN/zh-TW（小b 另批）

- [x] 14.1 A0：`_i18n` 机翻 zh-CN + OpenCC→zh-TW；壳层/分页/通用键人工校正（品牌名保留英文）
- [x] 14.2 A1–A2：其余 60 个模块 en→zh-CN 机翻并写 zh-TW；保留已有中文（bidding 等）；脚本 `scripts/mt-admin-i18n-zh.mjs`
- [x] 14.3 抽检侧栏/订单/CRM；`.gitignore` 忽略 `scripts/.mt-cache/`；本 §99（小b B0+B1 未做）

汇总：大B 管理端 zh-CN/zh-TW 由英文占位改为机翻（约 1.1 万键），A0 壳层关键键已人工润色。生效需后端 `i18n:reload`（或重启）。小b 店面 Dictionary/内容语言留待下一步。

feat-26-11-04 01:12:47 [14.1~14.3]：Admin A0-A2机翻补齐zh-CN/zh-TW（壳层人工校正）

### 15. 大B 品牌 — Mobii logo + 多语系平台名

- [x] 15.1 Logo：`pro_doc/docs/mobii.png` → `admin/public/brand/mobii.png`；`BrandLogo` 改为 `<img>`
- [x] 15.2 系统名 i18n：`appShell.brand.*` en / zh-CN / zh-TW（及 pl）；`i18n:reload`
- [x] 15.3 更新本 §99

汇总：侧栏品牌改为 Mobii 图 + 「Mobii / 竞价平台」分语系展示（en: Bidding；zh-CN: 竞价平台；zh-TW: 競價平台）；Logo 各语系共用。

feat-26-11-04 01:41:10 [15.1~15.3]：大B侧栏换成Mobii logo与多语系平台名

### 16. 小b B0+B1 — 默认 zh-CN，语系与页面内容同码

- [x] 16.1 languages 迁移：新建/启用 `zh-CN` 并设为平台默认；销售渠道写入 `zh-CN` 为 defaultLanguage
- [x] 16.2 默认渠道 reconciler / 店面 FALLBACK / `resolveLocale` 兜底改为 `zh-CN`；字典 CN 主语言关联
- [x] 16.3 小b `messages.ts` 补齐 `zh-CN` 壳层文案（354 键）；缺内容仍回退 `en-US`
- [x] 16.4 更新相关测试；composer:generate；本 §99

汇总：小b 默认语系与内容语言码统一为 `zh-CN`（与大B一致）。无 cookie/Accept 时落到简体；CMS/商品等按同一 locale 读，缺 `zh-CN` 译稿时回退 `en-US`。本地需跑迁移后重启 backend/storefront。

feat-26-11-04 18:25:42 [16.1~16.4]：小b默认zh-CN且语系与页面内容同码

### 17. 小b 壳层跟随语系 + zh-TW 下拉对标大B

- [x] 17.1 启用 `zh-TW`；下拉展示对标大B（英语 / 简体中文 / 繁体中文）
- [x] 17.2 Header/顶栏/分类 Mega/账户侧栏/Footer 硬编码 → `messages`（en/zh-CN/zh-TW/pl）
- [x] 17.3 迁移落地、相关测试、本 §99（CMS 首页英雄区波兰内容另批）

汇总：小b 语言开关补繁体；选项文案对齐大B。原先写死波兰/英文的壳层随 locale 切换。CMS 营销块仍可能是 PL，下批处理。

feat-26-11-04 19:35:00 [17.1~17.3]：小b壳层i18n与zh-TW下拉对标大B

### 18. 小b 语言下拉对标大B + 首页壳层 i18n

- [x] 18.1 语言下拉：旗帜 + EN/ZH-CN/ZH-TW + 中文名（`LocaleSwitcher` / `language-labels`）
- [x] 18.2 首页 `page.tsx` Industria 硬编码（英雄区/分区）→ `messages` `home.*`（en/zh-CN/zh-TW/pl）
- [x] 18.3 抽检测试 `test/i18n/home-locale.test.ts`；本 §99

汇总：小b 下拉视觉对齐大B LanguagePicker；图3红框范围内的代码硬编码波兰文全部改随语系壳层 i18n。真 CMS 首页营销块仍走 CMS 译稿，不在本批。需重启 storefront 后验证。

feat-26-11-04 22:56:11 [18.1~18.3]：小b下拉对标大B且首页壳层随语系

### 19. PDP/Catalog 蓝框壳层 i18n + 语系下拉样式

- [x] 19.1 PDP：放大 / 购物清单 / 对比 → `messages`（`gallery.zoom`、`card.list.*`、`compare.add/remove`）
- [x] 19.2 Catalog：计数 / 排序 / 每页 / `od·brutto` → `messages`；`ProductCard`/`ProductRow`/`CatalogToolbar`
- [x] 19.3 小b语系下拉：去掉选项黑边框，选中/悬停灰底对齐大B
- [x] 19.4 抽检测试；本 §99

汇总：图1/图2蓝框硬编码波兰文改为随 locale；语系菜单 CSS 对齐图5（无项边框 + 选中灰底）。需硬刷新/重启 storefront 验证。

feat-26-11-04 23:20:54 [19.1~19.4]：PDP与Catalog壳层i18n及语系下拉样式对齐

### 20. Account 侧栏各菜单进入页壳层 i18n

- [x] 20.1 个人资料 / 修改密码 → `account.profile.*` / `account.password.*`
- [x] 20.2 我的地址 / 订单 / 退货列表 → `account.addresses.*` / `orders.*` / `returns.*`
- [x] 20.3 询价单 / 竞价 / 采购清单 → `account.rfq.*` / `bidding.*` / `lists.*`（快速下单此前已接）
- [x] 20.4 组织 / 组织地址 / 成员 → `account.org.*` / `members.*`
- [x] 20.5 抽检测试 `test/i18n/account-locale.test.ts`；本 §99

汇总：`/account` 侧栏对应列表/表单进入页壳层（标题、列头、按钮、空态、角色/双因素等）随 locale；业务数据与后端原样错误句不翻译。部分详情深页（如退货会话、订单明细内残余英文）可后续再扫。

feat-26-11-04 23:40:06 [20.1~20.5]：Account侧栏各菜单进入页壳层随语系

### 21. 小b Header/Footer 品牌对标大B Mobii

- [x] 21.1 `chrome.brand.text*`（en/zh-CN/zh-TW/pl）对齐 Admin `appShell.brand.*`
- [x] 21.2 Header：`/brand/mobii.png` 固定 + 平台标题随 locale
- [x] 21.3 Footer：去掉 Endora「Built with」→ Mobii logo + 多语系标题；页脚左栏品牌同步
- [x] 21.4 更新 `Footer.built-with.test.tsx`；本 §99

汇总：小b 品牌展示与大B一致——Logo 固定、标题随语系；页脚框架署名改为 Mobii 平台条。语系切换性能另批。

feat-26-11-05 00:07:32 [21.1~21.4]：小b Header与Footer换成Mobii品牌并多语系标题

### 22. 平台标题「竞价平台」→「竞价批采平台」

- [x] 22.1 大B `_i18n`：`appShell.brand.text*` / `versionLabel`（及 zh-CN feedback 标题）多语系同步
- [x] 22.2 小b `chrome.brand.*` 同步；Footer 测试断言更新
- [x] 22.3 本 §99

汇总：Logo 后强调文案改为「竞价批采平台」；en/pl 对应 Bidding Procurement；繁体「競價批採平台」。Admin 需 `i18n:reload` 或重启后可见。

feat-26-11-05 00:16:38 [22.1~22.3]：平台标题改为竞价批采平台并多语系同步

### 23. 小b 首页双业务改造（竞价为主、采购为次）

- [x] 23.1 `home.*` 文案重写 + 新增 `home.hero.cta*` / `home.path.*` / `home.campaigns.*` / `home.demo.*`（en/zh-CN/zh-TW/pl）
- [x] 23.2 `app/page.tsx`：Hero 主 CTA→竞价（未登录 `/login?next=/account/bidding`）、次 CTA→采购目录；双路径区；开放场次条（登录后拉 `published`）；CMS 首页仍优先
- [x] 23.3 抽检测试 `test/i18n/home-locale.test.ts`；本 §99

汇总：内置落地页对齐 Mobii 叙事——稀缺竞价批采为主、常规批量采购为次；壳层全走 messages；场次标题/数量/截止等业务字段仍来自 API。若运营配置了 CMS 首页则仍渲染 CMS。需重启/硬刷新 storefront 验证。

feat-26-11-05 01:02:05 [23.1~23.3]：小b首页改为竞价主CTA与采购次路径并多语系

### 24. 首页「常规采购品类」fallback 改为算力供应链

- [x] 24.1 `FALLBACK_CATEGORY_DEFS` + 图标：内存 / 小型 mini 设备 / 电子元器件 / 绿色算力硬件 / 服务器配件 / 散热与电源；去掉螺钉、螺栓
- [x] 24.2 `home.fallback.*` 四语系键名与文案同步
- [x] 24.3 抽检测试；本 §99

汇总：无真实分类树时的 03 区展示算力批采相关品类；有后端分类树时仍优先真实数据。硬刷新即可验证。

feat-26-11-05 01:26:32 [24.1~24.3]：首页常规品类fallback改为算力供应链并多语系

### 25. 修复本地 backend 因 _i18n pluginTimeout 起不来

- [x] 25.1 `buildServer` 将 Fastify `pluginTimeout` 从默认 10s 提到 60s（保留 `_i18n` 在 plugin attach 做 reconcile）
- [x] 25.2 重建 `@endora-commerce/platform`；`reconcile-timing` 单测通过；backend 可 listening :3001
- [x] 25.3 本 §99

汇总：Docker Reset / 冷库 + `pnpm run dev` 三端并行时，`_i18n` 在 `defineModuleRoutes` 内 reconcile 常超过默认 10s，触发 `AVV_ERR_PLUGIN_EXEC_TIMEOUT`，3001 拒绝连接、Admin 登录失败。未改 reconcile 时序（测试仍钉在 plugin attach）。

feat-26-11-06 19:08:50 [25.1~25.3]：提高 Fastify pluginTimeout 避免 _i18n reconcile 拖垮本地 boot

### 26. 生产竞价 PDF 上传 401 — storefront 同源 BFF

- [x] 26.1 新增 `/api/bidding/campaigns/[id]/{intent-template,intent-attachments,receipts}`，转发 `b2b_session` 至 backend
- [x] 26.2 `SubmitBidForm` 改为 same-origin `/api/bidding/…`（不再直连 `NEXT_PUBLIC_API_BASE_URL`）
- [x] 26.3 同源约束单测 + channel-header-coverage；更新部署 chatlog；本 §99

汇总：生产 `b2b.*` / `api.*` 分主机时浏览器无法把店面 scoped 的 `b2b_session` 带到 API，intent PDF 上传 401；本地 localhost 因 Cookie 不按端口隔离而掩盖。修复后需 rebuild/push storefront 镜像。

feat-26-11-06 23:16:16 [26.1~26.3]：竞价回执 PDF 走 storefront 同源 BFF 修复生产 401

### 27. Endora Commerce 总体功能介绍（偏业务文档）

- [x] 27.1 撰写偏业务的总体功能介绍，落盘 `pro_doc/endora-commerce-功能介绍.md`
- [x] 27.2 本 §99

汇总：系统已上线后，按产品/业务视角整理 Endora Commerce 能力全景（三端角色、目录价格、直购+询价、组织信用、履约发票、内容营销、治理扩展与开源边界），并注明与本仓库竞价扩展的关系；未改业务代码。

feat-26-11-08 22:18:20 [27.1~27.2]：新增 pro_doc Endora Commerce 偏业务总体功能介绍

### 28. Mobii-by-Endora 总体功能介绍（基座 + 竞价批采）

- [x] 28.1 新建 `pro_doc/mobii-by-endora-功能介绍.md`：Endora 复用能力 + Mobii 竞价批采新增能力
- [x] 28.2 本 §99

汇总：按确认口径重写偏业务总览——主体为 Mobii-by-Endora，文档同时覆盖 Endora 基座（组织/货品/订单履约等）与 bidding 活动/回执/签核/预付/转单/发货门禁；与上一份纯 Endora 介绍文档并列，互不覆盖。

feat-26-11-08 22:24:10 [28.1~28.2]：新增 Mobii-by-Endora 偏业务功能介绍（Endora 基座+竞价批采）

### 29. 扩写 endora-commerce 功能介绍（织入竞价，完整产品口径）

- [x] 29.1 保持 `endora-commerce-功能介绍.md` 原章节结构，将竞价批采写入定位/使用者/三端/4.x/故事/边界/侧重/总结；去掉改造历史叙事
- [x] 29.2 本 §99

汇总：按确认选 A，以原文档目录为骨架呈现完整 Mobii-by-Endora 系统功能；竞价能力分散写入各业务域与故事 C，§7 改为业务侧重而非升级说明。

feat-26-11-08 22:35:06 [29.1~29.2]：扩写 endora-commerce 功能介绍为含竞价的完整产品说明

### 30. 功能介绍文档产品名替换

- [x] 30.1 `endora-commerce-功能介绍.md`：`Mobii-by-Endora` → `Mobii_竞价批采平台`；英文括注用 `Mobii_Bidding_Platform`
- [x] 30.2 本 §99

汇总：按命名要求统一产品称呼，中文语境用 Mobii_竞价批采平台，文首说明处保留英文对照 Mobii_Bidding_Platform。

feat-26-11-08 22:40:41 [30.1~30.2]：功能介绍文档产品名改为 Mobii_竞价批采平台

### 31. 功能介绍补充生产环境入口

- [x] 31.1 在 `endora-commerce-功能介绍.md` §3 增加大B/小b 生产 URL 与登录邮箱（不含口令）
- [x] 31.2 本 §99

汇总：按 §3 + S1，写入 admin.justgoai.com / b2b.justgoai.com 及对应邮箱；明文密码不进文档。

feat-26-11-08 22:46:59 [31.1~31.2]：功能介绍 §3 补充生产环境入口（无口令）
