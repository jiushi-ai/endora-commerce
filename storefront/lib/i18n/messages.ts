/**
 * Tiny in-tree message catalogue. The reference theme uses this for
 * navigation labels, button captions, and other chrome that is *not*
 * editorial content (CMS pages cover editorial).
 *
 * Themes typically override `components/*` rather than message keys; if
 * a theme wants its own copy, it can replace this file or extend the
 * record.
 */

export type SupportedLocale = string;

export type MessageKey =
  | 'a11y.skipToContent'
  | 'a11y.navigating'
  | 'a11y.navigatingSlow'
  | 'nav.home'
  | 'nav.catalog'
  | 'nav.search'
  | 'nav.account'
  | 'nav.login'
  | 'nav.quickOrder'
  | 'nav.cart'
  | 'nav.quoteRequest'
  | 'catalog.heading'
  | 'catalog.filters'
  | 'catalog.empty'
  | 'catalog.emptyPageMore'
  | 'catalog.loadMore'
  | 'catalog.sort.priceAsc'
  | 'catalog.sort.priceDesc'
  | 'gallery.zoom'
  | 'compare.add'
  | 'compare.remove'
  | 'card.list.addedTo'
  | 'catalog.count'
  | 'catalog.showing'
  | 'catalog.showing.results'
  | 'catalog.sort.aria'
  | 'catalog.sort.relevance'
  | 'catalog.sort.newest'
  | 'catalog.sort.nameAsc'
  | 'catalog.sort.nameDesc'
  | 'catalog.perPage'
  | 'catalog.perPage.aria'
  | 'catalog.viewMode.aria'
  | 'catalog.view.grid'
  | 'catalog.view.list'
  | 'product.fromPerUnit'
  | 'product.gross'
  | 'catalog.price.heading'
  | 'catalog.price.min'
  | 'catalog.price.max'
  | 'catalog.price.apply'
  | 'catalog.price.clear'
  | 'catalog.price.unitNote'
  | 'product.outOfStock'
  | 'product.requestQuote'
  | 'product.priceFromVariants'
  | 'product.compareAtLabel'
  | 'product.listPrice'
  | 'product.yourPrice'
  | 'product.addToCart'
  | 'product.addToCartFailed'
  | 'product.oneClickFailed'
  | 'product.details'
  | 'product.tabs.description'
  | 'product.tabs.parameters'
  | 'product.tabs.attachments'
  | 'product.packaging.singlePiece'
  | 'product.packaging.pieces'
  | 'product.minimum.pieces'
  | 'product.minimum.units'
  | 'product.minimum.addToCart'
  // Feature 155, U4 — the buy controls, the quick-order page and the shopping-list quantity.
  | 'common.quantity'
  | 'product.buy.unit'
  | 'product.quote.add'
  | 'product.quote.added'
  | 'product.cartPopup.added'
  | 'product.cartPopup.goToCart'
  | 'product.cartPopup.continue'
  | 'product.cartPopup.close'
  | 'card.list.add'
  | 'card.list.remove'
  | 'card.list.failed'
  | 'card.cart.added'
  | 'card.cart.failed'
  | 'card.quote.added'
  | 'compare.cart.adding'
  | 'compare.cart.added'
  | 'quickOrder.page.heading'
  | 'quickOrder.page.introPrefix'
  | 'quickOrder.page.introSuffix'
  | 'quickOrder.page.template'
  | 'quickOrder.page.dropzone'
  | 'quickOrder.page.pasteLabel'
  | 'quickOrder.page.preview'
  | 'quickOrder.built.cart'
  | 'quickOrder.built.goToCheckout'
  | 'quickOrder.built.quote'
  | 'quickOrder.built.viewQuotes'
  | 'quickOrder.search.heading'
  | 'quickOrder.search.hint'
  | 'quickOrder.search.placeholder'
  | 'quickOrder.search.none'
  | 'quickOrder.search.add'
  | 'quickOrder.col.sku'
  | 'quickOrder.col.name'
  | 'quickOrder.col.qty'
  | 'quickOrder.col.line'
  | 'quickOrder.col.variant'
  | 'quickOrder.col.reason'
  | 'quickOrder.col.raw'
  | 'quickOrder.qtyFor'
  | 'quickOrder.bar.recognised'
  | 'quickOrder.bar.addToCart'
  | 'quickOrder.preview.heading'
  | 'quickOrder.preview.recognised'
  | 'quickOrder.preview.invalid'
  | 'quickOrder.preview.units'
  | 'quickOrder.preview.truncated'
  | 'quickOrder.preview.merged'
  | 'quickOrder.preview.recognisedRows'
  | 'quickOrder.preview.update'
  | 'quickOrder.preview.remove'
  | 'quickOrder.preview.addAll'
  | 'quickOrder.preview.sendAsQuote'
  | 'quickOrder.preview.noneMatched'
  | 'quickOrder.preview.rejectedHeading'
  | 'quickOrder.problem.no_input'
  | 'quickOrder.problem.nothing_to_update'
  | 'quickOrder.problem.nothing_to_remove'
  | 'quickOrder.problem.nothing_to_build'
  | 'quickOrder.problem.import_failed'
  | 'quickOrder.problem.build_failed'
  | 'shoppingList.qty.invalid'
  | 'shoppingList.qty.save'
  | 'order.minimum.below.pieces'
  | 'order.minimum.below.units'
  | 'order.minimum.below.unitsUnnamed'
  | 'order.minimum.below.bare'
  | 'cart.line.noLongerAvailable'
  | 'cart.line.unknownProduct'
  | 'cart.line.setToMinimum'
  | 'cart.line.minimumHint'
  | 'cart.line.quantityInvalid'
  | 'cart.line.updateFailed'
  | 'cart.line.removeFailed'
  | 'cart.checkoutBlocked'
  | 'cart.approvalBlocked'
  | 'batchReport.more'
  | 'cart.submitForApprovalFailed'
  | 'cart.dropped.belowMinimum'
  | 'cart.dropped.belowMinimumBare'
  | 'checkout.belowMinimum.heading'
  | 'checkout.belowMinimum.intro'
  | 'checkout.belowMinimum.backToCart'
  | 'checkout.belowMinimum.blocked'
  | 'quickOrder.reason.sku_missing'
  | 'quickOrder.reason.quantity_invalid'
  | 'quickOrder.reason.product_not_found'
  | 'quickOrder.reason.product_archived'
  | 'quickOrder.reason.malformed_row'
  | 'quickOrder.reason.variant_not_resolved'
  | 'quickOrder.reason.variant_ambiguous'
  | 'quickOrder.reason.row_limit_exceeded'
  | 'quickOrder.reason.below_minimum'
  | 'quickOrder.reason.below_minimumDetail'
  | 'quickOrder.build.added'
  | 'quickOrder.build.noneAdded'
  | 'quickOrder.build.rejectedHeading'
  | 'quickOrder.build.rejectedLine'
  | 'quickOrder.build.openCart'
  | 'shoppingList.skip.heading'
  | 'shoppingList.skip.product_archived'
  | 'shoppingList.skip.variant_unavailable'
  | 'shoppingList.skip.product_not_found'
  | 'product.inStock'
  | 'product.stockBand.high'
  | 'product.stockBand.medium'
  | 'product.stockBand.low'
  | 'product.notify.cta'
  | 'product.notify.dialogTitle'
  | 'product.notify.emailLabel'
  | 'product.notify.submit'
  | 'product.notify.submitting'
  | 'product.notify.success'
  | 'product.notify.errorGeneric'
  | 'product.notify.cancel'
  | 'product.backorder.hint'
  | 'product.variants.heading'
  | 'product.variants.sku'
  | 'product.variants.stockLevel'
  | 'product.variants.outOfStock'
  | 'product.variants.selectThisVariant'
  | 'product.links.related'
  | 'product.links.upSell'
  | 'product.links.crossSell'
  | 'product.links.seeAll'
  | 'product.bundle.addToCart'
  | 'product.bundle.requiredSlot'
  | 'product.grouped.addBundleToCart'
  | 'product.virtual.buyAndDownload'
  | 'product.virtual.digitalDelivery'
  | 'search.placeholder'
  | 'search.unavailable'
  | 'search.seeAllResults'
  | 'common.searchAction'
  | 'pagination.next'
  | 'product.attributes.tabTitle'
  | 'product.attributes.boolean.yes'
  | 'product.attributes.boolean.no'
  // Feature 036 — Checkout (Kasa). Localized user-facing copy for the
  // Success / Failure pages and the Address / Coupon sections.
  | 'checkout.success.title'
  | 'checkout.success.orderNumberPrefix'
  | 'checkout.success.confirmationSent'
  | 'checkout.success.bankTransferHint'
  | 'checkout.success.pickupHint'
  | 'checkout.success.creditLimitHint'
  | 'checkout.success.viewOrder'
  | 'checkout.success.allOrders'
  | 'checkout.success.continueShopping'
  | 'checkout.failure.title'
  | 'checkout.failure.generic'
  | 'checkout.failure.cartKept'
  | 'checkout.failure.tryAgain'
  | 'checkout.failure.backToCart'
  // Issue #287 — the failure page's second reader: a buyer whose order exists
  // and whose payment did not settle. The keys above stay for the buyer whose
  // order was never created, whose cart really is intact.
  | 'checkout.paymentFailure.title.failed'
  | 'checkout.paymentFailure.title.cancelled'
  | 'checkout.paymentFailure.orderPlacedPrefix'
  | 'checkout.paymentFailure.orderPlacedSuffix'
  | 'checkout.paymentFailure.failedBody'
  | 'checkout.paymentFailure.cancelledBody'
  | 'checkout.paymentFailure.payAgain'
  | 'checkout.paymentFailure.retryHint'
  | 'checkout.paymentFailure.noRetryHint'
  | 'checkout.paymentFailure.viewOrder'
  | 'checkout.paymentFailure.allOrders'
  // Issue #287 — the webhook race: back from the gateway, confirmation not yet
  // in. Neither success nor failure is true yet, so neither is said.
  | 'checkout.paymentPending.title'
  | 'checkout.paymentPending.orderNumberPrefix'
  | 'checkout.paymentPending.placed'
  | 'checkout.paymentPending.stillWaiting'
  | 'checkout.paymentPending.checkAgain'
  | 'checkout.paymentPending.viewOrder'
  // Issue #264 — paying an order again after the first attempt did not go
  // through. Shown on the order page, which is where a buyer looks for it.
  | 'order.payment.retry.cta'
  | 'order.payment.retry.hint'
  | 'order.payment.retry.inProgress'
  | 'order.payment.retry.failed'
  // Feature 085 — the buyer cancelling an order they placed, offered exactly
  // when the platform says they may.
  | 'order.cancel.cta'
  | 'order.cancel.hint'
  | 'order.cancel.failed'
  // What the buyer is told when checkout can offer no delivery method at all.
  // One sentence for two causes — a shop that has configured none, and a
  // platform whose `delivery_methods` module an operator switched off — for the
  // same reason its payment twin below has one: a buyer cannot act on the
  // difference, and the platform's module topology is not checkout copy.
  | 'checkout.delivery.none'
  // What the buyer is told when checkout can offer no payment method at all.
  // One sentence for two causes — a shop that has configured none, and a
  // platform whose payment capability an operator switched off — because a
  // buyer cannot act on the difference and the platform's module topology is
  // not checkout copy. The operator's side of that distinction belongs in the
  // deactivation-consequence dialog, not here.
  | 'checkout.payment.none'
  // The checkout error boundary. Deliberately *not* the sentence above: it is
  // shown when checkout genuinely failed, and saying "no payment method" there
  // would dress a bug up as a product state.
  | 'checkout.error.title'
  | 'checkout.error.body'
  | 'checkout.error.retry'
  | 'checkout.error.backToCart'
  | 'checkout.error.referencePrefix'
  | 'checkout.coupon.label'
  | 'checkout.coupon.apply'
  | 'checkout.coupon.appliedPrefix'
  | 'checkout.coupon.appliedSuffix'
  | 'checkout.coupon.remove'
  | 'checkout.address.shippingTitle'
  | 'checkout.address.billingTitle'
  | 'checkout.address.useSaved'
  | 'checkout.address.enterNew'
  | 'checkout.address.sameAsShipping'
  | 'checkout.address.recipientName'
  | 'checkout.address.street'
  | 'checkout.address.postalCode'
  | 'checkout.address.city'
  | 'checkout.address.country'
  | 'checkout.address.phone'
  | 'checkout.address.billingCompanyTitle'
  | 'checkout.address.billingCompanyHint'
  | 'checkout.address.companyName'
  | 'checkout.address.taxId'
  | 'checkout.shipping.title'
  | 'checkout.shipping.empty'
  | 'checkout.shipping.free'
  // Feature 008 — Quote Request success page (parallel to checkout success).
  | 'quoteRequest.success.title'
  | 'quoteRequest.success.numberPrefix'
  | 'quoteRequest.success.confirmationSent'
  | 'quoteRequest.success.nextStepsHint'
  | 'quoteRequest.success.viewRequest'
  | 'quoteRequest.success.allRequests'
  | 'quoteRequest.success.continueShopping'
  // Feature 159 — a document's line groups, read-only, and the comparison's
  // notice that the arrangement changed.
  | 'quoteRequest.diff.grouping'
  | 'lineGroups.otherItems'
  | 'lineGroups.summary.items.one'
  | 'lineGroups.summary.items.few'
  | 'lineGroups.summary.items.many'
  | 'lineGroups.summary.items.other'
  | 'lineGroups.summary.net'
  | 'lineGroups.summary.vat'
  | 'lineGroups.summary.gross'
  // Issue #193 — federated sign-in. Rendered only when `mfa` is present and the
  // provider is configured + enabled, so these never label a dead control.
  | 'auth.federated.groupLabel'
  | 'auth.federated.divider'
  | 'auth.federated.google'
  | 'auth.federated.microsoft'
  // `specs/154-sales-channel-access/` — a store that serves signed-in customers
  // only, an account whose Organization may not use this store, and the screen
  // a signed-in buyer sees on a store their account is not assigned to.
  | 'auth.login.signInRequired'
  | 'auth.login.channelNotPermitted'
  | 'access.signInRequired'
  | 'access.denied.title'
  | 'access.denied.body'
  | 'access.denied.otherStores'
  | 'access.denied.signOut'
  | 'access.denied.contact'
  // Issue #194 — the linked-identities panel on the account security page.
  | 'account.socialLinks.heading'
  | 'account.socialLinks.intro'
  | 'account.socialLinks.linkedOn'
  | 'account.socialLinks.remove'
  | 'account.socialLinks.lastCredential'
  | 'account.socialLinks.setPassword'
  // `specs/149-pwa-order-status-push/` — the account profile's push section:
  // the per-browser control (issue #258, its copy moved here) and the
  // account-wide choices that apply to every subscribed device.
  | 'account.push.heading'
  | 'account.push.device.heading'
  | 'account.push.device.on'
  | 'account.push.device.off'
  | 'account.push.device.blocked'
  | 'account.push.device.turnOn'
  | 'account.push.device.turnOff'
  | 'account.push.preferences.heading'
  | 'account.push.preferences.hint'
  | 'account.push.preferences.orderStatus'
  | 'account.push.preferences.quoteStatus'
  | 'account.push.preferences.save'
  | 'account.push.preferences.saved'
  | 'account.push.preferences.error'
  // The shared comparison. Sender and recipient legitimately see different
  // numbers and, where the sender restricted a product, different rows — so
  // the view says whose prices these are and that something is missing,
  // rather than leaving the reader to discover it.
  | 'compare.pdf.busy'
  | 'compare.pdf.failed'
  | 'compare.shared.pricesYours'
  | 'compare.shared.pricesChannel'
  | 'compare.shared.hiddenProducts'
  // Issue #274 — every payment gateway returns the buyer to the order page.
  // The page says why they are back; the order's own payment status decides
  // whether it says anything at all.
  | 'orders.paymentReturn.returned'
  | 'orders.paymentReturn.cancelled'
  | 'orders.paymentReturn.failed'
  | 'orders.actionFailed'
  // Feature 155 (FR-021, FR-018) — the return form and the order's return action. A line may
  // be not returnable, and an order with no returnable line still takes a complaint.
  | 'returns.new.heading'
  | 'returns.new.chooseOrder'
  | 'returns.new.noOrders'
  | 'returns.new.backToReturns'
  | 'returns.new.chooseAnotherOrder'
  | 'returns.new.freeReturnWindow'
  | 'returns.new.kind.legend'
  | 'returns.new.kind.return'
  | 'returns.new.kind.complaint'
  | 'returns.new.col.include'
  | 'returns.new.col.product'
  | 'returns.new.col.qty'
  | 'returns.new.col.reason'
  | 'returns.new.selectReason'
  | 'returns.new.comment'
  | 'returns.new.submit.return'
  | 'returns.new.submit.complaint'
  | 'returns.new.none.notCompleting'
  | 'returns.new.none.fullyReturned'
  | 'returns.new.none.windowPassed'
  | 'returns.new.none.generic'
  | 'returns.new.complaintOnly'
  | 'returns.line.notReturnable'
  | 'returns.line.remaining'
  | 'orders.returnAction.return'
  | 'orders.returnAction.complaint'
  // The validity deadline an operator sets on a quote request. !1137 made it a
  // rule — accept-revision answers 410 `RFQ_EXPIRED` and convert-to-order 410
  // `QUOTE_VALIDITY_ENDED` past it — while no storefront component rendered
  // `expiresAt` at all, so the buyer's first sight of the deadline was the
  // refusal. Two labels, because "expires <date>" reads as a promise the
  // platform has stopped keeping once the date is behind us; two blocked
  // sentences, mirroring the two error codes, which name the same date from
  // the two sides the buyer meets it on and carry different remedies.
  | 'quoteRequests.validity.validUntil'
  | 'quoteRequests.validity.endedOn'
  | 'quoteRequests.validity.acceptBlocked'
  | 'quoteRequests.validity.convertBlocked'
  // The remedy both of those sentences name. Keyed because a sentence telling
  // the buyer to press a button has to be readable in the same language as the
  // button; the rest of this screen's copy is Polish-only and stays so.
  | 'quoteRequests.resubmit'
  // The service-unavailable notice. It is served at `503` by the reachability
  // gate in `middleware.ts` when the backend cannot be reached, which is also
  // the one screen in this storefront whose copy has to be resolvable with the
  // backend down — hence keys here rather than anything editorial.
  | 'serviceUnavailable.documentTitle'
  | 'serviceUnavailable.status'
  | 'serviceUnavailable.heading'
  | 'serviceUnavailable.body'
  | 'serviceUnavailable.reassurance'
  | 'serviceUnavailable.retry'
  | 'serviceUnavailable.retryHint'
  // Feature 163 (T095): the words a page-builder carousel speaks to assistive
  // technology. `{n}` and `{m}` are filled in by the carousel.
  | 'cms.carousel.label'
  | 'cms.carousel.previous'
  | 'cms.carousel.next'
  | 'cms.carousel.slide'
  | 'cms.carousel.goToSlide'
  | 'cms.carousel.goToPage'
  | 'cms.carousel.pause'
  | 'cms.carousel.play'
  | 'cms.carousel.filter'
  | 'cms.carousel.filterAll'
  | 'cms.carousel.filterCount'
  | 'home.mobile.shipToday'
  | 'home.mobile.creditLimit'
  | 'home.mobile.vatInvoice'
  | 'home.mobile.all'
  | 'home.hero.badge'
  | 'home.hero.titleLine1'
  | 'home.hero.titleLine2Before'
  | 'home.hero.titleEm'
  | 'home.hero.titleLine2After'
  | 'home.hero.body'
  | 'home.hero.browseCatalog'
  | 'home.hero.quickOrderCsv'
  | 'home.stat.stock'
  | 'home.stat.makers'
  | 'home.stat.cutoff'
  | 'home.stat.availability'
  | 'home.demo.dynamicLoad'
  | 'home.demo.datasheet'
  | 'home.demo.certificate'
  | 'home.demo.model3d'
  | 'home.assortment.eyebrow'
  | 'home.assortment.title'
  | 'home.assortment.body'
  | 'home.assortment.seeAll'
  | 'home.assortment.products'
  | 'home.benefit.shipTitle'
  | 'home.benefit.shipBody'
  | 'home.benefit.creditTitle'
  | 'home.benefit.creditBody'
  | 'home.benefit.docsTitle'
  | 'home.benefit.docsBody'
  | 'home.benefit.erpTitle'
  | 'home.benefit.erpBody'
  | 'home.bestsellers.eyebrow'
  | 'home.bestsellers.title'
  | 'home.bestsellers.body'
  | 'home.bestsellers.seeAll'
  | 'home.fallback.fasteners'
  | 'home.fallback.tools'
  | 'home.fallback.electronics'
  | 'home.fallback.safety'
  | 'home.fallback.screws'
  | 'home.fallback.bolts'
  | 'chrome.close'
  | 'chrome.categories'
  | 'chrome.seeAll'
  | 'chrome.menu'
  | 'chrome.departments'
  | 'chrome.browseDepartment'
  | 'chrome.megaQuickOrderTitle'
  | 'chrome.megaQuickOrderBody'
  | 'chrome.megaQuickOrderCta'
  | 'chrome.language'
  | 'chrome.currency'
  | 'chrome.shippingCutoff'
  | 'chrome.vatInvoice'
  | 'chrome.b2bSupport'
  | 'chrome.brandTagline'
  | 'chrome.brandTaglineShort'
  | 'chrome.allCategories'
  | 'chrome.allCategoriesArrow'
  | 'chrome.allPrefix'
  | 'chrome.shoppingList'
  | 'chrome.rfq'
  | 'chrome.rfqCount'
  | 'chrome.compare'
  | 'chrome.cart'
  | 'chrome.cartCount'
  | 'account.nav.aria'
  | 'account.nav.profile'
  | 'account.nav.addresses'
  | 'account.nav.password'
  | 'account.nav.orders'
  | 'account.nav.returns'
  | 'account.nav.quoteRequests'
  | 'account.nav.bidding'
  | 'account.nav.shoppingLists'
  | 'account.nav.quickOrder'
  | 'account.nav.organization'
  | 'account.nav.orgAddresses'
  | 'account.nav.members'
  | 'account.nav.signOut'
  | 'footer.blurb'
  | 'footer.shop'
  | 'footer.catalog'
  | 'footer.fasteners'
  | 'footer.tools'
  | 'footer.electronics'
  | 'footer.safety'
  | 'footer.account'
  | 'footer.myAccount'
  | 'footer.orders'
  | 'footer.invoices'
  | 'footer.rfq'
  | 'footer.shoppingLists'
  | 'footer.creditLimit'
  | 'footer.support'
  | 'footer.newsletter'
  | 'footer.newsletterHint'
  | 'footer.newsletterPlaceholder'
  | 'footer.newsletterSubmit'
  | 'footer.terms'
  | 'footer.privacy'
  | 'footer.cookies'
  | 'footer.contact'
  | 'footer.complaints'
  | 'footer.delivery'
  | 'footer.certificates'
  | 'footer.helpCenter';

