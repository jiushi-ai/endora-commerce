# Batch 53 / 53.6 — Feature 170 波 1 migrate 验收清单

波 1 含 **DB migration**（组织角色表 + 成员角色赋值）。**不含 WP-12**（不删 legacy `role` 列）。

Agent 不直连 ECS；下列在 **ECS / 能连生产库的环境**执行。

## 关键 migrations（须已进镜像并跑过）

| 模块 | 类 / 文件 | 作用 |
| --- | --- | --- |
| `organizations` | `Migration20261103T173304OrganizationsOrganizationRoles` | M2：`organization_roles` + 预置 Administrator/Member + 邀请 FK |
| `customer_accounts` | `Migration20261103T190132CustomerAccountsOrganizationRoleAssignment` | M3：账户 ↔ 组织角色赋值 |
| `organizations` | `Migration20261102T014300OrganizationsStaffAssignments` | 若尚未跑过：staff assignments（波 1 同窗） |

## ECS 上执行

```bash
ssh.exe aliyun-mobii
cd /opt/b2b

# 确认当前 backend 镜像已含 170 波 1
docker compose --env-file .env -f compose.prod.yml ps backend

# 看待跑迁移（应为空或仅列出尚未应用的）
docker compose --env-file .env -f compose.prod.yml exec backend \
  pnpm --filter backend run migration:pending

# 应用
docker compose --env-file .env -f compose.prod.yml exec backend \
  pnpm --filter backend run migration:up
```

## 库表抽查（可选）

```bash
docker compose --env-file .env -f compose.prod.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "select count(*) from organization_roles; select count(*) from information_schema.columns where table_name='customer_accounts' and column_name like '%organization_role%';"
```

期望：`organization_roles` 有行；账户侧有 role assignment 相关列。legacy `role` **仍应存在**（WP-12 未合）。

## 功能冒烟（与 chatlog 波 1 验收对齐）

1. Admin：组织可管理角色并为成员赋权  
2. 小 b：`/api/v1/me`（或登录后能力）含 permissions  
3. 无 `shopping_lists.create`：清单**列表 + 详情**只读 + `account.lists.readOnlyNote`  
4. 有权限：详情可改名 / 改数量 / 清空；转购物车/询价随各自 ability  

## 回滚注意

`migration:down` 会丢角色数据；生产回滚优先换回旧 `IMAGE_TAG`，不要轻易 down M2/M3。
