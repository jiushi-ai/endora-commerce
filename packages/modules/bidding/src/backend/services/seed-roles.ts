import type { AdminRolePort, SystemRoleCodePort } from '@endora-commerce/contracts';

/**
 * SeedBiddingRoles — feature 165 / Batch C / T1.
 *
 * Idempotent boot reconciler. Upserts three protected Mobii admin roles:
 *
 *   ops          Operations — customers + catalog + orders read
 *   sales        Sales — aligned with demo `SALES_REPRESENTATIVE_PERMISSIONS`
 *                plus `customers:read`
 *   after_sales  After-sales — order read/write (shipment admin routes share
 *                those codes; there is no `shipments:*` catalogue entry)
 *
 * Permission codes are looked up from existing manifests / the core
 * `PERMISSION_CATALOGUE` and module-owned catalogues. **No `bidding:*` codes
 * yet** — those wait until Batch D routes exist (permission-inventory).
 *
 * On rerun, keeps an admin-edited `name` and only refreshes drifted
 * permission arrays (same pattern as `blog`'s `seedBlogRoles`).
 */

export const BIDDING_ROLE_CODES = {
  OPS: 'ops',
  SALES: 'sales',
  AFTER_SALES: 'after_sales',
} as const;

/**
 * Mirror of `admin_roles` demo `SALES_REPRESENTATIVE_PERMISSIONS` (not imported:
 * cross-module internals are forbidden). Plus `customers:read` for Mobii org
 * desk access.
 */
export const BIDDING_SALES_PERMISSIONS: readonly string[] = [
  'rfqs:handle',
  'catalog:read',
  'price_lists:read',
  'crm:read',
  'crm:write',
  'customers:read',
];

const SEED_DEFINITIONS: Array<{
  code: string;
  defaultName: string;
  permissions: string[];
}> = [
  {
    code: BIDDING_ROLE_CODES.OPS,
    defaultName: 'Operations',
    permissions: [
      'customers:read',
      'customers:manage',
      'catalog:read',
      'catalog:write',
      'orders:read',
    ],
  },
  {
    code: BIDDING_ROLE_CODES.SALES,
    defaultName: 'Sales',
    permissions: [...BIDDING_SALES_PERMISSIONS],
  },
  {
    code: BIDDING_ROLE_CODES.AFTER_SALES,
    defaultName: 'After-sales',
    // Shipments admin routes are gated by `orders:read` / `orders:write`.
    permissions: ['orders:read', 'orders:write'],
  },
];

export interface BiddingRoleSeedResult {
  code: string;
  id: string;
  created: boolean;
  permissionsRefreshed: boolean;
}

function hasDrifted(want: readonly string[], have: readonly string[]): boolean {
  const wanted = [...want].sort();
  const held = [...have].sort();
  return wanted.length !== held.length || wanted.some((code, i) => code !== held[i]);
}

export async function seedBiddingRoles(
  adminRoles: AdminRolePort,
  systemRoleCodes: SystemRoleCodePort,
): Promise<BiddingRoleSeedResult[]> {
  for (const def of SEED_DEFINITIONS) {
    systemRoleCodes.register(def.code);
  }

  const results: BiddingRoleSeedResult[] = [];

  for (const def of SEED_DEFINITIONS) {
    const existing = await adminRoles.findByCode(def.code);

    if (existing === null) {
      const created = await adminRoles.upsertByCode({
        code: def.code,
        name: def.defaultName,
        permissions: def.permissions,
        requiresTwoFactor: false,
      });
      results.push({ code: def.code, id: created.id, created: true, permissionsRefreshed: false });
      continue;
    }

    const drifted = hasDrifted(def.permissions, existing.permissions);
    if (drifted) {
      await adminRoles.upsertByCode({
        code: def.code,
        name: existing.name,
        permissions: def.permissions,
        requiresTwoFactor: existing.requiresTwoFactor,
      });
    }
    results.push({
      code: def.code,
      id: existing.id,
      created: false,
      permissionsRefreshed: drifted,
    });
  }

  return results;
}
