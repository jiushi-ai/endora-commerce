# 2026-11-20-chat1-查看docker容器内部文件

用途：2026-11-20-chat1-查看docker容器内部文件

---

## chat ask

时间：2026-11-20 00:19

docker exec <backend容器名或ID> ls -la /usr/share/fonts/truetype/noto/
docker exec <backend容器名或ID> stat -c '%n %s' /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf

这里容器名或ID 怎么获取？

---

## chat rep

时间：2026-11-17 00:22
在 **ECS** 上、进到放 `compose.prod.yml` 的目录后查：

```bash
# 看服务与容器名
docker compose --env-file .env -f compose.prod.yml ps

# 或只看 backend
docker ps --format 'table {{.ID}}\t{{.Names}}\t{{.Image}}' | grep -i backend
```

名字一般类似 `…-backend-1`（以 `ps` 里 **NAMES** 列为准）。

然后：

```bash
# 用 compose 服务名（推荐，不用记容器名）
docker compose --env-file .env -f compose.prod.yml exec backend \
  ls -la /usr/share/fonts/truetype/noto/

docker compose --env-file .env -f compose.prod.yml exec backend \
  stat -c '%n %s' /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf

# 或用容器名/ID
docker exec <NAMES或ID> ls -la /usr/share/fonts/truetype/noto/
```

`compose … exec backend` 里的 `backend` 是 **compose 服务名**，不是随便起的主机名。

---

## chat ask

时间：2026-11-20 00:19

怎么查看容器中文件和目录

---

## chat rep

时间：2026-11-17 00:22

容器已找到：

- **名称：** `b2b-backend-1`
- **服务名：** `backend`
- **当前镜像：** `…/backend:b7a910eb7-batch-44-ops-checklist`（仍是 batch 44 标签；batch 45 的字体校验要等你用新 Dockerfile 重建后再验）

在 ECS 的 `b2b` 目录执行：

```bash
docker exec b2b-backend-1 ls -la /usr/share/fonts/truetype/noto/
docker exec b2b-backend-1 stat -c '%n %s' /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf
```

或：

```bash
docker compose --env-file .env -f compose.prod.yml exec backend \
  ls -la /usr/share/fonts/truetype/noto/
```

若目录不存在或文件很小：说明当前跑的还不是带有效 Noto 的镜像，需要用含 batch 45 Dockerfile 的源码 **重建并推送 backend**，再 `pull` + `up` 换掉这个 tag。
