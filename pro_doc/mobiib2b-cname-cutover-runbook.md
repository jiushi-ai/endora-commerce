# mobiib2b.com 切入现有 ECS 生产 — 操作手册

**模式**：不并行（对外只用 `*.mobiib2b.com`）+ 方案 A（含 `api.mobiib2b.com`）
**协作**：本手册 + 本机已备好的证书/nginx 配置；**你在 ECS / 本机构建机上执行**；Agent 不直连 ECS。
**ECS IP**：`8.138.24.251`
**现有入口（切完后不再作业务入口）**：`admin|b2b|api.justgoai.com`（A 记录保留，供 CNAME 解析）

**域名对照（店面用 www，不用 b2b 子域）：**

| 角色            | 台湾域名               | CNAME 目标             |
| --------------- | ---------------------- | ---------------------- |
| 店面 storefront | `www.mobiib2b.com`   | `b2b.justgoai.com`   |
| 大 B admin      | `admin.mobiib2b.com` | `admin.justgoai.com` |
| API             | `api.mobiib2b.com`   | `api.justgoai.com`   |

证书 `*.mobiib2b.com` 覆盖 `www` / `admin` / `api`；**不覆盖**裸域 `mobiib2b.com`（若以后要裸域需另签或加 SAN）。

---

## 0. 本机已备好的文件（勿提交 git）

目录：`temp/SSL/ready-for-ecs/`（已加入 `.gitignore` 的 `/temp/SSL/`）

| 文件                 | 说明                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| `mobiib2b.com.pem` | 站点证 `*.mobiib2b.com` + DigiCert 链（已 openssl 与 key 公钥指纹一致） |
| `mobiib2b.com.key` | 私钥（来自 `mobiib2b-ssl.key`）                                         |
| `mobii-b2b.conf`   | 可直接覆盖 ECS 上 vhost（店面 `server_name` = `www.mobiib2b.com`）    |

证书有效期：`2026-11-18` → `2027-06-04`。

---

## 1. 台湾 DNS（对方执行）

在 `mobiib2b.com` DNS 控制台新增 **CNAME**（目标填主机名，**不要** `https://`，**不要**路径）：

| 主机记录  | 类型  | 记录值                 |
| --------- | ----- | ---------------------- |
| `www`   | CNAME | `b2b.justgoai.com`   |
| `admin` | CNAME | `admin.justgoai.com` |
| `api`   | CNAME | `api.justgoai.com`   |

**不要**再配 `b2b.mobiib2b.com`（已改为 `www`）。若对方已配过 `b2b` 那条，可删除或停用。

你们阿里云侧：**保持**现有三条 A（`admin` / `b2b` / `api` → `8.138.24.251`），不要删（`www` 的 CNAME 仍指向 `b2b.justgoai.com` 这条 A）。

### 验收（任意能上网的机器）

```bash
# 最终应解析到 8.138.24.251
dig +short www.mobiib2b.com
dig +short admin.mobiib2b.com
dig +short api.mobiib2b.com
# 或
   www.mobiib2b.com
```

---

## 2. 上传证书到 ECS

在你本机（WSL，已能 `scp` / Remote-SSH 的环境）：

```bash
cd ~/github/endora-commerce   # 按你的克隆路径改

# 上传到临时目录后挪到 nginx ssl（示例用 root@ECS）
scp temp/SSL/ready-for-ecs/mobiib2b.com.pem \
    temp/SSL/ready-for-ecs/mobiib2b.com.key \
    root@8.138.24.251:/tmp/
```

在 **ECS** 上：

```bash
cd /usr/local/nginx/conf/ssl
cp /tmp/mobiib2b.com.pem .
cp /tmp/mobiib2b.com.key .
chmod 640 mobiib2b.com.pem mobiib2b.com.key
# 若现有 justgoai 证书属主是 root:root，保持一致即可
ls -la mobiib2b.com.*

# 再确认密钥匹配（两行 MD5 必须相同）
openssl x509 -in mobiib2b.com.pem -noout -subject -dates
openssl x509 -in mobiib2b.com.pem -noout -pubkey | openssl md5
openssl pkey -in mobiib2b.com.key -pubout | openssl md5

rm -f /tmp/mobiib2b.com.pem /tmp/mobiib2b.com.key
```

---

## 3. 替换 nginx vhost

在 **ECS** 上：

