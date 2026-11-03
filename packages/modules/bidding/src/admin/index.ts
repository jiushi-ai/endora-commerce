/**
 * Bidding admin surface — campaign desk + receipt review (feature 165 / Batch D).
 */
import type { AdminContributions } from '@endora-commerce/admin-kit/contributions';

export const contributions: AdminContributions = {
  routes: [
    {
      path: '/bidding/campaigns',
      component: () => import('./pages/CampaignsPage.js'),
      requiredPermission: 'bidding:campaigns:read',
      index: true,
    },
    {
      path: '/bidding/campaigns/new',
      component: () => import('./pages/CampaignCreatePage.js'),
      requiredPermission: 'bidding:campaigns:write',
    },
    {
      path: '/bidding/receipts',
      component: () => import('./pages/ReceiptsPage.js'),
      requiredPermission: 'bidding:receipts:review',
    },
  ],
  nav: [
    {
      to: '/bidding/campaigns',
      labelKey: 'nav.campaigns.label',
      icon: 'Layers',
      section: 'sales',
      weight: 350,
      requiredPermission: 'bidding:campaigns:read',
    },
    {
      to: '/bidding/receipts',
      labelKey: 'nav.receipts.label',
      icon: 'ClipboardList',
      section: 'sales',
      weight: 360,
      requiredPermission: 'bidding:receipts:review',
    },
  ],
};
