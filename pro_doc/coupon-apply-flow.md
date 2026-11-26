# 优惠码（Coupon）申请流程说明

本文说明 Mobii / Endora storefront 结算页「优惠码 → 应用」按钮背后的链路。本仓与开源 [endora-commerce](https://github.com/endora-commerce/endora-commerce) 同构，**不是缺功能**，而是分散在 `promotions` + `carts` + checkout/cart UI。

## 端到端

1. **Admin 建码**  
   模块 `promotions`（侧栏 / ⌘K → Promotions）→ 新建或编辑促销 → 在优惠码区添加 code（或批量生成）并启用。  
   API：`POST /api/v1/admin/promotions/:id/coupons` 等。

2. **买家在小 b 输入并应用**  
   - Checkout：`storefront/components/checkout/CouponField.tsx` → server action `applyCouponAction`（`checkout/page.tsx`）  
   - Cart：`CartCouponInput` → `applyCouponAction`（`cart/page.tsx`）  
   两者都调用 `applyCartCoupon` → `POST /api/v1/cart/coupon`。

3. **后端校验与落库**  
   `CartCouponService.apply`（`packages/modules/carts`）经 `PromotionCodePort` / `PromotionApplyPort` 解析 code、校验渠道/客户组/组织/最低消费等，成功则写入购物车 `appliedPromotionCode`，折扣出现在小计。

4. **下单**  
   `placeOrder` 读取当前购物车（含已应用优惠），订单金额反映折扣。

## 失败时

URL 带 `?couponError=<reason_code>`（如 `invalid_code`、`expired`），页面用 `cart.coupon.rejected.*` 四语文案展示。清空：`DELETE /api/v1/cart/coupon` / clear action。

## 自测建议

1. Admin 建一条带优惠码的促销（渠道与当前销售渠道一致）。  
2. 小 b 加购 → Checkout 输入 code → 应用 → 确认订单摘要出现折扣。  
3. 故意输错码 → 应出现对应语系错误，而非静默无反应。