```bash
cd /usr/local/nginx/conf/vhost

# 备份（时间戳按实际）
cp -a mobii-b2b.conf "mobii-b2b.conf.bak-$(date +%y-%m-%d-%H%M%S)"
```

把本机 `temp/SSL/ready-for-ecs/mobii-b2b.conf` 覆盖上去：

```bash
# 本机 scp（推荐整文件覆盖，勿在 ECS 手改）
scp temp/SSL/ready-for-ecs/mobii-b2b.conf \
    root@8.138.24.251:/usr/local/nginx/conf/vhost/mobii-b2b.conf
```

要点（已写进文件，核对即可）：

- `server_name`：`www.mobiib2b.com` / `admin.mobiib2b.com` / `api.mobiib2b.com`
- 证书：`/usr/local/nginx/conf/ssl/mobiib2b.com.pem` + `.key`
- `proxy_pass` 仍为 `127.0.0.1:3000` / `8080` / `3001`

测配并重载：

```bash
grep -n 'listen 443' -A2 /usr/local/nginx/conf/vhost/mobii-b2b.conf
# 应看到 www / admin / api 三行 server_name

/usr/local/nginx/sbin/nginx -t
/usr/local/nginx/sbin/nginx -s reload
```

### 快速探活（DNS 未生效也可用 --resolve）

```bash
curl -sI --resolve admin.mobiib2b.com:443:8.138.24.251 https://admin.mobiib2b.com/ | head
curl -sI --resolve www.mobiib2b.com:443:8.138.24.251 https://www.mobiib2b.com/ | head
curl -sI --resolve api.mobiib2b.com:443:8.138.24.251 https://api.mobiib2b.com/ | head
```

期望：admin `200`；www `307`→`/zh-cn`；api 根路径 `404` JSON（正常）。证书 Subject 应为 `*.mobiib2b.com`。此时页面可能仍调旧 API，直到第 4 步重建前端。

### 若你已执行过旧版「b2b.mobiib2b.com」的第 3 步

只需 **再 scp 一次** 本机最新 `mobii-b2b.conf` → `nginx -t` → `reload`，并用上面的 `www` 探活替换原来的 `b2b.mobiib2b.com` 探活。证书不必重传。

---

## 4. 应用域名 + 重建前端镜像

### 4.1 ECS 改 `/opt/b2b/.env`

```bash
cd /opt/b2b
cp -a .env ".env.bak-$(date +%y-%m-%d-%H%M%S)"

sed -i 's/^STOREFRONT_DOMAIN=.*/STOREFRONT_DOMAIN=www.mobiib2b.com/' .env
sed -i 's/^ADMIN_DOMAIN=.*/ADMIN_DOMAIN=admin.mobiib2b.com/' .env
sed -i 's/^API_DOMAIN=.*/API_DOMAIN=api.mobiib2b.com/' .env

grep -E '^(STOREFRONT_DOMAIN|ADMIN_DOMAIN|API_DOMAIN|IMAGE_TAG|REGISTRY_IMAGE)=' .env
```

说明：`compose.prod.yml` 会用上述域名生成 `CORS_ALLOWED_ORIGINS`、`ADMIN_BASE_URL`、`STOREFRONT_BASE_URL`、`BACKEND_PUBLIC_URL` 等。
**backend 只需新 `.env` 重启**；**admin / storefront 必须新镜像**（构建期写死公网 URL）。

### 4.2 本机构建并推 ACR（公网域名 login/push）

ACR 企业版 **禁止覆盖已有 tag**，请用新 tag：

```bash
cd ~/github/endora-commerce
docker login mobii-b2b-registry.cn-guangzhou.cr.aliyuncs.com

export REGISTRY_IMAGE='mobii-b2b-registry.cn-guangzhou.cr.aliyuncs.com/mobii'
export IMAGE_TAG="$(git rev-parse --short HEAD)-mobiib2b1"
echo "IMAGE_TAG=$IMAGE_TAG"

# backend：域名不进镜像，可重建也可沿用旧 tag；与 admin/storefront 共用 IMAGE_TAG 时建议三仓一起新 tag
docker build -f backend/Dockerfile -t ${REGISTRY_IMAGE}/backend:${IMAGE_TAG} .

docker build -f admin/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.mobiib2b.com \
  -t ${REGISTRY_IMAGE}/admin:${IMAGE_TAG} .

docker build -f storefront/Dockerfile \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.mobiib2b.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.mobiib2b.com \
  --build-arg NEXT_PUBLIC_SALES_CHANNEL_CODE=default \
  --build-arg NEXT_PUBLIC_DEFAULT_LOCALE=zh-CN \
  -t ${REGISTRY_IMAGE}/storefront:${IMAGE_TAG} .

docker push ${REGISTRY_IMAGE}/backend:${IMAGE_TAG}
docker push ${REGISTRY_IMAGE}/admin:${IMAGE_TAG}
docker push ${REGISTRY_IMAGE}/storefront:${IMAGE_TAG}
```

