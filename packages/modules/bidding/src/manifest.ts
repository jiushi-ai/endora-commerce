import {
  BIDDING_ERROR_CODES,
  defineModuleManifest,
  defineModuleSettingsManifest,
} from '@endora-commerce/contracts';

/**
 * Bidding module — feature 165 (Mobii).
 *
 * Batch D owns campaigns, sealed receipts, dual review, allocate, and thin
 * convert. Batch C role seeds remain. Fulfilment gates deepen in Batch E.
 */
export const BIDDING_SETTING_CODES = {
  ACTIVATION: 'bidding.activation',
} as const;

const settings = defineModuleSettingsManifest({
  moduleCode: 'bidding',
  groups: [{ code: 'bidding', name: 'Bidding' }],
  settings: [
    {
      code: BIDDING_SETTING_CODES.ACTIVATION,
      name: 'Bidding enabled',
      description:
        'Switches scarce-stock bidding on or off for this instance: role seeds at boot, campaign and receipt surfaces. Off is non-destructive — seeded roles stay in the database.',
      groupCode: 'bidding',
      valueType: 'boolean',
      defaultValue: true,
    },
  ],
});

export const manifest = defineModuleManifest({
  id: 'bidding',
  name: 'Bidding',
  description:
    'Scarce-stock bidding campaigns and sealed bid receipts for Mobii-style allocation.',
  version: '0.2.0',
  dependencies: ['admin_roles', 'settings', 'auth'],
  settings,
  activation: { settingCode: BIDDING_SETTING_CODES.ACTIVATION, default: true },
  permissions: [
    {
      code: 'bidding:campaigns:read',
      label: 'View bidding campaigns',
      module: 'bidding',
    },
    {
      code: 'bidding:campaigns:write',
      label: 'Create and run bidding campaigns',
      module: 'bidding',
      requires: ['bidding:campaigns:read'],
    },
    {
      code: 'bidding:receipts:review',
      label: 'Review bid receipts',
      module: 'bidding',
      requires: ['bidding:campaigns:read'],
    },
    {
      code: 'bidding:deposit:confirm',
      label: 'Confirm bidding deposits',
      module: 'bidding',
      requires: ['bidding:receipts:review'],
    },
    {
      code: 'bidding:allocate',
      label: 'Allocate bidding winners and losers',
      module: 'bidding',
      requires: ['bidding:campaigns:write'],
    },
  ],
  errorCodes: BIDDING_ERROR_CODES.map((code) => ({ code })),
  i18n: { bundlesDir: 'i18n' },
  docs: { dir: 'docs' },
  actions: [
    {
      id: 'open-bidding-campaigns',
      labelKey: 'actions.openCampaigns.label',
      descriptionKey: 'actions.openCampaigns.description',
      icon: 'Layers',
      targetRoute: '/bidding/campaigns',
      requiredPermission: 'bidding:campaigns:read',
      keywords: ['bidding', 'campaign', 'auction', '竞价', '活动'],
      weight: 220,
    },
    {
      id: 'open-bidding-receipts',
      labelKey: 'actions.openReceipts.label',
      descriptionKey: 'actions.openReceipts.description',
      icon: 'ClipboardList',
      targetRoute: '/bidding/receipts',
      requiredPermission: 'bidding:receipts:review',
      keywords: ['bidding', 'receipt', 'intent', '回执', '意向'],
      weight: 230,
    },
  ],
});
