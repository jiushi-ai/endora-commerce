---
'@endora-commerce/contracts': minor
'@endora-commerce/mod-bidding': minor
'@endora-commerce/mod-carts': minor
---

Rule 2 scarce-stock isolation: products on a `published` bidding campaign cannot be added via regular cart (`CART_PRODUCT_IN_BIDDING`). `biddingRegularPurchaseGatePort` + `occupiedProductIds` on the anonymous homepage summary; convert-to-order seeding is unchanged.