到 ACR 控制台确认三个仓库都出现该 `IMAGE_TAG` 后再继续。

### 4.3 ECS 拉镜像并启动

ECS `.env` 里 `REGISTRY_IMAGE` 应仍是 **VPC** 域名，例如：

`mobii-b2b-registry-vpc.cn-guangzhou.cr.aliyuncs.com/mobii`

```bash
cd /opt/b2b
# 换成上一步 echo 出的 IMAGE_TAG
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=${IMAGE_TAG}/" .env
# 若在 ECS 上没有该 shell 变量，直接手写：
# sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=xxxxxxxx-mobiib2b1/' .env

grep -E '^(IMAGE_TAG|REGISTRY_IMAGE|STOREFRONT_DOMAIN|ADMIN_DOMAIN|API_DOMAIN)=' .env

docker compose --env-file .env -f compose.prod.yml pull
docker compose --env-file .env -f compose.prod.yml up -d

docker compose --env-file .env -f compose.prod.yml ps
```



---

## 5. 验收清单

| # | 检查项      | 期望                                                                       |
| - | ----------- | -------------------------------------------------------------------------- |
| 1 | DNS         | `www` / `admin` / `api` 最终 A 到 `8.138.24.251`                   |
| 2 | 证书        | 浏览器锁：`*.mobiib2b.com`，无告警                                       |
| 3 | Admin       | `https://admin.mobiib2b.com` 打开；登录成功                              |
| 4 | Storefront  | `https://www.mobiib2b.com` 打开；列表/详情正常                           |
| 5 | API Host    | DevTools Network：请求为 `https://api.mobiib2b.com/...`（不是 justgoai） |
| 6 | CORS/Cookie | 登录态保持；无 CORS 红错                                                   |
| 7 | nginx log   | `nginx_log/www.mobiib2b.com_access.log` 等有访问                         |

```bash
# ECS 上也可：
curl -sI https://admin.mobiib2b.com/ | head
curl -sI https://www.mobiib2b.com/ | head
curl -sI https://api.mobiib2b.com/ | head
```

---

## 6. 回滚（若需临时回到 justgoai 入口）

1. 恢复 vhost 备份：`cp mobii-b2b.conf.bak-… mobii-b2b.conf` → `nginx -t` → `reload`
2. 恢复 `/opt/b2b/.env` 备份（三域名 + 旧 `IMAGE_TAG`）
3. `compose pull && up -d`（旧镜像 tag 仍在 ACR 即可）

台湾 CNAME 可暂留；浏览器仍可用 justgoai 主机名访问（若 nginx 已恢复 justgoai `server_name`）。

---

## 7. 发给台湾同事的 DNS 说明（可复制）

请在域名 `mobiib2b.com` 添加如下记录（CNAME）：

- `www.mobiib2b.com` → `b2b.justgoai.com`
- `admin.mobiib2b.com` → `admin.justgoai.com`
- `api.mobiib2b.com` → `api.justgoai.com`
- 给台湾插入一个新管理员：

    cd /opt/b2b

    docker compose --env-file .env -f compose.prod.yml run --rm backend
    node dist/cli.js admin_users create
    --email=support@mobiigenius.com
   --password='111111aaaaaa'
   --first-name=Support
  --last-name=Mobii

**不要**再配置 `b2b.mobiib2b.com`。不要写成带 `https://` 的 URL。TTL 可先设 10 分钟便于切换。配好后告知我们。

---

## 参考

- 前期生产部署过程：`chatlog/2026-11-05-chat2-阿里云ECS生产部署/`
- 官方 compose：`deploy/compose.prod.yml`
- 证书原料：`temp/SSL/mobiib2b-Certificate-20261118/`（DigiCert 通配符）