const MESSAGES: Record<string, Record<MessageKey, string>> = {
  'en-US': {
    'a11y.skipToContent': 'Skip to content',
    'a11y.navigating': 'Loading the next page.',
    'a11y.navigatingSlow': 'Still loading. The next page is taking longer than usual.',
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.search': 'Search',
    'nav.account': 'Account',
    'nav.login': 'Sign in',
    'nav.quickOrder': 'Quick Order',
    'nav.cart': 'Cart',
    'nav.quoteRequest': 'Quote',
    'catalog.heading': 'Catalog',
    'catalog.filters': 'Filters',
    'catalog.empty': 'No products match your filters.',
    'catalog.emptyPageMore': 'No products on this page. More follow on the next page.',
    'catalog.loadMore': 'Load more',
    'catalog.sort.priceAsc': 'Price: lowest first',
    'catalog.sort.priceDesc': 'Price: highest first',
    'gallery.zoom': 'Enlarge',
    'compare.add': 'Add to comparison',
    'compare.remove': 'Remove from comparison',
    'card.list.addedTo': 'Added to "{name}"',
    'catalog.count': '{count} products',
    'catalog.showing': 'Showing',
    'catalog.showing.results': 'results',
    'catalog.sort.aria': 'Sort',
    'catalog.sort.relevance': 'Sort: relevance',
    'catalog.sort.newest': 'Newest',
    'catalog.sort.nameAsc': 'Name A–Z',
    'catalog.sort.nameDesc': 'Name Z–A',
    'catalog.perPage': '{n} / page',
    'catalog.perPage.aria': 'Results per page',
    'catalog.viewMode.aria': 'View mode',
    'catalog.view.grid': 'Grid',
    'catalog.view.list': 'List',
    'product.fromPerUnit': 'from / pc.',
    'product.gross': 'gross {amount}',
    'catalog.price.heading': 'Price',
    'catalog.price.min': 'From',
    'catalog.price.max': 'To',
    'catalog.price.apply': 'Apply price range',
    'catalog.price.clear': 'Clear price range',
    'catalog.price.unitNote':
      'Prices shown are your unit prices. Quantity discounts and promotions are applied in the cart.',
    'product.outOfStock': 'Out of stock',
    'product.requestQuote': 'Request a quote',
    'product.priceFromVariants': 'from, depending on the variant',
    'product.compareAtLabel': 'Your price',
    'product.listPrice': 'List price',
    'product.yourPrice': 'Your price',
    'product.addToCart': 'Add to cart',
    'product.addToCartFailed': 'Could not add the product to the cart.',
    'product.oneClickFailed': 'Could not place the order.',
    'product.details': 'Details',
    'product.tabs.description': 'Description',
    'product.tabs.parameters': 'Parameters',
    'product.tabs.attachments': 'Attachments',
    'product.packaging.singlePiece': 'Single piece',
    'product.packaging.pieces': 'pcs',
    'product.minimum.pieces': 'Minimum order: {count} pcs',
    'product.minimum.units': 'Minimum order: {units} × {unit} = {count} pcs',
    'product.minimum.addToCart': 'Add {count} pcs to cart',
    'common.quantity': 'Quantity',
    'product.buy.unit': 'Packaging unit',
    'product.quote.add': 'Add to quote',
    'product.quote.added': 'Added ✓',
    'product.cartPopup.added': 'Product added to the cart.',
    'product.cartPopup.goToCart': 'Go to cart',
    'product.cartPopup.continue': 'Continue shopping',
    'product.cartPopup.close': 'Close',
    'card.list.add': 'Add to shopping list',
    'card.list.remove': 'Remove from shopping list',
    'card.list.failed': 'Could not change the list',
    'card.cart.added': 'Added to cart',
    'card.cart.failed': 'Could not add',
    'card.quote.added': 'Added to quote',
    'compare.cart.adding': 'Adding…',
    'compare.cart.added': '✓ Added',
    'quickOrder.page.heading': 'Quick order',
    'quickOrder.page.introPrefix': 'Paste a CSV with ',
    'quickOrder.page.introSuffix':
      " headers (extra columns set variant attributes), or drag-drop a CSV / Excel file. We'll show you which rows match a real product before anything is added.",
    'quickOrder.page.template': 'Download CSV template',
    'quickOrder.page.dropzone': 'Drag a CSV or Excel file here, or click to choose',
    'quickOrder.page.pasteLabel': '…or paste CSV',
    'quickOrder.page.preview': 'Preview',
    'quickOrder.built.cart': 'Cart built from your import.',
    'quickOrder.built.goToCheckout': 'Go to checkout',
    'quickOrder.built.quote': 'Quote request created',
    'quickOrder.built.viewQuotes': 'View quote requests',
    'quickOrder.search.heading': 'Find products',
    'quickOrder.search.hint': 'Search by SKU, name, or a quick-searchable attribute and add items to your order.',
    'quickOrder.search.placeholder': 'Search products…',
    'quickOrder.search.none': 'No products matched "{query}".',
    'quickOrder.search.add': 'Add',
    'quickOrder.col.sku': 'SKU',
    'quickOrder.col.name': 'Name',
    'quickOrder.col.qty': 'Qty',
    'quickOrder.col.line': 'Line',
    'quickOrder.col.variant': 'Variant',
    'quickOrder.col.reason': 'Reason',
    'quickOrder.col.raw': 'Raw',
    'quickOrder.qtyFor': 'Quantity for {sku}',
    'quickOrder.bar.recognised': 'Recognised',
    'quickOrder.bar.addToCart': 'Add {count} to cart',
    'quickOrder.preview.heading': 'Preview',
    'quickOrder.preview.recognised': 'recognised',
    'quickOrder.preview.invalid': 'invalid',
    'quickOrder.preview.units': 'units',
    'quickOrder.preview.truncated': 'The file exceeded the import row limit — extra rows were rejected.',
    'quickOrder.preview.merged': '{count} duplicate row(s) merged (quantities summed).',
    'quickOrder.preview.recognisedRows': '{count} row(s) recognised — choose how to proceed.',
    'quickOrder.preview.update': 'Update',
    'quickOrder.preview.remove': 'Remove',
    'quickOrder.preview.addAll': 'Add all to cart',
    'quickOrder.preview.sendAsQuote': 'Send as quote request',
    'quickOrder.preview.noneMatched': 'No rows matched the catalog.',
    'quickOrder.preview.rejectedHeading': 'Rejected rows',
    'quickOrder.problem.no_input': 'Provide a file or paste CSV.',
    'quickOrder.problem.nothing_to_update': 'Nothing to update.',
    'quickOrder.problem.nothing_to_remove': 'Nothing to remove.',
    'quickOrder.problem.nothing_to_build': 'Nothing to build.',
    'quickOrder.problem.import_failed': 'Import failed.',
    'quickOrder.problem.build_failed': 'Could not build the cart or quote request.',
    'shoppingList.qty.invalid': 'Enter a whole number from 1 to 9999.',
    'shoppingList.qty.save': 'Save',
    'order.minimum.below.pieces': 'Below the minimum ({count} pcs)',
    'order.minimum.below.units': 'Below the minimum ({units} × {unit})',
    'order.minimum.below.unitsUnnamed': 'Below the minimum ({units} packaging units)',
    'order.minimum.below.bare': 'Below the minimum order quantity',
    'cart.line.noLongerAvailable': 'No longer available',
    'cart.line.unknownProduct': 'Product removed from the catalogue',
    'cart.line.setToMinimum': 'Set to {count} pcs',
    'cart.line.minimumHint': 'Minimum {count} pcs',
    'cart.line.quantityInvalid': 'Enter a whole number. 0 removes the line.',
    'cart.line.updateFailed': 'Could not update the quantity. Please try again.',
    'cart.line.removeFailed': 'Could not remove the line. Please try again.',
    'cart.checkoutBlocked': 'Change or remove the flagged lines to continue to checkout.',
    'cart.approvalBlocked': 'Change or remove the flagged lines to submit the cart for approval.',
    'batchReport.more': '+{count} more',
    'cart.submitForApprovalFailed': 'Could not submit the cart for approval.',
    'cart.dropped.belowMinimum': 'below the minimum order quantity (minimum {minimum})',
    'cart.dropped.belowMinimumBare': 'below the minimum order quantity',
    'checkout.belowMinimum.heading': 'These lines cannot be ordered yet',
    'checkout.belowMinimum.intro': 'Change the quantity or remove the line in your cart, then come back to place the order.',
    'checkout.belowMinimum.backToCart': 'Fix in cart',
    'checkout.belowMinimum.blocked': 'Some lines are below the minimum order quantity or no longer available.',
    'quickOrder.reason.sku_missing': 'SKU missing',
    'quickOrder.reason.quantity_invalid': 'Invalid quantity',
    'quickOrder.reason.product_not_found': 'Product not found',
    'quickOrder.reason.product_archived': 'Product archived',
    'quickOrder.reason.malformed_row': 'Malformed row',
    'quickOrder.reason.variant_not_resolved': 'Variant not recognised',
    'quickOrder.reason.variant_ambiguous': 'Variant ambiguous',
    'quickOrder.reason.row_limit_exceeded': 'Over the row limit',
    'quickOrder.reason.below_minimum': 'Below the minimum order quantity',
    'quickOrder.reason.below_minimumDetail': "The product's total in this file is {total}, minimum {count} pcs",
    'quickOrder.build.added': 'Cart built from your import: {added} of {total} lines added.',
    'quickOrder.build.noneAdded': 'No lines were added to your cart.',
    'quickOrder.build.rejectedHeading': 'Not added to the cart',
    'quickOrder.build.rejectedLine': '{product} × {quantity} — {reason}',
    'quickOrder.build.openCart': 'Open cart',
    'shoppingList.skip.heading': 'Not added to the cart',
    'shoppingList.skip.product_archived': 'Product archived',
    'shoppingList.skip.variant_unavailable': 'Variant no longer available',
    'shoppingList.skip.product_not_found': 'Product no longer available',
    'product.inStock': 'In stock',
    'product.stockBand.high': 'In stock — plenty',
    'product.stockBand.medium': 'In stock',
    'product.stockBand.low': 'Low stock',
    'product.notify.cta': 'Notify when available',
    'product.notify.dialogTitle': 'Get notified when this product is back in stock',
    'product.notify.emailLabel': 'Email address',
    'product.notify.submit': 'Notify me',
    'product.notify.submitting': 'Subscribing…',
    'product.notify.success': 'You will get an email as soon as this product is back in stock.',
    'product.notify.errorGeneric': 'Could not subscribe — please try again.',
    'product.notify.cancel': 'Cancel',
    'product.backorder.hint': 'Currently out of stock — backorder available, dispatched as soon as the next batch arrives.',
    'product.variants.heading': 'Variants',
    'product.variants.sku': 'SKU',
    'product.variants.stockLevel': 'In stock',
    'product.variants.outOfStock': 'Out of stock',
    'product.variants.selectThisVariant': 'Currently selected',
    'product.links.related': 'Related products',
    'product.links.upSell': 'You might also like',
    'product.links.crossSell': 'You may also need',
    'product.links.seeAll': 'See all',
    'product.bundle.addToCart': 'Add bundle to cart',
    'product.bundle.requiredSlot': 'required',
    'product.grouped.addBundleToCart': 'Add bundle to cart',
    'product.virtual.buyAndDownload': 'Buy and download',
    'product.virtual.digitalDelivery': 'Digital delivery — instant access after purchase',
    'search.placeholder': 'Search products…',
    'search.unavailable': 'Search is temporarily unavailable.',
    'search.seeAllResults': 'See all results',
    'common.searchAction': 'Search',
    'pagination.next': 'Next page',
    'product.attributes.tabTitle': 'Specifications',
    'product.attributes.boolean.yes': 'Yes',
    'product.attributes.boolean.no': 'No',
    // Feature 036 — Checkout (Kasa).
    'checkout.success.title': 'Thank you — your order is placed',
    'checkout.success.orderNumberPrefix': 'Your order number is ',
    'checkout.success.confirmationSent': 'We have received it and sent a confirmation e-mail.',
    'checkout.success.bankTransferHint':
      'Please pay by bank transfer using the reference on the proforma invoice we have e-mailed you. We will update the order once the payment clears.',
    'checkout.success.pickupHint':
      'You will pay on collection / delivery. No further action is needed now.',
    'checkout.success.creditLimitHint':
      'This order draws on your organization’s credit limit and is now being processed.',
    'checkout.success.viewOrder': 'View order details',
    'checkout.success.allOrders': 'All orders',
    'checkout.success.continueShopping': 'Continue shopping',
    'checkout.failure.title': 'We could not complete your order',
    'checkout.failure.generic':
      'Something went wrong while placing your order. Your cart has been kept, so you can try again.',
    'checkout.failure.cartKept':
      'Your cart is unchanged — nothing was charged and no order was created.',
    'checkout.failure.tryAgain': 'Try again',
    'checkout.failure.backToCart': 'Back to cart',
    // Issue #287 — the buyer whose order exists.
    'checkout.paymentFailure.title.failed': 'Your payment did not go through',
    'checkout.paymentFailure.title.cancelled': 'Your payment was not completed',
    'checkout.paymentFailure.orderPlacedPrefix': 'Your order ',
    'checkout.paymentFailure.orderPlacedSuffix':
      ' has been placed and is waiting to be paid. Nothing has been charged.',
    'checkout.paymentFailure.failedBody': 'The payment provider did not accept this payment.',
    'checkout.paymentFailure.cancelledBody':
      'The payment was left before it was finished, so nothing was charged.',
    'checkout.paymentFailure.payAgain': 'Pay for this order again',
    'checkout.paymentFailure.retryHint':
      'You can start the payment again for this same order.',
    'checkout.paymentFailure.noRetryHint':
      'This order cannot be paid online at the moment. Open it to see what to do next.',
    'checkout.paymentFailure.viewOrder': 'View order details',
    'checkout.paymentFailure.allOrders': 'All orders',
    'checkout.paymentPending.title': 'We are confirming your payment',
    'checkout.paymentPending.orderNumberPrefix': 'Your order number is ',
    'checkout.paymentPending.placed':
      'Your order is placed. Nothing more is needed from you — we are waiting for the payment provider to confirm the payment, which usually takes a few seconds.',
    'checkout.paymentPending.stillWaiting':
      'This is taking longer than usual. We will e-mail you as soon as the payment is confirmed, and the order page always shows where it stands.',
    'checkout.paymentPending.checkAgain': 'Check again',
    'checkout.paymentPending.viewOrder': 'View order details',
    'order.payment.retry.cta': 'Pay again',
    'order.payment.retry.hint':
      'Your payment did not go through. Nothing has been charged — you can pay for this order again.',
    'order.payment.retry.inProgress':
      'A payment is already in progress for this order. Finish it on the payment page or wait for it to time out before starting a new one.',
    'order.payment.retry.failed': 'We could not start the payment. Please try again in a moment.',
    'order.cancel.cta': 'Cancel this order',
    'order.cancel.hint':
      'You have not paid for this order yet and we have not started on it, so you can still cancel it. The goods it reserves go straight back on the shelf.',
    'order.cancel.failed': 'We could not cancel this order. Please contact us and we will help.',
    'checkout.delivery.none':
      'No delivery method is available for your account on this sales channel.',
    'checkout.payment.none':
      'No payment method is available for your account on this sales channel.',
    'checkout.error.title': 'We could not load checkout',
    'checkout.error.body':
      'Something went wrong on our side. Your cart is untouched and nothing has been ordered or charged — please try again in a moment.',
    'checkout.error.retry': 'Try again',
    'checkout.error.backToCart': 'Back to cart',
    'checkout.error.referencePrefix': 'Reference: ',
    'checkout.coupon.label': 'Coupon code (optional)',
    'checkout.coupon.apply': 'Apply',
    'checkout.coupon.appliedPrefix': 'Coupon ',
    'checkout.coupon.appliedSuffix': 'applied — ',
    'checkout.coupon.remove': 'Remove',
    'checkout.address.shippingTitle': 'Shipping address',
    'checkout.address.billingTitle': 'Billing address',
    'checkout.address.useSaved': 'Use a saved address',
    'checkout.address.enterNew': 'Enter a new address',
    'checkout.address.sameAsShipping': 'Billing address same as shipping',
    'checkout.address.recipientName': 'Recipient name',
    'checkout.address.street': 'Street and number',
    'checkout.address.postalCode': 'Postal code',
    'checkout.address.city': 'City',
    'checkout.address.country': 'Country (e.g. PL)',
    'checkout.address.phone': 'Phone (optional)',
    'checkout.address.billingCompanyTitle': 'Billing company details',
    'checkout.address.billingCompanyHint':
      'Defaults to your organization. Override for this order if needed.',
    'checkout.address.companyName': 'Company name',
    'checkout.address.taxId': 'Tax ID (NIP)',
    'checkout.shipping.title': 'Delivery method',
    'checkout.shipping.empty':
      'No delivery method is available for your account on this sales channel.',
    'checkout.shipping.free': 'free',
    // Feature 008 — Quote Request success page.
    'quoteRequest.success.title': 'Thank you — your quote request is submitted',
    'quoteRequest.success.numberPrefix': 'Your quote request number is ',
    'quoteRequest.success.confirmationSent':
      'We have received it and sent a confirmation e-mail.',
    'quoteRequest.success.nextStepsHint':
      'Our sales team will review your request and prepare a quote with prices and terms. You will be notified when the offer is ready.',
    'quoteRequest.success.viewRequest': 'View quote request',
    'quoteRequest.success.allRequests': 'All quote requests',
    'quoteRequest.success.continueShopping': 'Continue shopping',
    'quoteRequest.diff.grouping': 'The arrangement of the lines changed.',
    'lineGroups.otherItems': 'Other items',
    'lineGroups.summary.items.one': '{count} item',
    'lineGroups.summary.items.few': '{count} items',
    'lineGroups.summary.items.many': '{count} items',
    'lineGroups.summary.items.other': '{count} items',
    'lineGroups.summary.net': 'net {amount}',
    'lineGroups.summary.vat': 'VAT {amount}',
    'lineGroups.summary.gross': 'gross {amount}',
    // Issue #193 — federated sign-in.
    'auth.federated.groupLabel': 'Other sign-in options',
    'auth.federated.divider': 'or',
    'auth.federated.google': 'Continue with Google',
    'auth.federated.microsoft': 'Continue with Microsoft',
    'auth.login.signInRequired':
      'This store is available to signed-in business customers. Sign in, or apply for a business account.',
    'auth.login.channelNotPermitted': 'This account does not have access to this store.',
    'access.signInRequired': 'This store is available to signed-in customers only. Please sign in.',
    'access.denied.title': 'No access to this store',
    'access.denied.body': 'Your account is not set up to buy in this store.',
    'access.denied.otherStores': 'Stores you can use:',
    'access.denied.signOut': 'Sign out',
    'access.denied.contact':
      'If you need to buy here, contact your organisation’s administrator or our sales team.',
    // Issue #194 — linked identities.
    'account.socialLinks.heading': 'Linked accounts',
    'account.socialLinks.intro':
      'These external accounts can sign you in. Removing one does not delete your account.',
    'account.socialLinks.linkedOn': 'Linked on',
    'account.socialLinks.remove': 'Remove',
    'account.socialLinks.lastCredential':
      'This is the last sign-in identity linked to your account, and your account has no password on record — removing it now could lock you out for good. Set a password first, then you can remove it.',
    'account.socialLinks.setPassword': 'Set a password',
    'account.push.heading': 'Push notifications',
    'account.push.device.heading': 'Notifications on this device',
    'account.push.device.on': 'Notifications about your orders and quotes are on for this browser.',
    'account.push.device.off': 'Notifications are off for this browser.',
    'account.push.device.blocked': 'Notifications are blocked in this browser’s site settings.',
    'account.push.device.turnOn': 'Turn on notifications',
    'account.push.device.turnOff': 'Turn off notifications',
    'account.push.preferences.heading': 'What to notify me about',
    'account.push.preferences.hint':
      'These choices apply to every device on which you have turned notifications on.',
    'account.push.preferences.orderStatus': 'Order status updates',
    'account.push.preferences.quoteStatus': 'Quote updates',
    'account.push.preferences.save': 'Save choices',
    'account.push.preferences.saved': 'Your choices have been saved.',
    'account.push.preferences.error': 'We could not save your choices. Please try again.',
    'compare.pdf.busy': 'Generating…',
    'compare.pdf.failed': 'The PDF could not be generated.',
    'compare.shared.pricesYours': 'Prices shown are your organisation’s.',
    'compare.shared.pricesChannel':
      'Prices shown are this store’s standard prices. Sign in to see the prices agreed for your organisation.',
    'compare.shared.hiddenProducts':
      'Some products in this comparison are not available to your account and are not shown here.',
    'orders.paymentReturn.returned':
      'You are back from the payment provider. Your order is placed; we are still waiting for the payment to be confirmed, and this page shows the result as soon as it arrives.',
    'orders.paymentReturn.cancelled':
      'You have not paid yet. Your order is placed and is waiting for payment — nothing has been charged.',
    'orders.paymentReturn.failed':
      'Your payment did not go through. Your order is placed and is still waiting for payment, so you can try again.',
    'orders.actionFailed': 'We could not complete that action.',
    'returns.new.heading': 'Start a return or complaint',
    'returns.new.chooseOrder': 'Choose the order the return or complaint is about:',
    'returns.new.noOrders': 'You don\'t have any orders yet.',
    'returns.new.backToReturns': '← Back to returns',
    'returns.new.chooseAnotherOrder': '← Choose another order',
    'returns.new.freeReturnWindow': 'This order is within the free-return window.',
    'returns.new.kind.legend': 'What would you like to file?',
    'returns.new.kind.return': 'Return',
    'returns.new.kind.complaint': 'Complaint',
    'returns.new.col.include': 'Include',
    'returns.new.col.product': 'Product',
    'returns.new.col.qty': 'Qty',
    'returns.new.col.reason': 'Reason',
    'returns.new.selectReason': 'Select…',
    'returns.new.comment': 'Additional details (optional)',
    'returns.new.submit.return': 'Submit return request',
    'returns.new.submit.complaint': 'Submit complaint',
    'returns.new.none.notCompleting': 'This order is not yet eligible for returns or complaints.',
    'returns.new.none.fullyReturned': 'All items from this order have already been returned.',
    'returns.new.none.windowPassed': 'This order can no longer be returned — the return window has ended.',
    'returns.new.none.generic': 'This order is not eligible for returns.',
    'returns.new.complaintOnly': 'No products in this order are returnable. You can still file a complaint about them.',
    'returns.line.notReturnable': 'This product cannot be returned; a complaint is still possible.',
    'returns.line.remaining': 'of {count}',
    'orders.returnAction.return': 'Request return / complaint',
    'orders.returnAction.complaint': 'File a complaint',
    'quoteRequests.validity.validUntil': 'Valid until ',
    'quoteRequests.validity.endedOn': 'Validity ended ',
    'quoteRequests.validity.acceptBlocked':
      'This offer\u2019s validity period has ended, so these prices can no longer be accepted. Submit the request again to get a current quote.',
    'quoteRequests.validity.convertBlocked':
      'The quote you accepted is no longer valid, so it can no longer be turned into an order. Once a quote has been approved its deadline can no longer be moved \u2014 submit the request again to get a current quote.',
    'quoteRequests.resubmit': 'Submit again',
    'serviceUnavailable.documentTitle': 'Service unavailable',
    'serviceUnavailable.status': 'Temporary outage',
    'serviceUnavailable.heading': 'The shop is temporarily unavailable.',
    'serviceUnavailable.body':
      'We cannot reach the systems this page is built from, so it cannot be shown right now. This is on our side, not yours, and we are already on it.',
    'serviceUnavailable.reassurance':
      'Nothing has been lost. Your cart, your account and any order you have already placed are untouched.',
    'serviceUnavailable.retry': 'Try again',
    'serviceUnavailable.retryHint': 'It is usually worth trying again in about a minute.',
    'cms.carousel.label': 'Carousel',
    'cms.carousel.previous': 'Previous slide',
    'cms.carousel.next': 'Next slide',
    'cms.carousel.slide': '{n} of {m}',
    'cms.carousel.goToSlide': 'Go to slide {n}',
    'cms.carousel.goToPage': 'Go to page {n}',
    'cms.carousel.pause': 'Pause autoplay',
    'cms.carousel.play': 'Start autoplay',
    'cms.carousel.filter': 'Filter',
    'cms.carousel.filterAll': 'All',
    'cms.carousel.filterCount': '{n} of {m} shown',
      'chrome.language': 'Language',
    'chrome.currency': 'Currency',
    'chrome.shippingCutoff': 'Ships today if you order by 14:00',
    'chrome.vatInvoice': 'VAT invoice',
    'chrome.b2bSupport': 'B2B support',
    'chrome.brandTagline': 'B2B · Industrial components',
    'chrome.brandTaglineShort': 'B2B components',
    'chrome.allCategories': 'All categories',
    'chrome.allCategoriesArrow': 'All categories →',
    'chrome.allPrefix': 'All: {label}',
    'chrome.shoppingList': 'Shopping list',
    'chrome.rfq': 'Quote request',
    'chrome.rfqCount': 'Quote request · {count} items',
    'chrome.compare': 'Compare products',
    'chrome.cart': 'Cart',
    'chrome.cartCount': 'Cart · {count} items',
    'account.nav.aria': 'Account',
    'account.nav.profile': 'Profile',
    'account.nav.addresses': 'My addresses',
    'account.nav.password': 'Change password',
    'account.nav.orders': 'Orders',
    'account.nav.returns': 'Returns',
    'account.nav.quoteRequests': 'Quote requests',
    'account.nav.bidding': 'Bidding',
    'account.nav.shoppingLists': 'Shopping lists',
    'account.nav.quickOrder': 'Quick order',
    'account.nav.organization': 'Organization',
    'account.nav.orgAddresses': 'Org addresses',
    'account.nav.members': 'Members',
    'account.nav.signOut': 'Sign out',
    'footer.blurb': 'B2B wholesale of industrial components. Bearings, drives, automation, electrics, pneumatics and tools. Same-day shipping, deferred-payment invoices and full technical documentation.',
    'footer.shop': 'Shop',
    'footer.catalog': 'Catalog',
    'footer.fasteners': 'Fasteners',
    'footer.tools': 'Tools',
    'footer.electronics': 'Electronics',
    'footer.safety': 'Safety',
    'footer.account': 'B2B account',
    'footer.myAccount': 'My account',
    'footer.orders': 'Orders',
    'footer.invoices': 'Invoices',
    'footer.rfq': 'RFQ — quote requests',
    'footer.shoppingLists': 'Shopping lists',
    'footer.creditLimit': 'Credit limit',
    'footer.support': 'Support',
    'footer.newsletter': 'Technical newsletter',
    'footer.newsletterHint': 'Catalog news, price promotions and availability reports.',
    'footer.newsletterPlaceholder': 'name@company.com',
    'footer.newsletterSubmit': 'Subscribe',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy policy',
    'footer.cookies': 'Cookies',
    'footer.contact': 'Contact',
    'footer.complaints': 'Complaints and returns',
    'footer.delivery': 'Delivery and payments',
    'footer.certificates': 'Certificates and compliance',
    'footer.helpCenter': 'Help center',
    'chrome.departments': 'Departments',
    'chrome.browseDepartment': 'Browse {label} →',
    'chrome.megaQuickOrderTitle': 'Quick Order — 200+ lines in 30 s',
    'chrome.megaQuickOrderBody': 'Paste SKU + quantities from ERP/CSV and place an order in one click.',
    'chrome.megaQuickOrderCta': 'Open Quick Order',
    'chrome.close': 'Close',
    'chrome.categories': 'Categories',
    'chrome.seeAll': 'See all →',
    'chrome.menu': 'Menu',
    'home.mobile.shipToday': 'Ships today',
    'home.mobile.creditLimit': 'Credit limit',
    'home.mobile.vatInvoice': 'VAT invoice',
    'home.mobile.all': 'All',
    'home.hero.badge': '120,000+ SKU · 84 manufacturers · ships today',
    'home.hero.titleLine1': 'Industrial components',
    'home.hero.titleLine2Before': 'available ',
    'home.hero.titleEm': 'off the shelf',
    'home.hero.titleLine2After': '.',
    'home.hero.body': 'B2B wholesale for maintenance, automation integrators and production teams. Net prices, credit limits, datasheets and 3.1 certificates — in one place.',
    'home.hero.browseCatalog': 'Browse catalog',
    'home.hero.quickOrderCsv': 'Quick Order from CSV',
    'home.stat.stock': 'Items in stock',
    'home.stat.makers': 'Manufacturers',
    'home.stat.cutoff': 'Shipping cut-off',
    'home.stat.availability': 'On-stock availability',
    'home.demo.dynamicLoad': 'Dynamic load rating',
    'home.demo.datasheet': 'Datasheet',
    'home.demo.certificate': 'Certificate 3.1',
    'home.demo.model3d': '3D STEP model',
    'home.assortment.eyebrow': '01 / Assortment',
    'home.assortment.title': 'Six key departments',
    'home.assortment.body': 'The category tree mirrors manufacturer catalogues — find what you need quickly.',
    'home.assortment.seeAll': 'See all',
    'home.assortment.products': '{count} products',
    'home.benefit.shipTitle': 'Same-day shipping',
    'home.benefit.shipBody': 'Cut-off 14:00. 98.4% of lines on-stock at the central warehouse.',
    'home.benefit.creditTitle': 'Credit limit',
    'home.benefit.creditBody': 'From 5,000 to 500,000. Deferred invoices at 14/30/60 days.',
    'home.benefit.docsTitle': 'Datasheets and CAD',
    'home.benefit.docsBody': 'Every product has a PDF datasheet, 3D STEP/DXF and RoHS declaration.',
    'home.benefit.erpTitle': 'ERP integration',
    'home.benefit.erpBody': 'REST API, webhooks, CSV/EDI export. Quick Order for 200+ lines.',
    'home.bestsellers.eyebrow': '02 / Bestsellers',
    'home.bestsellers.title': 'Most ordered this week',
    'home.bestsellers.body': 'Ready to ship, proven in maintenance.',
    'home.bestsellers.seeAll': 'All bestsellers',
    'home.fallback.fasteners': 'Fasteners',
    'home.fallback.tools': 'Tools',
    'home.fallback.electronics': 'Electronics',
    'home.fallback.safety': 'Safety',
    'home.fallback.screws': 'Screws',
    'home.fallback.bolts': 'Bolts',
},
  'zh-CN': {
    'a11y.skipToContent': '跳到主要内容',
    'a11y.navigating': '正在加载下一页。',
    'a11y.navigatingSlow': '仍在加载。下一页比平时更慢。',
    'nav.home': '首页',
    'nav.catalog': '商品目录',
    'nav.search': '搜索',
    'nav.account': '账户',
    'nav.login': '登录',
    'nav.quickOrder': '快速下单',
    'nav.cart': '购物车',
    'nav.quoteRequest': '询价',
    'catalog.heading': '商品目录',
    'catalog.filters': '筛选',
    'catalog.empty': '没有符合筛选条件的商品。',
    'catalog.emptyPageMore': '本页没有商品。下一页还有更多。',
    'catalog.loadMore': '加载更多',
    'catalog.sort.priceAsc': '价格：从低到高',
    'catalog.sort.priceDesc': '价格：从高到低',
    'gallery.zoom': '放大',
    'compare.add': '加入对比',
    'compare.remove': '从对比移除',
    'card.list.addedTo': '已加入「{name}」',
    'catalog.count': '{count} 件商品',
    'catalog.showing': '显示',
    'catalog.showing.results': '条结果',
    'catalog.sort.aria': '排序',
    'catalog.sort.relevance': '排序：相关度',
    'catalog.sort.newest': '最新',
    'catalog.sort.nameAsc': '名称 A–Z',
    'catalog.sort.nameDesc': '名称 Z–A',
    'catalog.perPage': '{n} / 页',
    'catalog.perPage.aria': '每页条数',
    'catalog.viewMode.aria': '视图模式',
    'catalog.view.grid': '网格',
    'catalog.view.list': '列表',
    'product.fromPerUnit': '起 / 件',
    'product.gross': '含税 {amount}',
    'catalog.price.heading': '价格',
    'catalog.price.min': '最低',
    'catalog.price.max': '最高',
    'catalog.price.apply': '应用价格区间',
    'catalog.price.clear': '清除价格区间',
    'catalog.price.unitNote': '显示的是您的单价。数量折扣和促销会在购物车中应用。',
    'product.outOfStock': '缺货',
    'product.requestQuote': '申请询价',
    'product.priceFromVariants': '起，视规格而定',
    'product.compareAtLabel': '您的价格',
    'product.listPrice': '标价',
    'product.yourPrice': '您的价格',
    'product.addToCart': '加入购物车',
    'product.addToCartFailed': '无法将商品加入购物车。',
    'product.oneClickFailed': '无法下单。',
    'product.details': '详情',
    'product.tabs.description': '描述',
    'product.tabs.parameters': '参数',
    'product.tabs.attachments': '附件',
    'product.packaging.singlePiece': '单件',
    'product.packaging.pieces': '件',
    'product.minimum.pieces': '最低起订：{count} 件',
    'product.minimum.units': '最低起订：{units} × {unit} = {count} 件',
    'product.minimum.addToCart': '将 {count} 件加入购物车',
    'common.quantity': '数量',
    'product.buy.unit': '包装单位',
    'product.quote.add': '加入询价',
    'product.quote.added': '已添加 ✓',
    'product.cartPopup.added': '商品已加入购物车。',
    'product.cartPopup.goToCart': '前往购物车',
    'product.cartPopup.continue': '继续购物',
    'product.cartPopup.close': '关闭',
    'card.list.add': '加入购物清单',
    'card.list.remove': '从购物清单移除',
    'card.list.failed': '无法更改清单',
    'card.cart.added': '已加入购物车',
    'card.cart.failed': '无法添加',
    'card.quote.added': '已加入询价',
    'compare.cart.adding': '正在添加…',
    'compare.cart.added': '✓ 已添加',
    'quickOrder.page.heading': '快速下单',
    'quickOrder.page.introPrefix': '粘贴带有 ',
    'quickOrder.page.introSuffix': ' 表头的 CSV（额外列用于规格属性），或拖放 CSV / Excel 文件。我们会先显示哪些行能匹配到真实商品，再执行添加。',
    'quickOrder.page.template': '下载 CSV 模板',
    'quickOrder.page.dropzone': '将 CSV 或 Excel 文件拖到此处，或点击选择',
    'quickOrder.page.pasteLabel': '…或粘贴 CSV',
    'quickOrder.page.preview': '预览',
    'quickOrder.built.cart': '已根据导入内容生成购物车。',
    'quickOrder.built.goToCheckout': '前往结账',
    'quickOrder.built.quote': '询价请求已创建',
    'quickOrder.built.viewQuotes': '查看询价请求',
    'quickOrder.search.heading': '查找商品',
    'quickOrder.search.hint': '按 SKU、名称或可快速搜索的属性查找，并将商品加入订单。',
    'quickOrder.search.placeholder': '搜索商品…',
    'quickOrder.search.none': '没有匹配「{query}」的商品。',
    'quickOrder.search.add': '添加',
    'quickOrder.col.sku': 'SKU',
    'quickOrder.col.name': '名称',
    'quickOrder.col.qty': '数量',
    'quickOrder.col.line': '行',
    'quickOrder.col.variant': '规格',
    'quickOrder.col.reason': '原因',
    'quickOrder.col.raw': '原始数据',
    'quickOrder.qtyFor': '{sku} 的数量',
    'quickOrder.bar.recognised': '已识别',
    'quickOrder.bar.addToCart': '将 {count} 项加入购物车',
    'quickOrder.preview.heading': '预览',
    'quickOrder.preview.recognised': '已识别',
    'quickOrder.preview.invalid': '无效',
    'quickOrder.preview.units': '单位',
    'quickOrder.preview.truncated': '文件超出导入行数上限——超出部分已被拒绝。',
    'quickOrder.preview.merged': '已合并 {count} 行重复数据（数量已相加）。',
    'quickOrder.preview.recognisedRows': '已识别 {count} 行——请选择下一步操作。',
    'quickOrder.preview.update': '更新',
    'quickOrder.preview.remove': '移除',
    'quickOrder.preview.addAll': '全部加入购物车',
    'quickOrder.preview.sendAsQuote': '作为询价请求发送',
    'quickOrder.preview.noneMatched': '没有行与商品目录匹配。',
    'quickOrder.preview.rejectedHeading': '被拒绝的行',
    'quickOrder.problem.no_input': '请提供文件或粘贴 CSV。',
    'quickOrder.problem.nothing_to_update': '没有可更新的内容。',
    'quickOrder.problem.nothing_to_remove': '没有可移除的内容。',
    'quickOrder.problem.nothing_to_build': '没有可生成的内容。',
    'quickOrder.problem.import_failed': '导入失败。',
    'quickOrder.problem.build_failed': '无法生成购物车或询价请求。',
    'shoppingList.qty.invalid': '请输入 1 到 9999 的整数。',
    'shoppingList.qty.save': '保存',
    'order.minimum.below.pieces': '低于最低起订量（{count} 件）',
    'order.minimum.below.units': '低于最低起订量（{units} × {unit}）',
    'order.minimum.below.unitsUnnamed': '低于最低起订量（{units} 个包装单位）',
    'order.minimum.below.bare': '低于最低起订量',
    'cart.line.noLongerAvailable': '已不可用',
    'cart.line.unknownProduct': '商品已从目录中移除',
    'cart.line.setToMinimum': '设为 {count} 件',
    'cart.line.minimumHint': '最低 {count} 件',
    'cart.line.quantityInvalid': '请输入整数。输入 0 将移除该行。',
    'cart.line.updateFailed': '无法更新数量。请重试。',
    'cart.line.removeFailed': '无法移除该行。请重试。',
    'cart.checkoutBlocked': '请修改或移除标记的商品行后再继续结账。',
    'cart.approvalBlocked': '请修改或移除标记的商品行后再提交审批。',
    'batchReport.more': '另有 {count} 项',
    'cart.submitForApprovalFailed': '无法提交购物车审批。',
    'cart.dropped.belowMinimum': '低于最低起订量（最低 {minimum}）',
    'cart.dropped.belowMinimumBare': '低于最低起订量',
    'checkout.belowMinimum.heading': '这些商品行尚不能下单',
    'checkout.belowMinimum.intro': '请在购物车中修改数量或移除该行，然后再回来下单。',
    'checkout.belowMinimum.backToCart': '在购物车中修正',
    'checkout.belowMinimum.blocked': '部分商品行低于最低起订量或已不可用。',
    'quickOrder.reason.sku_missing': '缺少 SKU',
    'quickOrder.reason.quantity_invalid': '数量无效',
    'quickOrder.reason.product_not_found': '未找到商品',
    'quickOrder.reason.product_archived': '商品已归档',
    'quickOrder.reason.malformed_row': '行格式错误',
    'quickOrder.reason.variant_not_resolved': '未识别规格',
    'quickOrder.reason.variant_ambiguous': '规格不明确',
    'quickOrder.reason.row_limit_exceeded': '超出行数上限',
    'quickOrder.reason.below_minimum': '低于最低起订量',
    'quickOrder.reason.below_minimumDetail': '本文件中该商品合计为 {total}，最低起订 {count} 件',
    'quickOrder.build.added': '已根据导入生成购物车：已添加 {added} / {total} 行。',
    'quickOrder.build.noneAdded': '没有商品行被加入购物车。',
    'quickOrder.build.rejectedHeading': '未加入购物车',
    'quickOrder.build.rejectedLine': '{product} × {quantity} — {reason}',
    'quickOrder.build.openCart': '打开购物车',
    'shoppingList.skip.heading': '未加入购物车',
    'shoppingList.skip.product_archived': '商品已归档',
    'shoppingList.skip.variant_unavailable': '规格已不可用',
    'shoppingList.skip.product_not_found': '商品已不可用',
    'product.inStock': '有货',
    'product.stockBand.high': '有货 — 库存充足',
    'product.stockBand.medium': '有货',
    'product.stockBand.low': '库存偏低',
    'product.notify.cta': '到货时通知我',
    'product.notify.dialogTitle': '商品到货时通知我',
    'product.notify.emailLabel': '电子邮箱',
    'product.notify.submit': '订阅通知',
    'product.notify.submitting': '正在订阅…',
    'product.notify.success': '该商品到货后我们会立即发邮件通知您。',
    'product.notify.errorGeneric': '订阅失败——请重试。',
    'product.notify.cancel': '取消',
    'product.backorder.hint': '当前缺货——可预订，下一批到货后尽快发货。',
    'product.variants.heading': '规格',
    'product.variants.sku': 'SKU',
    'product.variants.stockLevel': '有货',
    'product.variants.outOfStock': '缺货',
    'product.variants.selectThisVariant': '当前已选',
    'product.links.related': '相关商品',
    'product.links.upSell': '您可能还喜欢',
    'product.links.crossSell': '您可能还需要',
    'product.links.seeAll': '查看全部',
    'product.bundle.addToCart': '将套装加入购物车',
    'product.bundle.requiredSlot': '必选',
    'product.grouped.addBundleToCart': '将套装加入购物车',
    'product.virtual.buyAndDownload': '购买并下载',
    'product.virtual.digitalDelivery': '数字交付 — 购买后立即访问',
    'search.placeholder': '搜索商品…',
    'search.unavailable': '搜索暂时不可用。',
    'search.seeAllResults': '查看全部结果',
    'common.searchAction': '搜索',
    'pagination.next': '下一页',
    'product.attributes.tabTitle': '规格参数',
    'product.attributes.boolean.yes': '是',
    'product.attributes.boolean.no': '否',
    'checkout.success.title': '感谢您 — 订单已提交',
    'checkout.success.orderNumberPrefix': '您的订单号是 ',
    'checkout.success.confirmationSent': '我们已收到订单，并发送了确认邮件。',
    'checkout.success.bankTransferHint': '请按我们邮件发送的形式发票上的付款参考信息进行银行转账。款项到账后我们会更新订单状态。',
    'checkout.success.pickupHint': '您将在取货/送达时付款。目前无需其他操作。',
    'checkout.success.creditLimitHint': '本订单将占用贵组织的信用额度，现已进入处理流程。',
    'checkout.success.viewOrder': '查看订单详情',
    'checkout.success.allOrders': '全部订单',
    'checkout.success.continueShopping': '继续购物',
    'checkout.failure.title': '无法完成您的订单',
    'checkout.failure.generic': '下单时出现问题。您的购物车已保留，可以重试。',
    'checkout.failure.cartKept': '购物车未更改——未扣款，也未创建订单。',
    'checkout.failure.tryAgain': '重试',
    'checkout.failure.backToCart': '返回购物车',
    'checkout.paymentFailure.title.failed': '付款未成功',
    'checkout.paymentFailure.title.cancelled': '付款未完成',
    'checkout.paymentFailure.orderPlacedPrefix': '您的订单 ',
    'checkout.paymentFailure.orderPlacedSuffix': ' 已创建，正在等待付款。尚未扣款。',
    'checkout.paymentFailure.failedBody': '支付服务商未接受本次付款。',
    'checkout.paymentFailure.cancelledBody': '付款在完成前被中止，因此未扣款。',
    'checkout.paymentFailure.payAgain': '重新支付此订单',
    'checkout.paymentFailure.retryHint': '您可以为此同一订单重新发起付款。',
    'checkout.paymentFailure.noRetryHint': '此订单目前无法在线支付。请打开订单查看下一步操作。',
    'checkout.paymentFailure.viewOrder': '查看订单详情',
    'checkout.paymentFailure.allOrders': '全部订单',
    'checkout.paymentPending.title': '正在确认您的付款',
    'checkout.paymentPending.orderNumberPrefix': '您的订单号是 ',
    'checkout.paymentPending.placed': '订单已提交。您无需再做任何事——我们正在等待支付服务商确认付款，通常只需几秒钟。',
    'checkout.paymentPending.stillWaiting': '这比平时更久。付款确认后我们会立即发邮件通知您，订单页面也会始终显示当前状态。',
    'checkout.paymentPending.checkAgain': '再次检查',
    'checkout.paymentPending.viewOrder': '查看订单详情',
    'order.payment.retry.cta': '重新支付',
    'order.payment.retry.hint': '付款未成功。尚未扣款——您可以重新支付此订单。',
    'order.payment.retry.inProgress': '此订单已有一笔付款正在进行。请在支付页面完成，或等待其超时后再发起新的付款。',
    'order.payment.retry.failed': '无法发起付款。请稍后再试。',
    'order.cancel.cta': '取消此订单',
    'order.cancel.hint': '您尚未付款，我们也尚未开始处理，因此仍可取消。预留的商品会立即恢复可售。',
    'order.cancel.failed': '无法取消此订单。请联系我们，我们会协助处理。',
    'checkout.delivery.none': '您的账户在此销售渠道没有可用的配送方式。',
    'checkout.payment.none': '您的账户在此销售渠道没有可用的支付方式。',
    'checkout.error.title': '无法加载结账页',
    'checkout.error.body': '我们这边出了问题。您的购物车未受影响，未下单也未扣款——请稍后再试。',
    'checkout.error.retry': '重试',
    'checkout.error.backToCart': '返回购物车',
    'checkout.error.referencePrefix': '参考编号：',
    'checkout.coupon.label': '优惠码（可选）',
    'checkout.coupon.apply': '应用',
    'checkout.coupon.appliedPrefix': '优惠码 ',
    'checkout.coupon.appliedSuffix': '已应用 — ',
    'checkout.coupon.remove': '移除',
    'checkout.address.shippingTitle': '收货地址',
    'checkout.address.billingTitle': '账单地址',
    'checkout.address.useSaved': '使用已保存地址',
    'checkout.address.enterNew': '输入新地址',
    'checkout.address.sameAsShipping': '账单地址与收货地址相同',
    'checkout.address.recipientName': '收件人姓名',
    'checkout.address.street': '街道与门牌号',
    'checkout.address.postalCode': '邮政编码',
    'checkout.address.city': '城市',
    'checkout.address.country': '国家/地区（例如 PL）',
    'checkout.address.phone': '电话（可选）',
    'checkout.address.billingCompanyTitle': '开票公司信息',
    'checkout.address.billingCompanyHint': '默认使用您的组织信息。如需可为本订单覆盖。',
    'checkout.address.companyName': '公司名称',
    'checkout.address.taxId': '税号（NIP）',
    'checkout.shipping.title': '配送方式',
    'checkout.shipping.empty': '您的账户在此销售渠道没有可用的配送方式。',
    'checkout.shipping.free': '免费',
    'quoteRequest.success.title': '感谢您 — 询价请求已提交',
    'quoteRequest.success.numberPrefix': '您的询价请求编号是 ',
    'quoteRequest.success.confirmationSent': '我们已收到请求，并发送了确认邮件。',
    'quoteRequest.success.nextStepsHint': '销售团队将审核您的请求，并准备含价格与条款的报价。报价就绪后会通知您。',
    'quoteRequest.success.viewRequest': '查看询价请求',
    'quoteRequest.success.allRequests': '全部询价请求',
    'quoteRequest.success.continueShopping': '继续购物',
    'quoteRequest.diff.grouping': '商品行的分组已变更。',
    'lineGroups.otherItems': '其他商品',
    'lineGroups.summary.items.one': '{count} 件商品',
    'lineGroups.summary.items.few': '{count} 件商品',
    'lineGroups.summary.items.many': '{count} 件商品',
    'lineGroups.summary.items.other': '{count} 件商品',
    'lineGroups.summary.net': '未税 {amount}',
    'lineGroups.summary.vat': 'VAT {amount}',
    'lineGroups.summary.gross': '含税 {amount}',
    'auth.federated.groupLabel': '其他登录方式',
    'auth.federated.divider': '或',
    'auth.federated.google': '使用 Google 继续',
    'auth.federated.microsoft': '使用 Microsoft 继续',
    'auth.login.signInRequired': '本商店仅向已登录的企业客户开放。请登录，或申请企业账户。',
    'auth.login.channelNotPermitted': '此账户无权访问本商店。',
    'access.signInRequired': '本商店仅向已登录客户开放。请登录。',
    'access.denied.title': '无法访问本商店',
    'access.denied.body': '您的账户未配置为可在本商店购买。',
    'access.denied.otherStores': '您可以使用的商店：',
    'access.denied.signOut': '退出登录',
    'access.denied.contact': '如需在此购买，请联系贵组织的管理员或我们的销售团队。',
    'account.socialLinks.heading': '已关联账户',
    'account.socialLinks.intro': '这些外部账户可用于登录。移除其中一个不会删除您的账户。',
    'account.socialLinks.linkedOn': '关联于',
    'account.socialLinks.remove': '移除',
    'account.socialLinks.lastCredential': '这是关联到您账户的最后一个登录身份，且账户未设置密码——现在移除可能导致永久无法登录。请先设置密码，然后再移除。',
    'account.socialLinks.setPassword': '设置密码',
    'account.push.heading': '推送通知',
    'account.push.device.heading': '此设备上的通知',
    'account.push.device.on': '此浏览器已开启订单与询价相关通知。',
    'account.push.device.off': '此浏览器已关闭通知。',
    'account.push.device.blocked': '通知已在此浏览器的网站设置中被阻止。',
    'account.push.device.turnOn': '开启通知',
    'account.push.device.turnOff': '关闭通知',
    'account.push.preferences.heading': '通知内容偏好',
    'account.push.preferences.hint': '这些选择适用于您已开启通知的所有设备。',
    'account.push.preferences.orderStatus': '订单状态更新',
    'account.push.preferences.quoteStatus': '询价更新',
    'account.push.preferences.save': '保存选择',
    'account.push.preferences.saved': '您的选择已保存。',
    'account.push.preferences.error': '无法保存您的选择。请重试。',
    'compare.pdf.busy': '正在生成…',
    'compare.pdf.failed': '无法生成 PDF。',
    'compare.shared.pricesYours': '显示的是贵组织的价格。',
    'compare.shared.pricesChannel': '显示的是本商店标准价格。登录后可查看贵组织约定价格。',
    'compare.shared.hiddenProducts': '此对比中的部分商品对您的账户不可用，故未显示。',
    'orders.paymentReturn.returned': '您已从支付服务商返回。订单已提交；我们仍在等待付款确认，结果一到本页就会显示。',
    'orders.paymentReturn.cancelled': '您尚未付款。订单已提交并等待付款——尚未扣款。',
    'orders.paymentReturn.failed': '付款未成功。订单已提交并仍在等待付款，您可以重试。',
    'orders.actionFailed': '无法完成该操作。',
    'returns.new.heading': '发起退货或投诉',
    'returns.new.chooseOrder': '选择退货或投诉所针对的订单：',
    'returns.new.noOrders': '您还没有任何订单。',
    'returns.new.backToReturns': '← 返回退货',
    'returns.new.chooseAnotherOrder': '← 选择其他订单',
    'returns.new.freeReturnWindow': '此订单仍在免费退货期限内。',
    'returns.new.kind.legend': '您要提交什么？',
    'returns.new.kind.return': '退货',
    'returns.new.kind.complaint': '投诉',
    'returns.new.col.include': '包含',
    'returns.new.col.product': '商品',
    'returns.new.col.qty': '数量',
    'returns.new.col.reason': '原因',
    'returns.new.selectReason': '请选择…',
    'returns.new.comment': '补充说明（可选）',
    'returns.new.submit.return': '提交退货申请',
    'returns.new.submit.complaint': '提交投诉',
    'returns.new.none.notCompleting': '此订单尚不符合退货或投诉条件。',
    'returns.new.none.fullyReturned': '此订单的全部商品均已退货。',
    'returns.new.none.windowPassed': '此订单已无法退货——退货期限已过。',
    'returns.new.none.generic': '此订单不符合退货条件。',
    'returns.new.complaintOnly': '此订单中没有可退货商品。您仍可就其提交投诉。',
    'returns.line.notReturnable': '此商品不可退货；仍可投诉。',
    'returns.line.remaining': '共 {count}',
    'orders.returnAction.return': '申请退货 / 投诉',
    'orders.returnAction.complaint': '提交投诉',
    'quoteRequests.validity.validUntil': '有效期至 ',
    'quoteRequests.validity.endedOn': '有效期已于 ',
    'quoteRequests.validity.acceptBlocked': '此报价的有效期已结束，这些价格无法再接受。请重新提交请求以获取当前报价。',
    'quoteRequests.validity.convertBlocked': '您已接受的报价已失效，无法再转为订单。报价获批后截止时间不可再改——请重新提交请求以获取当前报价。',
    'quoteRequests.resubmit': '重新提交',
    'serviceUnavailable.documentTitle': '服务不可用',
    'serviceUnavailable.status': '临时故障',
    'serviceUnavailable.heading': '商店暂时不可用。',
    'serviceUnavailable.body': '我们无法连接到构成本页所需的系统，因此暂时无法显示。这是我们这边的问题，不是您的问题，我们已在处理。',
    'serviceUnavailable.reassurance': '没有任何内容丢失。您的购物车、账户以及已提交的订单均未受影响。',
    'serviceUnavailable.retry': '重试',
    'serviceUnavailable.retryHint': '通常大约一分钟后再试即可。',
    'cms.carousel.label': '轮播',
    'cms.carousel.previous': '上一张',
    'cms.carousel.next': '下一张',
    'cms.carousel.slide': '{n} / {m}',
    'cms.carousel.goToSlide': '转到第 {n} 张',
    'cms.carousel.goToPage': '转到第 {n} 页',
    'cms.carousel.pause': '暂停自动播放',
    'cms.carousel.play': '开始自动播放',
    'cms.carousel.filter': '筛选',
    'cms.carousel.filterAll': '全部',
    'cms.carousel.filterCount': '显示 {n} / {m}',
      'chrome.language': '语言',
    'chrome.currency': '货币',
    'chrome.shippingCutoff': '今日 14:00 前下单可当日发货',
    'chrome.vatInvoice': '增值税发票',
    'chrome.b2bSupport': 'B2B 支持',
    'chrome.brandTagline': 'B2B · 工业元器件',
    'chrome.brandTaglineShort': 'B2B 元器件',
    'chrome.allCategories': '全部分类',
    'chrome.allCategoriesArrow': '全部分类 →',
    'chrome.allPrefix': '全部：{label}',
    'chrome.shoppingList': '采购清单',
    'chrome.rfq': '询价',
    'chrome.rfqCount': '询价 · {count} 项',
    'chrome.compare': '对比商品',
    'chrome.cart': '购物车',
    'chrome.cartCount': '购物车 · {count} 件',
    'account.nav.aria': '账户',
    'account.nav.profile': '个人资料',
    'account.nav.addresses': '我的地址',
    'account.nav.password': '修改密码',
    'account.nav.orders': '订单',
    'account.nav.returns': '退货',
    'account.nav.quoteRequests': '询价单',
    'account.nav.bidding': '竞价',
    'account.nav.shoppingLists': '采购清单',
    'account.nav.quickOrder': '快速下单',
    'account.nav.organization': '组织',
    'account.nav.orgAddresses': '组织地址',
    'account.nav.members': '成员',
    'account.nav.signOut': '退出登录',
    'footer.blurb': '工业元器件 B2B 批发。轴承、传动、自动化、电气、气动与工具。当日发货、账期发票与完整技术资料。',
    'footer.shop': '商店',
    'footer.catalog': '商品目录',
    'footer.fasteners': '紧固件',
    'footer.tools': '工具',
    'footer.electronics': '电子',
    'footer.safety': '安全防护',
    'footer.account': 'B2B 账户',
    'footer.myAccount': '我的账户',
    'footer.orders': '订单',
    'footer.invoices': '发票',
    'footer.rfq': 'RFQ — 询价',
    'footer.shoppingLists': '采购清单',
    'footer.creditLimit': '信用额度',
    'footer.support': '支持',
    'footer.newsletter': '技术通讯',
    'footer.newsletterHint': '目录新品、促销与库存报告。',
    'footer.newsletterPlaceholder': 'name@company.com',
    'footer.newsletterSubmit': '订阅',
    'footer.terms': '条款',
    'footer.privacy': '隐私政策',
    'footer.cookies': 'Cookies',
    'footer.contact': '联系我们',
    'footer.complaints': '投诉与退货',
    'footer.delivery': '配送与支付',
    'footer.certificates': '认证与合规',
    'footer.helpCenter': '帮助中心',
    'chrome.departments': '分类',
    'chrome.browseDepartment': '浏览 {label} →',
    'chrome.megaQuickOrderTitle': '快速下单 — 30 秒内 200+ 行',
    'chrome.megaQuickOrderBody': '从 ERP/CSV 粘贴 SKU 与数量，一键创建订单。',
    'chrome.megaQuickOrderCta': '打开快速下单',
    'chrome.close': '关闭',
    'chrome.categories': '分类',
    'chrome.seeAll': '查看全部 →',
    'chrome.menu': '菜单',
    'home.mobile.shipToday': '今日发货',
    'home.mobile.creditLimit': '信用额度',
    'home.mobile.vatInvoice': '增值税发票',
    'home.mobile.all': '全部',
    'home.hero.badge': '120,000+ SKU · 84 家厂商 · 今日发货',
    'home.hero.titleLine1': '工业元器件',
    'home.hero.titleLine2Before': '',
    'home.hero.titleEm': '现货供应',
    'home.hero.titleLine2After': '。',
    'home.hero.body': '面向维保、自动化集成商与生产部门的 B2B 批发。净价、信用额度、产品目录与 3.1 证书——一站齐全。',
    'home.hero.browseCatalog': '浏览目录',
    'home.hero.quickOrderCsv': 'CSV 快速下单',
    'home.stat.stock': '库存品项',
    'home.stat.makers': '厂商',
    'home.stat.cutoff': '发货截止',
    'home.stat.availability': '现货可用率',
    'home.demo.dynamicLoad': '动载荷',
    'home.demo.datasheet': '产品目录',
    'home.demo.certificate': '3.1 证书',
    'home.demo.model3d': '3D STEP 模型',
    'home.assortment.eyebrow': '01 / 品类',
    'home.assortment.title': '六大核心品类',
    'home.assortment.body': '分类树对齐厂商目录——快速找到所需货品。',
    'home.assortment.seeAll': '查看全部',
    'home.assortment.products': '{count} 件商品',
    'home.benefit.shipTitle': '当日发货',
    'home.benefit.shipBody': '截止 14:00。中央仓现货占比 98.4%。',
    'home.benefit.creditTitle': '信用额度',
    'home.benefit.creditBody': '额度 5,000–500,000。账期发票 14/30/60 天。',
    'home.benefit.docsTitle': '目录卡与 CAD',
    'home.benefit.docsBody': '每件商品含 PDF 目录、3D STEP/DXF 与 RoHS 声明。',
    'home.benefit.erpTitle': 'ERP 对接',
    'home.benefit.erpBody': 'REST API、Webhook、CSV/EDI 导出。支持 200+ 行快速下单。',
    'home.bestsellers.eyebrow': '02 / 畅销',
    'home.bestsellers.title': '本周最常下单',
    'home.bestsellers.body': '现货可发，维保常用。',
    'home.bestsellers.seeAll': '全部畅销',
    'home.fallback.fasteners': '紧固件',
    'home.fallback.tools': '工具',
    'home.fallback.electronics': '电子',
    'home.fallback.safety': '安全防护',
    'home.fallback.screws': '螺钉',
    'home.fallback.bolts': '螺栓',
},

  'zh-TW': {
    'a11y.skipToContent': '跳到主要内容',
    'a11y.navigating': '正在加载下一页。',
    'a11y.navigatingSlow': '仍在加载。下一页比平时更慢。',
    'nav.home': '首页',
    'nav.catalog': '商品目录',
    'nav.search': '搜索',
    'nav.account': '账户',
    'nav.login': '登录',
    'nav.quickOrder': '快速下单',
    'nav.cart': '购物车',
    'nav.quoteRequest': '询价',
    'catalog.heading': '商品目录',
    'catalog.filters': '筛选',
    'catalog.empty': '没有符合筛选条件的商品。',
    'catalog.emptyPageMore': '本页没有商品。下一页还有更多。',
    'catalog.loadMore': '加载更多',
    'catalog.sort.priceAsc': '价格：从低到高',
    'catalog.sort.priceDesc': '价格：从高到低',
    'gallery.zoom': '放大',
    'compare.add': '加入對比',
    'compare.remove': '從對比移除',
    'card.list.addedTo': '已加入「{name}」',
    'catalog.count': '{count} 件商品',
    'catalog.showing': '顯示',
    'catalog.showing.results': '條結果',
    'catalog.sort.aria': '排序',
    'catalog.sort.relevance': '排序：相關度',
    'catalog.sort.newest': '最新',
    'catalog.sort.nameAsc': '名稱 A–Z',
    'catalog.sort.nameDesc': '名稱 Z–A',
    'catalog.perPage': '{n} / 頁',
    'catalog.perPage.aria': '每頁筆數',
    'catalog.viewMode.aria': '檢視模式',
    'catalog.view.grid': '網格',
    'catalog.view.list': '列表',
    'product.fromPerUnit': '起 / 件',
    'product.gross': '含稅 {amount}',
    'catalog.price.heading': '价格',
    'catalog.price.min': '最低',
    'catalog.price.max': '最高',
    'catalog.price.apply': '应用价格区间',
    'catalog.price.clear': '清除价格区间',
    'catalog.price.unitNote': '显示的是您的单价。数量折扣和促销会在购物车中应用。',
    'product.outOfStock': '缺货',
    'product.requestQuote': '申请询价',
    'product.priceFromVariants': '起，视规格而定',
    'product.compareAtLabel': '您的价格',
    'product.listPrice': '标价',
    'product.yourPrice': '您的价格',
    'product.addToCart': '加入购物车',
    'product.addToCartFailed': '无法将商品加入购物车。',
    'product.oneClickFailed': '无法下单。',
    'product.details': '详情',
    'product.tabs.description': '描述',
    'product.tabs.parameters': '参数',
    'product.tabs.attachments': '附件',
    'product.packaging.singlePiece': '单件',
    'product.packaging.pieces': '件',
    'product.minimum.pieces': '最低起订：{count} 件',
    'product.minimum.units': '最低起订：{units} × {unit} = {count} 件',
    'product.minimum.addToCart': '将 {count} 件加入购物车',
    'common.quantity': '数量',
    'product.buy.unit': '包装单位',
    'product.quote.add': '加入询价',
    'product.quote.added': '已添加 ✓',
    'product.cartPopup.added': '商品已加入购物车。',
    'product.cartPopup.goToCart': '前往购物车',
    'product.cartPopup.continue': '继续购物',
    'product.cartPopup.close': '关闭',
    'card.list.add': '加入购物清单',
    'card.list.remove': '从购物清单移除',
    'card.list.failed': '无法更改清单',
    'card.cart.added': '已加入购物车',
    'card.cart.failed': '无法添加',
    'card.quote.added': '已加入询价',
    'compare.cart.adding': '正在添加…',
    'compare.cart.added': '✓ 已添加',
    'quickOrder.page.heading': '快速下单',
    'quickOrder.page.introPrefix': '粘贴带有 ',
    'quickOrder.page.introSuffix': ' 表头的 CSV（额外列用于规格属性），或拖放 CSV / Excel 文件。我们会先显示哪些行能匹配到真实商品，再执行添加。',
    'quickOrder.page.template': '下载 CSV 模板',
    'quickOrder.page.dropzone': '将 CSV 或 Excel 文件拖到此处，或点击选择',
    'quickOrder.page.pasteLabel': '…或粘贴 CSV',
    'quickOrder.page.preview': '预览',
    'quickOrder.built.cart': '已根据导入内容生成购物车。',
    'quickOrder.built.goToCheckout': '前往结账',
    'quickOrder.built.quote': '询价请求已创建',
    'quickOrder.built.viewQuotes': '查看询价请求',
    'quickOrder.search.heading': '查找商品',
    'quickOrder.search.hint': '按 SKU、名称或可快速搜索的属性查找，并将商品加入订单。',
    'quickOrder.search.placeholder': '搜索商品…',
    'quickOrder.search.none': '没有匹配「{query}」的商品。',
    'quickOrder.search.add': '添加',
    'quickOrder.col.sku': 'SKU',
    'quickOrder.col.name': '名称',
    'quickOrder.col.qty': '数量',
    'quickOrder.col.line': '行',
    'quickOrder.col.variant': '规格',
    'quickOrder.col.reason': '原因',
    'quickOrder.col.raw': '原始数据',
    'quickOrder.qtyFor': '{sku} 的数量',
    'quickOrder.bar.recognised': '已识别',
    'quickOrder.bar.addToCart': '将 {count} 项加入购物车',
    'quickOrder.preview.heading': '预览',
    'quickOrder.preview.recognised': '已识别',
    'quickOrder.preview.invalid': '无效',
    'quickOrder.preview.units': '单位',
    'quickOrder.preview.truncated': '文件超出导入行数上限——超出部分已被拒绝。',
    'quickOrder.preview.merged': '已合并 {count} 行重复数据（数量已相加）。',
    'quickOrder.preview.recognisedRows': '已识别 {count} 行——请选择下一步操作。',
    'quickOrder.preview.update': '更新',
    'quickOrder.preview.remove': '移除',
    'quickOrder.preview.addAll': '全部加入购物车',
    'quickOrder.preview.sendAsQuote': '作为询价请求发送',
    'quickOrder.preview.noneMatched': '没有行与商品目录匹配。',
    'quickOrder.preview.rejectedHeading': '被拒绝的行',
    'quickOrder.problem.no_input': '请提供文件或粘贴 CSV。',
    'quickOrder.problem.nothing_to_update': '没有可更新的内容。',
    'quickOrder.problem.nothing_to_remove': '没有可移除的内容。',
    'quickOrder.problem.nothing_to_build': '没有可生成的内容。',
    'quickOrder.problem.import_failed': '导入失败。',
    'quickOrder.problem.build_failed': '无法生成购物车或询价请求。',
    'shoppingList.qty.invalid': '请输入 1 到 9999 的整数。',
    'shoppingList.qty.save': '保存',
    'order.minimum.below.pieces': '低于最低起订量（{count} 件）',
    'order.minimum.below.units': '低于最低起订量（{units} × {unit}）',
    'order.minimum.below.unitsUnnamed': '低于最低起订量（{units} 个包装单位）',
    'order.minimum.below.bare': '低于最低起订量',
    'cart.line.noLongerAvailable': '已不可用',
    'cart.line.unknownProduct': '商品已从目录中移除',
    'cart.line.setToMinimum': '设为 {count} 件',
    'cart.line.minimumHint': '最低 {count} 件',
    'cart.line.quantityInvalid': '请输入整数。输入 0 将移除该行。',
    'cart.line.updateFailed': '无法更新数量。请重试。',
    'cart.line.removeFailed': '无法移除该行。请重试。',
    'cart.checkoutBlocked': '请修改或移除标记的商品行后再继续结账。',
    'cart.approvalBlocked': '请修改或移除标记的商品行后再提交审批。',
    'batchReport.more': '另有 {count} 项',
    'cart.submitForApprovalFailed': '无法提交购物车审批。',
    'cart.dropped.belowMinimum': '低于最低起订量（最低 {minimum}）',
    'cart.dropped.belowMinimumBare': '低于最低起订量',
    'checkout.belowMinimum.heading': '这些商品行尚不能下单',
    'checkout.belowMinimum.intro': '请在购物车中修改数量或移除该行，然后再回来下单。',
    'checkout.belowMinimum.backToCart': '在购物车中修正',
    'checkout.belowMinimum.blocked': '部分商品行低于最低起订量或已不可用。',
    'quickOrder.reason.sku_missing': '缺少 SKU',
    'quickOrder.reason.quantity_invalid': '数量无效',
    'quickOrder.reason.product_not_found': '未找到商品',
    'quickOrder.reason.product_archived': '商品已归档',
    'quickOrder.reason.malformed_row': '行格式错误',
    'quickOrder.reason.variant_not_resolved': '未识别规格',
    'quickOrder.reason.variant_ambiguous': '规格不明确',
    'quickOrder.reason.row_limit_exceeded': '超出行数上限',
    'quickOrder.reason.below_minimum': '低于最低起订量',
    'quickOrder.reason.below_minimumDetail': '本文件中该商品合计为 {total}，最低起订 {count} 件',
    'quickOrder.build.added': '已根据导入生成购物车：已添加 {added} / {total} 行。',
    'quickOrder.build.noneAdded': '没有商品行被加入购物车。',
    'quickOrder.build.rejectedHeading': '未加入购物车',
    'quickOrder.build.rejectedLine': '{product} × {quantity} — {reason}',
    'quickOrder.build.openCart': '打开购物车',
    'shoppingList.skip.heading': '未加入购物车',
    'shoppingList.skip.product_archived': '商品已归档',
    'shoppingList.skip.variant_unavailable': '规格已不可用',
    'shoppingList.skip.product_not_found': '商品已不可用',
    'product.inStock': '有货',
    'product.stockBand.high': '有货 — 库存充足',
    'product.stockBand.medium': '有货',
    'product.stockBand.low': '库存偏低',
    'product.notify.cta': '到货时通知我',
    'product.notify.dialogTitle': '商品到货时通知我',
    'product.notify.emailLabel': '电子邮箱',
    'product.notify.submit': '订阅通知',
    'product.notify.submitting': '正在订阅…',
    'product.notify.success': '该商品到货后我们会立即发邮件通知您。',
    'product.notify.errorGeneric': '订阅失败——请重试。',
    'product.notify.cancel': '取消',
    'product.backorder.hint': '当前缺货——可预订，下一批到货后尽快发货。',
    'product.variants.heading': '规格',
    'product.variants.sku': 'SKU',
    'product.variants.stockLevel': '有货',
    'product.variants.outOfStock': '缺货',
    'product.variants.selectThisVariant': '当前已选',
    'product.links.related': '相关商品',
    'product.links.upSell': '您可能还喜欢',
    'product.links.crossSell': '您可能还需要',
    'product.links.seeAll': '查看全部',
    'product.bundle.addToCart': '将套装加入购物车',
    'product.bundle.requiredSlot': '必选',
    'product.grouped.addBundleToCart': '将套装加入购物车',
    'product.virtual.buyAndDownload': '购买并下载',
    'product.virtual.digitalDelivery': '数字交付 — 购买后立即访问',
    'search.placeholder': '搜索商品…',
    'search.unavailable': '搜索暂时不可用。',
    'search.seeAllResults': '查看全部结果',
    'common.searchAction': '搜索',
    'pagination.next': '下一页',
    'product.attributes.tabTitle': '规格参数',
    'product.attributes.boolean.yes': '是',
    'product.attributes.boolean.no': '否',
    'checkout.success.title': '感谢您 — 订单已提交',
    'checkout.success.orderNumberPrefix': '您的订单号是 ',
    'checkout.success.confirmationSent': '我们已收到订单，并发送了确认邮件。',
    'checkout.success.bankTransferHint': '请按我们邮件发送的形式发票上的付款参考信息进行银行转账。款项到账后我们会更新订单状态。',
    'checkout.success.pickupHint': '您将在取货/送达时付款。目前无需其他操作。',
    'checkout.success.creditLimitHint': '本订单将占用贵组织的信用额度，现已进入处理流程。',
    'checkout.success.viewOrder': '查看订单详情',
    'checkout.success.allOrders': '全部订单',
    'checkout.success.continueShopping': '继续购物',
    'checkout.failure.title': '无法完成您的订单',
    'checkout.failure.generic': '下单时出现问题。您的购物车已保留，可以重试。',
    'checkout.failure.cartKept': '购物车未更改——未扣款，也未创建订单。',
    'checkout.failure.tryAgain': '重试',
    'checkout.failure.backToCart': '返回购物车',
    'checkout.paymentFailure.title.failed': '付款未成功',
    'checkout.paymentFailure.title.cancelled': '付款未完成',
    'checkout.paymentFailure.orderPlacedPrefix': '您的订单 ',
    'checkout.paymentFailure.orderPlacedSuffix': ' 已创建，正在等待付款。尚未扣款。',
    'checkout.paymentFailure.failedBody': '支付服务商未接受本次付款。',
    'checkout.paymentFailure.cancelledBody': '付款在完成前被中止，因此未扣款。',
    'checkout.paymentFailure.payAgain': '重新支付此订单',
    'checkout.paymentFailure.retryHint': '您可以为此同一订单重新发起付款。',
    'checkout.paymentFailure.noRetryHint': '此订单目前无法在线支付。请打开订单查看下一步操作。',
    'checkout.paymentFailure.viewOrder': '查看订单详情',
    'checkout.paymentFailure.allOrders': '全部订单',
    'checkout.paymentPending.title': '正在确认您的付款',
    'checkout.paymentPending.orderNumberPrefix': '您的订单号是 ',
    'checkout.paymentPending.placed': '订单已提交。您无需再做任何事——我们正在等待支付服务商确认付款，通常只需几秒钟。',
    'checkout.paymentPending.stillWaiting': '这比平时更久。付款确认后我们会立即发邮件通知您，订单页面也会始终显示当前状态。',
    'checkout.paymentPending.checkAgain': '再次检查',
    'checkout.paymentPending.viewOrder': '查看订单详情',
    'order.payment.retry.cta': '重新支付',
    'order.payment.retry.hint': '付款未成功。尚未扣款——您可以重新支付此订单。',
    'order.payment.retry.inProgress': '此订单已有一笔付款正在进行。请在支付页面完成，或等待其超时后再发起新的付款。',
    'order.payment.retry.failed': '无法发起付款。请稍后再试。',
    'order.cancel.cta': '取消此订单',
    'order.cancel.hint': '您尚未付款，我们也尚未开始处理，因此仍可取消。预留的商品会立即恢复可售。',
    'order.cancel.failed': '无法取消此订单。请联系我们，我们会协助处理。',
    'checkout.delivery.none': '您的账户在此销售渠道没有可用的配送方式。',
    'checkout.payment.none': '您的账户在此销售渠道没有可用的支付方式。',
    'checkout.error.title': '无法加载结账页',
    'checkout.error.body': '我们这边出了问题。您的购物车未受影响，未下单也未扣款——请稍后再试。',
    'checkout.error.retry': '重试',
    'checkout.error.backToCart': '返回购物车',
    'checkout.error.referencePrefix': '参考编号：',
    'checkout.coupon.label': '优惠码（可选）',
    'checkout.coupon.apply': '应用',
    'checkout.coupon.appliedPrefix': '优惠码 ',
    'checkout.coupon.appliedSuffix': '已应用 — ',
    'checkout.coupon.remove': '移除',
    'checkout.address.shippingTitle': '收货地址',
    'checkout.address.billingTitle': '账单地址',
    'checkout.address.useSaved': '使用已保存地址',
    'checkout.address.enterNew': '输入新地址',
    'checkout.address.sameAsShipping': '账单地址与收货地址相同',
    'checkout.address.recipientName': '收件人姓名',
    'checkout.address.street': '街道与门牌号',
    'checkout.address.postalCode': '邮政编码',
    'checkout.address.city': '城市',
    'checkout.address.country': '国家/地区（例如 PL）',
    'checkout.address.phone': '电话（可选）',
    'checkout.address.billingCompanyTitle': '开票公司信息',
    'checkout.address.billingCompanyHint': '默认使用您的组织信息。如需可为本订单覆盖。',
    'checkout.address.companyName': '公司名称',
    'checkout.address.taxId': '税号（NIP）',
    'checkout.shipping.title': '配送方式',
    'checkout.shipping.empty': '您的账户在此销售渠道没有可用的配送方式。',
    'checkout.shipping.free': '免费',
    'quoteRequest.success.title': '感谢您 — 询价请求已提交',
    'quoteRequest.success.numberPrefix': '您的询价请求编号是 ',
    'quoteRequest.success.confirmationSent': '我们已收到请求，并发送了确认邮件。',
    'quoteRequest.success.nextStepsHint': '销售团队将审核您的请求，并准备含价格与条款的报价。报价就绪后会通知您。',
    'quoteRequest.success.viewRequest': '查看询价请求',
    'quoteRequest.success.allRequests': '全部询价请求',
    'quoteRequest.success.continueShopping': '继续购物',
    'quoteRequest.diff.grouping': '商品行的分组已变更。',
    'lineGroups.otherItems': '其他商品',
    'lineGroups.summary.items.one': '{count} 件商品',
    'lineGroups.summary.items.few': '{count} 件商品',
    'lineGroups.summary.items.many': '{count} 件商品',
    'lineGroups.summary.items.other': '{count} 件商品',
    'lineGroups.summary.net': '未税 {amount}',
    'lineGroups.summary.vat': 'VAT {amount}',
    'lineGroups.summary.gross': '含税 {amount}',
    'auth.federated.groupLabel': '其他登录方式',
    'auth.federated.divider': '或',
    'auth.federated.google': '使用 Google 继续',
    'auth.federated.microsoft': '使用 Microsoft 继续',
    'auth.login.signInRequired': '本商店仅向已登录的企业客户开放。请登录，或申请企业账户。',
    'auth.login.channelNotPermitted': '此账户无权访问本商店。',
    'access.signInRequired': '本商店仅向已登录客户开放。请登录。',
    'access.denied.title': '无法访问本商店',
    'access.denied.body': '您的账户未配置为可在本商店购买。',
    'access.denied.otherStores': '您可以使用的商店：',
    'access.denied.signOut': '退出登录',
    'access.denied.contact': '如需在此购买，请联系贵组织的管理员或我们的销售团队。',
    'account.socialLinks.heading': '已关联账户',
    'account.socialLinks.intro': '这些外部账户可用于登录。移除其中一个不会删除您的账户。',
    'account.socialLinks.linkedOn': '关联于',
    'account.socialLinks.remove': '移除',
    'account.socialLinks.lastCredential': '这是关联到您账户的最后一个登录身份，且账户未设置密码——现在移除可能导致永久无法登录。请先设置密码，然后再移除。',
    'account.socialLinks.setPassword': '设置密码',
    'account.push.heading': '推送通知',
    'account.push.device.heading': '此设备上的通知',
    'account.push.device.on': '此浏览器已开启订单与询价相关通知。',
    'account.push.device.off': '此浏览器已关闭通知。',
    'account.push.device.blocked': '通知已在此浏览器的网站设置中被阻止。',
    'account.push.device.turnOn': '开启通知',
    'account.push.device.turnOff': '关闭通知',
    'account.push.preferences.heading': '通知内容偏好',
    'account.push.preferences.hint': '这些选择适用于您已开启通知的所有设备。',
    'account.push.preferences.orderStatus': '订单状态更新',
    'account.push.preferences.quoteStatus': '询价更新',
    'account.push.preferences.save': '保存选择',
    'account.push.preferences.saved': '您的选择已保存。',
    'account.push.preferences.error': '无法保存您的选择。请重试。',
    'compare.pdf.busy': '正在生成…',
    'compare.pdf.failed': '无法生成 PDF。',
    'compare.shared.pricesYours': '显示的是贵组织的价格。',
    'compare.shared.pricesChannel': '显示的是本商店标准价格。登录后可查看贵组织约定价格。',
    'compare.shared.hiddenProducts': '此对比中的部分商品对您的账户不可用，故未显示。',
    'orders.paymentReturn.returned': '您已从支付服务商返回。订单已提交；我们仍在等待付款确认，结果一到本页就会显示。',
    'orders.paymentReturn.cancelled': '您尚未付款。订单已提交并等待付款——尚未扣款。',
    'orders.paymentReturn.failed': '付款未成功。订单已提交并仍在等待付款，您可以重试。',
    'orders.actionFailed': '无法完成该操作。',
    'returns.new.heading': '发起退货或投诉',
    'returns.new.chooseOrder': '选择退货或投诉所针对的订单：',
    'returns.new.noOrders': '您还没有任何订单。',
    'returns.new.backToReturns': '← 返回退货',
    'returns.new.chooseAnotherOrder': '← 选择其他订单',
    'returns.new.freeReturnWindow': '此订单仍在免费退货期限内。',
    'returns.new.kind.legend': '您要提交什么？',
    'returns.new.kind.return': '退货',
    'returns.new.kind.complaint': '投诉',
    'returns.new.col.include': '包含',
    'returns.new.col.product': '商品',
    'returns.new.col.qty': '数量',
    'returns.new.col.reason': '原因',
    'returns.new.selectReason': '请选择…',
    'returns.new.comment': '补充说明（可选）',
    'returns.new.submit.return': '提交退货申请',
    'returns.new.submit.complaint': '提交投诉',
    'returns.new.none.notCompleting': '此订单尚不符合退货或投诉条件。',
    'returns.new.none.fullyReturned': '此订单的全部商品均已退货。',
    'returns.new.none.windowPassed': '此订单已无法退货——退货期限已过。',
    'returns.new.none.generic': '此订单不符合退货条件。',
    'returns.new.complaintOnly': '此订单中没有可退货商品。您仍可就其提交投诉。',
    'returns.line.notReturnable': '此商品不可退货；仍可投诉。',
    'returns.line.remaining': '共 {count}',
    'orders.returnAction.return': '申请退货 / 投诉',
    'orders.returnAction.complaint': '提交投诉',
    'quoteRequests.validity.validUntil': '有效期至 ',
    'quoteRequests.validity.endedOn': '有效期已于 ',
    'quoteRequests.validity.acceptBlocked': '此报价的有效期已结束，这些价格无法再接受。请重新提交请求以获取当前报价。',
    'quoteRequests.validity.convertBlocked': '您已接受的报价已失效，无法再转为订单。报价获批后截止时间不可再改——请重新提交请求以获取当前报价。',
    'quoteRequests.resubmit': '重新提交',
    'serviceUnavailable.documentTitle': '服务不可用',
    'serviceUnavailable.status': '临时故障',
    'serviceUnavailable.heading': '商店暂时不可用。',
    'serviceUnavailable.body': '我们无法连接到构成本页所需的系统，因此暂时无法显示。这是我们这边的问题，不是您的问题，我们已在处理。',
    'serviceUnavailable.reassurance': '没有任何内容丢失。您的购物车、账户以及已提交的订单均未受影响。',
    'serviceUnavailable.retry': '重试',
    'serviceUnavailable.retryHint': '通常大约一分钟后再试即可。',
    'cms.carousel.label': '轮播',
    'cms.carousel.previous': '上一张',
    'cms.carousel.next': '下一张',
    'cms.carousel.slide': '{n} / {m}',
    'cms.carousel.goToSlide': '转到第 {n} 张',
    'cms.carousel.goToPage': '转到第 {n} 页',
    'cms.carousel.pause': '暂停自动播放',
    'cms.carousel.play': '开始自动播放',
    'cms.carousel.filter': '筛选',
    'cms.carousel.filterAll': '全部',
    'cms.carousel.filterCount': '显示 {n} / {m}',
      'chrome.language': '語言',
    'chrome.currency': '貨幣',
    'chrome.shippingCutoff': '今日 14:00 前下單可當日發貨',
    'chrome.vatInvoice': '增值稅發票',
    'chrome.b2bSupport': 'B2B 支援',
    'chrome.brandTagline': 'B2B · 工業元器件',
    'chrome.brandTaglineShort': 'B2B 元器件',
    'chrome.allCategories': '全部分類',
    'chrome.allCategoriesArrow': '全部分類 →',
    'chrome.allPrefix': '全部：{label}',
    'chrome.shoppingList': '採購清單',
    'chrome.rfq': '詢價',
    'chrome.rfqCount': '詢價 · {count} 項',
    'chrome.compare': '對比商品',
    'chrome.cart': '購物車',
    'chrome.cartCount': '購物車 · {count} 件',
    'account.nav.aria': '帳戶',
    'account.nav.profile': '個人資料',
    'account.nav.addresses': '我的地址',
    'account.nav.password': '修改密碼',
    'account.nav.orders': '訂單',
    'account.nav.returns': '退貨',
    'account.nav.quoteRequests': '詢價單',
    'account.nav.bidding': '競價',
    'account.nav.shoppingLists': '採購清單',
    'account.nav.quickOrder': '快速下單',
    'account.nav.organization': '組織',
    'account.nav.orgAddresses': '組織地址',
    'account.nav.members': '成員',
    'account.nav.signOut': '登出',
    'footer.blurb': '工業元器件 B2B 批發。軸承、傳動、自動化、電氣、氣動與工具。當日發貨、帳期發票與完整技術資料。',
    'footer.shop': '商店',
    'footer.catalog': '商品目錄',
    'footer.fasteners': '緊固件',
    'footer.tools': '工具',
    'footer.electronics': '電子',
    'footer.safety': '安全防護',
    'footer.account': 'B2B 帳戶',
    'footer.myAccount': '我的帳戶',
    'footer.orders': '訂單',
    'footer.invoices': '發票',
    'footer.rfq': 'RFQ — 詢價',
    'footer.shoppingLists': '採購清單',
    'footer.creditLimit': '信用額度',
    'footer.support': '支援',
    'footer.newsletter': '技術通訊',
    'footer.newsletterHint': '目錄新品、促銷與庫存報告。',
    'footer.newsletterPlaceholder': 'name@company.com',
    'footer.newsletterSubmit': '訂閱',
    'footer.terms': '條款',
    'footer.privacy': '隱私權政策',
    'footer.cookies': 'Cookies',
    'footer.contact': '聯絡我們',
    'footer.complaints': '投訴與退貨',
    'footer.delivery': '配送與付款',
    'footer.certificates': '認證與合規',
    'footer.helpCenter': '說明中心',
    'chrome.departments': '分類',
    'chrome.browseDepartment': '瀏覽 {label} →',
    'chrome.megaQuickOrderTitle': '快速下單 — 30 秒內 200+ 行',
    'chrome.megaQuickOrderBody': '從 ERP/CSV 貼上 SKU 與數量，一鍵建立訂單。',
    'chrome.megaQuickOrderCta': '開啟快速下單',
    'chrome.close': '關閉',
    'chrome.categories': '分類',
    'chrome.seeAll': '查看全部 →',
    'chrome.menu': '選單',
    'home.mobile.shipToday': '今日發貨',
    'home.mobile.creditLimit': '信用額度',
    'home.mobile.vatInvoice': '增值稅發票',
    'home.mobile.all': '全部',
    'home.hero.badge': '120,000+ SKU · 84 家廠商 · 今日發貨',
    'home.hero.titleLine1': '工業元器件',
    'home.hero.titleLine2Before': '',
    'home.hero.titleEm': '現貨供應',
    'home.hero.titleLine2After': '。',
    'home.hero.body': '面向維護、自動化整合商與生產部門的 B2B 批發。淨價、信用額度、產品目錄與 3.1 證書——一站齊全。',
    'home.hero.browseCatalog': '瀏覽目錄',
    'home.hero.quickOrderCsv': 'CSV 快速下單',
    'home.stat.stock': '庫存品項',
    'home.stat.makers': '廠商',
    'home.stat.cutoff': '發貨截止',
    'home.stat.availability': '現貨可用率',
    'home.demo.dynamicLoad': '動載荷',
    'home.demo.datasheet': '產品目錄',
    'home.demo.certificate': '3.1 證書',
    'home.demo.model3d': '3D STEP 模型',
    'home.assortment.eyebrow': '01 / 品類',
    'home.assortment.title': '六大核心品類',
    'home.assortment.body': '分類樹對齊廠商目錄——快速找到所需貨品。',
    'home.assortment.seeAll': '查看全部',
    'home.assortment.products': '{count} 件商品',
    'home.benefit.shipTitle': '當日發貨',
    'home.benefit.shipBody': '截止 14:00。中央倉現貨占比 98.4%。',
    'home.benefit.creditTitle': '信用額度',
    'home.benefit.creditBody': '額度 5,000–500,000。帳期發票 14/30/60 天。',
    'home.benefit.docsTitle': '目錄卡與 CAD',
    'home.benefit.docsBody': '每件商品含 PDF 目錄、3D STEP/DXF 與 RoHS 聲明。',
    'home.benefit.erpTitle': 'ERP 對接',
    'home.benefit.erpBody': 'REST API、Webhook、CSV/EDI 匯出。支援 200+ 行快速下單。',
    'home.bestsellers.eyebrow': '02 / 暢銷',
    'home.bestsellers.title': '本週最常下單',
    'home.bestsellers.body': '現貨可發，維護常用。',
    'home.bestsellers.seeAll': '全部暢銷',
    'home.fallback.fasteners': '緊固件',
    'home.fallback.tools': '工具',
    'home.fallback.electronics': '電子',
    'home.fallback.safety': '安全防護',
    'home.fallback.screws': '螺釘',
    'home.fallback.bolts': '螺栓',
},

  'pl-PL': {
    'a11y.skipToContent': 'Przejdz do tresci',
    'a11y.navigating': 'Wczytywanie następnej strony.',
    'a11y.navigatingSlow': 'Nadal wczytujemy. Następna strona ładuje się dłużej niż zwykle.',
    'nav.home': 'Strona glowna',
    'nav.catalog': 'Katalog',
    'nav.search': 'Wyszukiwanie',
    'nav.account': 'Konto',
    'nav.login': 'Zaloguj się',
    'nav.quickOrder': 'Quick Order',
    'nav.cart': 'Koszyk',
    'nav.quoteRequest': 'Zapytanie',
    'catalog.heading': 'Katalog',
    'catalog.filters': 'Filtry',
    'catalog.empty': 'Zaden produkt nie pasuje do filtrow.',
    'catalog.emptyPageMore': 'Na tej stronie nie ma produktów. Kolejne są na następnej stronie.',
    'catalog.loadMore': 'Pokaz wiecej',
    'catalog.sort.priceAsc': 'Cena: od najniższej',
    'catalog.sort.priceDesc': 'Cena: od najwyższej',
    'gallery.zoom': 'Powiększ',
    'compare.add': 'Dodaj do porównania',
    'compare.remove': 'Usuń z porównania',
    'card.list.addedTo': 'Dodano do „{name}”',
    'catalog.count': '{count} produktów',
    'catalog.showing': 'Pokazuję',
    'catalog.showing.results': 'wyników',
    'catalog.sort.aria': 'Sortuj',
    'catalog.sort.relevance': 'Sortuj: trafność',
    'catalog.sort.newest': 'Najnowsze',
    'catalog.sort.nameAsc': 'Nazwa A–Z',
    'catalog.sort.nameDesc': 'Nazwa Z–A',
    'catalog.perPage': '{n} / strona',
    'catalog.perPage.aria': 'Wyników na stronę',
    'catalog.viewMode.aria': 'Tryb widoku',
    'catalog.view.grid': 'Siatka',
    'catalog.view.list': 'Lista',
    'product.fromPerUnit': 'od / szt.',
    'product.gross': 'brutto {amount}',
    'catalog.price.heading': 'Cena',
    'catalog.price.min': 'Od',
    'catalog.price.max': 'Do',
    'catalog.price.apply': 'Zastosuj zakres cen',
    'catalog.price.clear': 'Wyczyść zakres cen',
    'catalog.price.unitNote':
      'Pokazane ceny to Twoje ceny jednostkowe. Rabaty ilościowe i promocje naliczamy w koszyku.',
    'product.outOfStock': 'Brak w magazynie',
    'product.requestQuote': 'Zapytaj o ofertę',
    'product.priceFromVariants': 'od, zależnie od wariantu',
    'product.compareAtLabel': 'Twoja cena',
    'product.listPrice': 'Cena katalogowa',
    'product.yourPrice': 'Twoja cena',
    'product.addToCart': 'Dodaj do koszyka',
    'product.addToCartFailed': 'Nie udało się dodać produktu do koszyka.',
    'product.oneClickFailed': 'Nie udało się złożyć zamówienia.',
    'product.details': 'Szczegóły',
    'product.tabs.description': 'Opis',
    'product.tabs.parameters': 'Parametry',
    'product.tabs.attachments': 'Załączniki',
    'product.packaging.singlePiece': 'Pojedyncza sztuka',
    'product.packaging.pieces': 'szt.',
    'product.minimum.pieces': 'Minimalne zamówienie: {count} szt.',
    'product.minimum.units': 'Minimalne zamówienie: {units} × {unit} = {count} szt.',
    'product.minimum.addToCart': 'Dodaj {count} szt. do koszyka',
    'common.quantity': 'Ilość',
    'product.buy.unit': 'Jednostka',
    'product.quote.add': 'Dodaj do zapytania',
    'product.quote.added': 'Dodano ✓',
    'product.cartPopup.added': 'Produkt został dodany do koszyka.',
    'product.cartPopup.goToCart': 'Przejdź do koszyka',
    'product.cartPopup.continue': 'Kontynuuj zakupy',
    'product.cartPopup.close': 'Zamknij',
    'card.list.add': 'Dodaj do listy zakupowej',
    'card.list.remove': 'Usuń z listy zakupowej',
    'card.list.failed': 'Nie udało się zmienić listy',
    'card.cart.added': 'Dodano do koszyka',
    'card.cart.failed': 'Nie udało się dodać',
    'card.quote.added': 'Dodano do zapytania',
    'compare.cart.adding': 'Dodawanie…',
    'compare.cart.added': '✓ Dodano',
    'quickOrder.page.heading': 'Szybkie zamówienie',
    'quickOrder.page.introPrefix': 'Wklej CSV z nagłówkami ',
    'quickOrder.page.introSuffix': ' (dodatkowe kolumny ustawiają atrybuty wariantu) albo przeciągnij plik CSV / Excel. Zanim cokolwiek dodamy, pokażemy, które wiersze odpowiadają istniejącym produktom.',
    'quickOrder.page.template': 'Pobierz szablon CSV',
    'quickOrder.page.dropzone': 'Przeciągnij tutaj plik CSV lub Excel albo kliknij, aby go wybrać',
    'quickOrder.page.pasteLabel': '…albo wklej CSV',
    'quickOrder.page.preview': 'Pokaż podgląd',
    'quickOrder.built.cart': 'Koszyk utworzony z importu.',
    'quickOrder.built.goToCheckout': 'Przejdź do kasy',
    'quickOrder.built.quote': 'Utworzono zapytanie ofertowe',
    'quickOrder.built.viewQuotes': 'Zobacz zapytania ofertowe',
    'quickOrder.search.heading': 'Znajdź produkty',
    'quickOrder.search.hint': 'Szukaj po SKU, nazwie lub atrybucie szybkiego wyszukiwania i dodawaj pozycje do zamówienia.',
    'quickOrder.search.placeholder': 'Szukaj produktów…',
    'quickOrder.search.none': 'Żaden produkt nie pasuje do „{query}”.',
    'quickOrder.search.add': 'Dodaj',
    'quickOrder.col.sku': 'SKU',
    'quickOrder.col.name': 'Nazwa',
    'quickOrder.col.qty': 'Ilość',
    'quickOrder.col.line': 'Wiersz',
    'quickOrder.col.variant': 'Wariant',
    'quickOrder.col.reason': 'Powód',
    'quickOrder.col.raw': 'Dane z pliku',
    'quickOrder.qtyFor': 'Ilość dla {sku}',
    'quickOrder.bar.recognised': 'Rozpoznane',
    'quickOrder.bar.addToCart': 'Dodaj do koszyka ({count})',
    'quickOrder.preview.heading': 'Podgląd',
    'quickOrder.preview.recognised': 'rozpoznane',
    'quickOrder.preview.invalid': 'błędne',
    'quickOrder.preview.units': 'szt.',
    'quickOrder.preview.truncated': 'Plik przekroczył limit wierszy importu — nadmiarowe wiersze odrzucono.',
    'quickOrder.preview.merged': 'Scalone powtórzone wiersze: {count} (ilości zsumowano).',
    'quickOrder.preview.recognisedRows': 'Rozpoznane wiersze: {count} — wybierz, co dalej.',
    'quickOrder.preview.update': 'Zmień',
    'quickOrder.preview.remove': 'Usuń',
    'quickOrder.preview.addAll': 'Dodaj wszystko do koszyka',
    'quickOrder.preview.sendAsQuote': 'Wyślij jako zapytanie ofertowe',
    'quickOrder.preview.noneMatched': 'Żaden wiersz nie pasuje do katalogu.',
    'quickOrder.preview.rejectedHeading': 'Odrzucone wiersze',
    'quickOrder.problem.no_input': 'Dodaj plik albo wklej CSV.',
    'quickOrder.problem.nothing_to_update': 'Nie ma czego zmienić.',
    'quickOrder.problem.nothing_to_remove': 'Nie ma czego usunąć.',
    'quickOrder.problem.nothing_to_build': 'Nie ma z czego utworzyć koszyka ani zapytania.',
    'quickOrder.problem.import_failed': 'Import nie powiódł się.',
    'quickOrder.problem.build_failed': 'Nie udało się utworzyć koszyka ani zapytania ofertowego.',
    'shoppingList.qty.invalid': 'Wpisz liczbę całkowitą od 1 do 9999.',
    'shoppingList.qty.save': 'Zapisz',
    'order.minimum.below.pieces': 'Poniżej minimum ({count} szt.)',
    'order.minimum.below.units': 'Poniżej minimum ({units} × {unit})',
    'order.minimum.below.unitsUnnamed': 'Poniżej minimum (jednostki opakowania: {units})',
    'order.minimum.below.bare': 'Poniżej minimalnej ilości zamówienia',
    'cart.line.noLongerAvailable': 'Produkt nie jest już dostępny',
    'cart.line.unknownProduct': 'Produkt usunięty z katalogu',
    'cart.line.setToMinimum': 'Ustaw {count} szt.',
    'cart.line.minimumHint': 'Minimum {count} szt.',
    'cart.line.quantityInvalid': 'Wpisz liczbę całkowitą. 0 usuwa pozycję.',
    'cart.line.updateFailed': 'Nie udało się zmienić ilości. Spróbuj ponownie.',
    'cart.line.removeFailed': 'Nie udało się usunąć pozycji. Spróbuj ponownie.',
    'cart.checkoutBlocked': 'Zmień lub usuń oznaczone pozycje, aby przejść do kasy.',
    'cart.approvalBlocked': 'Zmień lub usuń oznaczone pozycje, aby wysłać koszyk do akceptacji.',
    'batchReport.more': '+{count} więcej',
    'cart.submitForApprovalFailed': 'Nie udało się wysłać koszyka do akceptacji.',
    'cart.dropped.belowMinimum': 'poniżej minimalnej ilości zamówienia (minimum {minimum})',
    'cart.dropped.belowMinimumBare': 'poniżej minimalnej ilości zamówienia',
    'checkout.belowMinimum.heading': 'Tych pozycji nie można jeszcze zamówić',
    'checkout.belowMinimum.intro': 'Zmień ilość lub usuń pozycję w koszyku, a następnie wróć, aby złożyć zamówienie.',
    'checkout.belowMinimum.backToCart': 'Popraw w koszyku',
    'checkout.belowMinimum.blocked': 'Niektóre pozycje są poniżej minimalnej ilości zamówienia lub nie są już dostępne.',
    'quickOrder.reason.sku_missing': 'Brak SKU',
    'quickOrder.reason.quantity_invalid': 'Nieprawidłowa ilość',
    'quickOrder.reason.product_not_found': 'Nie znaleziono produktu',
    'quickOrder.reason.product_archived': 'Produkt zarchiwizowany',
    'quickOrder.reason.malformed_row': 'Nieprawidłowy wiersz',
    'quickOrder.reason.variant_not_resolved': 'Nie rozpoznano wariantu',
    'quickOrder.reason.variant_ambiguous': 'Wariant niejednoznaczny',
    'quickOrder.reason.row_limit_exceeded': 'Przekroczono limit wierszy',
    'quickOrder.reason.below_minimum': 'Poniżej minimalnej ilości zamówienia',
    'quickOrder.reason.below_minimumDetail': 'Łączna ilość produktu w tym pliku to {total}, minimum {count} szt.',
    'quickOrder.build.added': 'Koszyk utworzony z importu: dodano {added} z {total} pozycji.',
    'quickOrder.build.noneAdded': 'Do koszyka nie dodano żadnej pozycji.',
    'quickOrder.build.rejectedHeading': 'Nie dodano do koszyka',
    'quickOrder.build.rejectedLine': '{product} × {quantity} — {reason}',
    'quickOrder.build.openCart': 'Otwórz koszyk',
    'shoppingList.skip.heading': 'Nie dodano do koszyka',
    'shoppingList.skip.product_archived': 'Produkt zarchiwizowany',
    'shoppingList.skip.variant_unavailable': 'Wariant nie jest już dostępny',
    'shoppingList.skip.product_not_found': 'Produkt nie jest już dostępny',
    'product.inStock': 'Dostepny',
    'product.stockBand.high': 'Duzo w magazynie',
    'product.stockBand.medium': 'Sredni stan',
    'product.stockBand.low': 'Malo na stanie',
    'product.notify.cta': 'Powiadom o dostepnosci',
    'product.notify.dialogTitle': 'Powiadomimy Cie, gdy produkt znow bedzie dostepny',
    'product.notify.emailLabel': 'Adres e-mail',
    'product.notify.submit': 'Powiadom mnie',
    'product.notify.submitting': 'Zapisywanie…',
    'product.notify.success': 'Wyslemy e-mail gdy produkt bedzie ponownie dostepny.',
    'product.notify.errorGeneric': 'Nie udalo sie zapisac — sprobuj ponownie.',
    'product.notify.cancel': 'Anuluj',
    'product.backorder.hint': 'Aktualnie brak na stanie — produkt mozna zamowic, wysylka po dotarciu kolejnej dostawy.',
    'product.variants.heading': 'Warianty',
    'product.variants.sku': 'Kod',
    'product.variants.stockLevel': 'Dostepne',
    'product.variants.outOfStock': 'Niedostepny',
    'product.variants.selectThisVariant': 'Wybrany',
    'product.links.related': 'Powiazane produkty',
    'product.links.upSell': 'Moze Cie zainteresowac',
    'product.links.crossSell': 'Dokup takze',
    'product.links.seeAll': 'Zobacz wszystkie',
    'product.bundle.addToCart': 'Dodaj zestaw do koszyka',
    'product.bundle.requiredSlot': 'wymagane',
    'product.grouped.addBundleToCart': 'Dodaj zestaw do koszyka',
    'product.virtual.buyAndDownload': 'Kup i pobierz',
    'product.virtual.digitalDelivery': 'Dostawa cyfrowa — dostep natychmiast po zakupie',
    'search.placeholder': 'Szukaj produktow...',
    'search.unavailable': 'Wyszukiwarka chwilowo niedostepna.',
    'search.seeAllResults': 'Pokaz wszystkie wyniki',
    'common.searchAction': 'Szukaj',
    'pagination.next': 'Nastepna strona',
    'product.attributes.tabTitle': 'Parametry produktu',
    'product.attributes.boolean.yes': 'Tak',
    'product.attributes.boolean.no': 'Nie',
    // Feature 036 — Kasa.
    'checkout.success.title': 'Dziekujemy — Twoje zamowienie zostalo zlozone',
    'checkout.success.orderNumberPrefix': 'Numer Twojego zamowienia: ',
    'checkout.success.confirmationSent': 'Otrzymalismy je i wyslalismy e-mail z potwierdzeniem.',
    'checkout.success.bankTransferHint':
      'Prosimy o przelew z uzyciem numeru referencyjnego z faktury proforma, ktora wyslalismy e-mailem. Zaktualizujemy zamowienie po zaksiegowaniu wplaty.',
    'checkout.success.pickupHint':
      'Platnosc przy odbiorze. Zadne dalsze czynnosci nie sa obecnie wymagane.',
    'checkout.success.creditLimitHint':
      'Zamowienie zostalo rozliczone z limitu kredytowego Organizacji i jest obecnie przetwarzane.',
    'checkout.success.viewOrder': 'Szczegoly zamowienia',
    'checkout.success.allOrders': 'Wszystkie zamowienia',
    'checkout.success.continueShopping': 'Kontynuuj zakupy',
    'checkout.failure.title': 'Nie udalo sie zlozyc zamowienia',
    'checkout.failure.generic':
      'Cos poszlo nie tak przy skladaniu zamowienia. Twoj koszyk zostal zachowany, mozesz sprobowac ponownie.',
    'checkout.failure.cartKept':
      'Twoj koszyk pozostal bez zmian — nic nie zostalo obciazone, zamowienie nie zostalo utworzone.',
    'checkout.failure.tryAgain': 'Sprobuj ponownie',
    'checkout.failure.backToCart': 'Wroc do koszyka',
    // Issue #287 — the buyer whose order exists.
    'checkout.paymentFailure.title.failed': 'Płatność nie doszła do skutku',
    'checkout.paymentFailure.title.cancelled': 'Płatność nie została dokończona',
    'checkout.paymentFailure.orderPlacedPrefix': 'Twoje zamówienie ',
    'checkout.paymentFailure.orderPlacedSuffix':
      ' zostało złożone i czeka na opłacenie. Nic nie zostało obciążone.',
    'checkout.paymentFailure.failedBody': 'Operator płatności nie przyjął tej płatności.',
    'checkout.paymentFailure.cancelledBody':
      'Płatność została przerwana przed jej dokończeniem, więc nic nie zostało obciążone.',
    'checkout.paymentFailure.payAgain': 'Zapłać ponownie za to zamówienie',
    'checkout.paymentFailure.retryHint':
      'Możesz ponownie rozpocząć płatność za to samo zamówienie.',
    'checkout.paymentFailure.noRetryHint':
      'Tego zamówienia nie można teraz opłacić online. Otwórz je, aby zobaczyć, co dalej.',
    'checkout.paymentFailure.viewOrder': 'Zobacz szczegóły zamówienia',
    'checkout.paymentFailure.allOrders': 'Wszystkie zamówienia',
    'checkout.paymentPending.title': 'Potwierdzamy Twoją płatność',
    'checkout.paymentPending.orderNumberPrefix': 'Numer Twojego zamówienia to ',
    'checkout.paymentPending.placed':
      'Twoje zamówienie zostało złożone. Nie musisz nic więcej robić — czekamy na potwierdzenie płatności od operatora, co zwykle trwa kilka sekund.',
    'checkout.paymentPending.stillWaiting':
      'Trwa to dłużej niż zwykle. Wyślemy e-mail, gdy tylko płatność zostanie potwierdzona; aktualny stan zawsze widać na stronie zamówienia.',
    'checkout.paymentPending.checkAgain': 'Sprawdź ponownie',
    'checkout.paymentPending.viewOrder': 'Zobacz szczegóły zamówienia',
    'order.payment.retry.cta': 'Zaplac ponownie',
    'order.payment.retry.hint':
      'Platnosc nie doszla do skutku. Nic nie zostalo obciazone — mozesz oplacic to zamowienie ponownie.',
    'order.payment.retry.inProgress':
      'Dla tego zamowienia trwa juz platnosc. Dokoncz ja na stronie platnosci albo poczekaj, az wygasnie, zanim rozpoczniesz nowa.',
    'order.payment.retry.failed': 'Nie udalo sie rozpoczac platnosci. Sprobuj ponownie za chwile.',
    'order.cancel.cta': 'Anuluj zamowienie',
    'order.cancel.hint':
      'To zamowienie nie zostalo jeszcze oplacone i nie zaczelismy go realizowac, wiec mozesz je anulowac. Zarezerwowany towar wroci od razu na stan.',
    'order.cancel.failed': 'Nie udalo sie anulowac tego zamowienia. Skontaktuj sie z nami, pomozemy.',
    'checkout.delivery.none':
      'Brak dostępnych metod dostawy dla Twojego konta w tym kanale sprzedaży.',
    'checkout.payment.none':
      'Brak dostępnych metod płatności dla Twojego konta w tym kanale sprzedaży.',
    'checkout.error.title': 'Nie udało się wczytać kasy',
    'checkout.error.body':
      'Coś poszło nie tak po naszej stronie. Twój koszyk pozostaje nienaruszony, nic nie zostało zamówione ani obciążone — spróbuj ponownie za chwilę.',
    'checkout.error.retry': 'Spróbuj ponownie',
    'checkout.error.backToCart': 'Wróć do koszyka',
    'checkout.error.referencePrefix': 'Numer referencyjny: ',
    'checkout.coupon.label': 'Kod kuponu (opcjonalnie)',
    'checkout.coupon.apply': 'Zastosuj',
    'checkout.coupon.appliedPrefix': 'Kupon ',
    'checkout.coupon.appliedSuffix': 'zastosowany — ',
    'checkout.coupon.remove': 'Usun',
    'checkout.address.shippingTitle': 'Adres dostawy',
    'checkout.address.billingTitle': 'Adres rozliczeniowy',
    'checkout.address.useSaved': 'Uzyj zapisanego adresu',
    'checkout.address.enterNew': 'Wpisz nowy adres',
    'checkout.address.sameAsShipping': 'Adres rozliczeniowy taki sam jak dostawy',
    'checkout.address.recipientName': 'Imie i nazwisko odbiorcy',
    'checkout.address.street': 'Ulica i numer',
    'checkout.address.postalCode': 'Kod pocztowy',
    'checkout.address.city': 'Miasto',
    'checkout.address.country': 'Kraj (np. PL)',
    'checkout.address.phone': 'Telefon (opcjonalnie)',
    'checkout.address.billingCompanyTitle': 'Dane firmy do rozliczenia',
    'checkout.address.billingCompanyHint':
      'Domyslnie dane Twojej organizacji. Mozesz je nadpisac dla tego zamowienia.',
    'checkout.address.companyName': 'Nazwa firmy',
    'checkout.address.taxId': 'NIP',
    'checkout.shipping.title': 'Metoda dostawy',
    'checkout.shipping.empty':
      'Brak metody dostawy dostępnej dla Twojego konta w tym kanale sprzedaży.',
    'checkout.shipping.free': 'bezpłatnie',
    // Feature 008 — Quote Request success page.
    'quoteRequest.success.title': 'Dziekujemy — Twoje zapytanie ofertowe zostalo zlozone',
    'quoteRequest.success.numberPrefix': 'Numer Twojego zapytania ofertowego: ',
    'quoteRequest.success.confirmationSent':
      'Otrzymalismy je i wyslalismy e-mail z potwierdzeniem.',
    'quoteRequest.success.nextStepsHint':
      'Dzial sprzedazy przeanalizuje zapytanie i przygotuje oferte z cenami oraz warunkami. Powiadomimy Cie, gdy oferta bedzie gotowa.',
    'quoteRequest.success.viewRequest': 'Zobacz zapytanie ofertowe',
    'quoteRequest.success.allRequests': 'Wszystkie zapytania ofertowe',
    'quoteRequest.success.continueShopping': 'Kontynuuj zakupy',
    'quoteRequest.diff.grouping': 'Zmieniono układ pozycji.',
    'lineGroups.otherItems': 'Pozostałe pozycje',
    'lineGroups.summary.items.one': '{count} pozycja',
    'lineGroups.summary.items.few': '{count} pozycje',
    'lineGroups.summary.items.many': '{count} pozycji',
    'lineGroups.summary.items.other': '{count} pozycji',
    'lineGroups.summary.net': 'netto {amount}',
    'lineGroups.summary.vat': 'VAT {amount}',
    'lineGroups.summary.gross': 'brutto {amount}',
    // Issue #193 — federated sign-in.
    'auth.federated.groupLabel': 'Inne sposoby logowania',
    'auth.federated.divider': 'lub',
    'auth.federated.google': 'Kontynuuj przez Google',
    'auth.federated.microsoft': 'Kontynuuj przez Microsoft',
    'auth.login.signInRequired':
      'Ten sklep jest dostępny dla zalogowanych klientów biznesowych. Zaloguj się lub złóż wniosek o konto firmowe.',
    'auth.login.channelNotPermitted': 'To konto nie ma dostępu do tego sklepu.',
    'access.signInRequired': 'Ten sklep jest dostępny tylko dla zalogowanych klientów. Zaloguj się.',
    'access.denied.title': 'Brak dostępu do tego sklepu',
    'access.denied.body': 'Twoje konto nie ma uprawnień do zakupów w tym sklepie.',
    'access.denied.otherStores': 'Sklepy, z których możesz korzystać:',
    'access.denied.signOut': 'Wyloguj się',
    'access.denied.contact':
      'Jeśli chcesz kupować tutaj, skontaktuj się z administratorem swojej organizacji lub z naszym działem sprzedaży.',
    // Issue #194 — linked identities.
    'account.socialLinks.heading': 'Powiązane konta',
    'account.socialLinks.intro':
      'Za pomocą tych zewnętrznych kont możesz się logować. Usunięcie powiązania nie usuwa Twojego konta.',
    'account.socialLinks.linkedOn': 'Powiązano',
    'account.socialLinks.remove': 'Usuń',
    'account.socialLinks.lastCredential':
      'To ostatnia tożsamość logowania powiązana z Twoim kontem, a konto nie ma zapisanego hasła — usunięcie jej teraz mogłoby trwale odciąć Ci dostęp. Najpierw ustaw hasło, a potem będziesz móc usunąć to powiązanie.',
    'account.socialLinks.setPassword': 'Ustaw hasło',
    'account.push.heading': 'Powiadomienia push',
    'account.push.device.heading': 'Powiadomienia na tym urządzeniu',
    'account.push.device.on':
      'Powiadomienia o Twoich zamówieniach i zapytaniach ofertowych są włączone w tej przeglądarce.',
    'account.push.device.off': 'Powiadomienia są wyłączone w tej przeglądarce.',
    'account.push.device.blocked': 'Powiadomienia są zablokowane w ustawieniach witryny tej przeglądarki.',
    'account.push.device.turnOn': 'Włącz powiadomienia',
    'account.push.device.turnOff': 'Wyłącz powiadomienia',
    'account.push.preferences.heading': 'O czym mamy Cię powiadamiać',
    'account.push.preferences.hint':
      'Te ustawienia dotyczą wszystkich urządzeń, na których włączono powiadomienia.',
    'account.push.preferences.orderStatus': 'Zmiany statusu zamówień',
    'account.push.preferences.quoteStatus': 'Aktualizacje zapytań ofertowych',
    'account.push.preferences.save': 'Zapisz ustawienia',
    'account.push.preferences.saved': 'Twoje ustawienia zostały zapisane.',
    'account.push.preferences.error': 'Nie udało się zapisać ustawień. Spróbuj ponownie.',
    'compare.pdf.busy': 'Generowanie…',
    'compare.pdf.failed': 'Nie udało się wygenerować PDF.',
    'compare.shared.pricesYours': 'Pokazane ceny dotyczą Twojej organizacji.',
    'compare.shared.pricesChannel':
      'Pokazane ceny to ceny standardowe tego sklepu. Zaloguj się, aby zobaczyć ceny uzgodnione dla Twojej organizacji.',
    'compare.shared.hiddenProducts':
      'Część produktów z tego zestawienia nie jest dostępna dla Twojego konta i nie jest tutaj pokazana.',
    'orders.paymentReturn.returned':
      'Wracasz od operatora płatności. Twoje zamówienie zostało złożone; czekamy jeszcze na potwierdzenie płatności — wynik pojawi się na tej stronie, gdy tylko dotrze.',
    'orders.paymentReturn.cancelled':
      'Płatność nie została jeszcze wykonana. Twoje zamówienie zostało złożone i czeka na opłacenie — nic nie zostało obciążone.',
    'orders.paymentReturn.failed':
      'Płatność nie doszła do skutku. Twoje zamówienie zostało złożone i nadal czeka na opłacenie, więc możesz spróbować ponownie.',
    'orders.actionFailed': 'Nie udało się wykonać tej operacji.',
    'returns.new.heading': 'Zwrot lub reklamacja',
    'returns.new.chooseOrder': 'Wybierz zamówienie, którego dotyczy zwrot lub reklamacja:',
    'returns.new.noOrders': 'Nie masz jeszcze żadnych zamówień.',
    'returns.new.backToReturns': '← Wróć do zwrotów',
    'returns.new.chooseAnotherOrder': '← Wybierz inne zamówienie',
    'returns.new.freeReturnWindow': 'To zamówienie mieści się w okresie bezpłatnego zwrotu.',
    'returns.new.kind.legend': 'Co chcesz zgłosić?',
    'returns.new.kind.return': 'Zwrot',
    'returns.new.kind.complaint': 'Reklamacja',
    'returns.new.col.include': 'Uwzględnij',
    'returns.new.col.product': 'Produkt',
    'returns.new.col.qty': 'Ilość',
    'returns.new.col.reason': 'Powód',
    'returns.new.selectReason': 'Wybierz…',
    'returns.new.comment': 'Dodatkowe informacje (opcjonalnie)',
    'returns.new.submit.return': 'Wyślij zgłoszenie zwrotu',
    'returns.new.submit.complaint': 'Wyślij reklamację',
    'returns.new.none.notCompleting': 'To zamówienie nie może jeszcze zostać zwrócone ani zareklamowane.',
    'returns.new.none.fullyReturned': 'Wszystkie produkty z tego zamówienia zostały już zwrócone.',
    'returns.new.none.windowPassed': 'Tego zamówienia nie można już zwrócić — minął termin zwrotu.',
    'returns.new.none.generic': 'To zamówienie nie kwalifikuje się do zwrotu.',
    'returns.new.complaintOnly': 'Żaden produkt z tego zamówienia nie podlega zwrotowi. Nadal możesz złożyć reklamację.',
    'returns.line.notReturnable': 'Ten produkt nie podlega zwrotowi; reklamacja jest nadal możliwa.',
    'returns.line.remaining': 'z {count}',
    'orders.returnAction.return': 'Zgłoś zwrot / reklamację',
    'orders.returnAction.complaint': 'Złóż reklamację',
    'quoteRequests.validity.validUntil': 'Ważne do ',
    'quoteRequests.validity.endedOn': 'Ważność zakończona ',
    'quoteRequests.validity.acceptBlocked':
      'Okres ważności tej oferty minął, więc nie można już zaakceptować tych cen. Złóż zapytanie ponownie, aby otrzymać aktualną ofertę.',
    'quoteRequests.validity.convertBlocked':
      'Zaakceptowana oferta straciła ważność, więc nie można już złożyć z niej zamówienia. Terminu zatwierdzonej oferty nie da się już przesunąć — złóż zapytanie ponownie, aby otrzymać aktualną ofertę.',
    'quoteRequests.resubmit': 'Złóż ponownie',
    'serviceUnavailable.documentTitle': 'Serwis niedostępny',
    'serviceUnavailable.status': 'Chwilowa przerwa',
    'serviceUnavailable.heading': 'Serwis jest chwilowo niedostępny.',
    'serviceUnavailable.body':
      'Nie możemy połączyć się z systemami, z których powstaje ta strona, więc nie da się jej teraz wyświetlić. To problem po naszej stronie, nie po Twojej — już się nim zajmujemy.',
    'serviceUnavailable.reassurance':
      'Nic nie zginęło. Twój koszyk, konto i wszystkie złożone wcześniej zamówienia są nienaruszone.',
    'serviceUnavailable.retry': 'Spróbuj ponownie',
    'serviceUnavailable.retryHint': 'Zwykle warto spróbować ponownie za około minutę.',
    'cms.carousel.label': 'Karuzela',
    'cms.carousel.previous': 'Poprzedni slajd',
    'cms.carousel.next': 'Następny slajd',
    'cms.carousel.slide': '{n} z {m}',
    'cms.carousel.goToSlide': 'Przejdź do slajdu {n}',
    'cms.carousel.goToPage': 'Przejdź do strony {n}',
    'cms.carousel.pause': 'Wstrzymaj automatyczne przewijanie',
    'cms.carousel.play': 'Włącz automatyczne przewijanie',
    'cms.carousel.filter': 'Filtruj',
    'cms.carousel.filterAll': 'Wszystkie',
    'cms.carousel.filterCount': 'Pokazano {n} z {m}',
      'chrome.language': 'Język',
    'chrome.currency': 'Waluta',
    'chrome.shippingCutoff': 'Wysyłka dziś, jeśli zamówisz do 14:00',
    'chrome.vatInvoice': 'Faktura VAT',
    'chrome.b2bSupport': 'Wsparcie B2B',
    'chrome.brandTagline': 'B2B · Komponenty przemysłowe',
    'chrome.brandTaglineShort': 'Komponenty B2B',
    'chrome.allCategories': 'Wszystkie kategorie',
    'chrome.allCategoriesArrow': 'Wszystkie kategorie →',
    'chrome.allPrefix': 'Wszystkie: {label}',
    'chrome.shoppingList': 'Lista zakupowa',
    'chrome.rfq': 'Zapytanie ofertowe',
    'chrome.rfqCount': 'Zapytanie ofertowe · {count} pozycji',
    'chrome.compare': 'Porównaj produkty',
    'chrome.cart': 'Koszyk',
    'chrome.cartCount': 'Koszyk · {count} pozycji',
    'account.nav.aria': 'Konto',
    'account.nav.profile': 'Profil',
    'account.nav.addresses': 'Moje adresy',
    'account.nav.password': 'Zmień hasło',
    'account.nav.orders': 'Zamówienia',
    'account.nav.returns': 'Zwroty',
    'account.nav.quoteRequests': 'Zapytania ofertowe',
    'account.nav.bidding': 'Licytacje',
    'account.nav.shoppingLists': 'Listy zakupowe',
    'account.nav.quickOrder': 'Szybkie zamówienie',
    'account.nav.organization': 'Organizacja',
    'account.nav.orgAddresses': 'Adresy organizacji',
    'account.nav.members': 'Członkowie',
    'account.nav.signOut': 'Wyloguj',
    'footer.blurb': 'Hurtownia B2B komponentów przemysłowych. Łożyska, napędy, automatyka, elektryka, pneumatyka i narzędzia. Wysyłka tego samego dnia, faktura z odroczonym terminem płatności i pełna dokumentacja techniczna.',
    'footer.shop': 'Sklep',
    'footer.catalog': 'Katalog',
    'footer.fasteners': 'Łączniki',
    'footer.tools': 'Narzędzia',
    'footer.electronics': 'Elektronika',
    'footer.safety': 'BHP',
    'footer.account': 'Konto B2B',
    'footer.myAccount': 'Moje konto',
    'footer.orders': 'Zamówienia',
    'footer.invoices': 'Faktury',
    'footer.rfq': 'RFQ — zapytania ofertowe',
    'footer.shoppingLists': 'Listy zakupowe',
    'footer.creditLimit': 'Limit kredytowy',
    'footer.support': 'Wsparcie',
    'footer.newsletter': 'Newsletter techniczny',
    'footer.newsletterHint': 'Nowości katalogowe, promocje cenowe i raporty dostępności.',
    'footer.newsletterPlaceholder': 'adres@firma.pl',
    'footer.newsletterSubmit': 'Zapisz się',
    'footer.terms': 'Regulamin',
    'footer.privacy': 'Polityka prywatności',
    'footer.cookies': 'Cookies',
    'footer.contact': 'Kontakt',
    'footer.complaints': 'Reklamacje i zwroty',
    'footer.delivery': 'Dostawa i płatności',
    'footer.certificates': 'Certyfikaty i zgodność',
    'footer.helpCenter': 'Centrum pomocy',
    'chrome.departments': 'Działy',
    'chrome.browseDepartment': 'Przeglądaj {label} →',
    'chrome.megaQuickOrderTitle': 'Quick Order — 200+ pozycji w 30 s',
    'chrome.megaQuickOrderBody': 'Wklej listę SKU + ilości z ERP/CSV i utwórz zamówienie jednym kliknięciem.',
    'chrome.megaQuickOrderCta': 'Otwórz Quick Order',
    'chrome.close': 'Zamknij',
    'chrome.categories': 'Kategorie',
    'chrome.seeAll': 'Zobacz wszystko →',
    'chrome.menu': 'Menu',
    'home.mobile.shipToday': 'Wysyłka dziś',
    'home.mobile.creditLimit': 'Limit kredytowy',
    'home.mobile.vatInvoice': 'Faktura VAT',
    'home.mobile.all': 'Wszystko',
    'home.hero.badge': '120 000+ SKU · 84 producentów · wysyłka dziś',
    'home.hero.titleLine1': 'Komponenty przemysłowe',
    'home.hero.titleLine2Before': 'dostępne ',
    'home.hero.titleEm': 'od ręki',
    'home.hero.titleLine2After': '.',
    'home.hero.body': 'Hurtownia B2B dla utrzymania ruchu, integratorów automatyki i działów produkcji. Ceny netto, limit kredytowy, karty katalogowe, certyfikaty 3.1 — wszystko w jednym miejscu.',
    'home.hero.browseCatalog': 'Przeglądaj katalog',
    'home.hero.quickOrderCsv': 'Quick Order z CSV',
    'home.stat.stock': 'Pozycji w magazynie',
    'home.stat.makers': 'Producentów',
    'home.stat.cutoff': 'Cut-off wysyłki',
    'home.stat.availability': 'Dostępność on-stock',
    'home.demo.dynamicLoad': 'NOŚNOŚĆ DYNAMICZNA',
    'home.demo.datasheet': 'Karta katalogowa',
    'home.demo.certificate': 'Certyfikat 3.1',
    'home.demo.model3d': 'Model 3D STEP',
    'home.assortment.eyebrow': '01 / Asortyment',
    'home.assortment.title': 'Sześć kluczowych działów',
    'home.assortment.body': 'Drzewo kategorii odzwierciedla katalogi producentów — łatwo trafisz do tego, czego szukasz.',
    'home.assortment.seeAll': 'Zobacz wszystkie',
    'home.assortment.products': '{count} produktów',
    'home.benefit.shipTitle': 'Wysyłka tego samego dnia',
    'home.benefit.shipBody': 'Cut-off 14:00. 98,4% pozycji on-stock w magazynie centralnym Warszawa-Okęcie.',
    'home.benefit.creditTitle': 'Limit kredytowy',
    'home.benefit.creditBody': 'Od 5 000 do 500 000 PLN. Faktura z odroczonym terminem 14/30/60 dni.',
    'home.benefit.docsTitle': 'Karty katalogowe i CAD',
    'home.benefit.docsBody': 'Każdy produkt ma kartę PDF, model 3D STEP/DXF, deklarację RoHS.',
    'home.benefit.erpTitle': 'Integracja z ERP',
    'home.benefit.erpBody': 'API REST, webhooki, eksport CSV/EDI. Quick Order dla 200+ pozycji.',
    'home.bestsellers.eyebrow': '02 / Bestsellery',
    'home.bestsellers.title': 'Najczęściej zamawiane w tym tygodniu',
    'home.bestsellers.body': 'Gotowe do wysyłki, sprawdzone w utrzymaniu ruchu.',
    'home.bestsellers.seeAll': 'Cały bestseller',
    'home.fallback.fasteners': 'Łączniki',
    'home.fallback.tools': 'Narzędzia',
    'home.fallback.electronics': 'Elektronika',
    'home.fallback.safety': 'BHP',
    'home.fallback.screws': 'Wkręty',
    'home.fallback.bolts': 'Śruby',
},
};

/**
 * The locales this catalogue carries.
 *
 * Derived from the catalogue rather than written beside it, so a third language
 * is reachable by the outage notice the moment its block exists and there is no
 * second list to keep in step.
 */
export const CATALOGUE_LOCALES: readonly string[] = Object.keys(MESSAGES);

export function tForLocale(locale: string): (key: MessageKey) => string {
  // Prefer the requested catalogue; missing keys fall back to en-US (content
  // language alignment still uses the request locale via Accept-Language).
  const dictionary = MESSAGES[locale] ?? MESSAGES['zh-CN'] ?? MESSAGES['en-US']!;
  return (key) => dictionary[key] ?? MESSAGES['zh-CN']?.[key] ?? MESSAGES['en-US']![key] ?? key;
}
