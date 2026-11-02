import { defineModuleManifest, defineModuleSettingsManifest } from '@endora-commerce/contracts';

/**
 * Bidding module — feature 165 (Mobii).
 *
 * Batch C seeds the three Mobii admin roles (`ops` / `sales` / `after_sales`).
 * Campaign / receipt entities and routes land in Batch D; until then this
 * package owns no `bidding:*` permission codes (permission-inventory refuses
 * codes with no gate).
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
        'Switches scarce-stock bidding on or off for this instance: role seeds at boot, and (once shipped) campaign and receipt surfaces. Off is non-destructive — seeded roles stay in the database.',
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
    'Scarce-stock bidding campaigns and sealed bid receipts for Mobii-style allocation; seeds ops / sales / after-sales admin roles.',
  version: '0.1.0',
  // `adminRolePort` + `systemRoleCodePort` (boot seeder) — same seams as `blog`.
  // `settings` owns the activation control this module declares.
  dependencies: ['admin_roles', 'settings'],
  settings,
  activation: { settingCode: BIDDING_SETTING_CODES.ACTIVATION, default: true },
  i18n: { bundlesDir: 'i18n' },
  docs: { dir: 'docs' },
});
