import { describe, expect, it } from 'vitest';
import type {
  AdminRolePort,
  AdminRoleRecord,
  SystemRoleCodePort,
  UpsertAdminRoleInput,
} from '@endora-commerce/contracts';
import {
  BIDDING_AFTER_SALES_PERMISSIONS,
  BIDDING_OPS_PERMISSIONS,
  BIDDING_ROLE_CODES,
  BIDDING_SALES_PERMISSIONS,
  seedBiddingRoles,
} from './seed-roles.js';

interface RecordingAdminRolePort extends AdminRolePort {
  readonly upserts: UpsertAdminRoleInput[];
}

function fakeAdminRolePort(seed: readonly AdminRoleRecord[] = []): RecordingAdminRolePort {
  const rows = new Map<string, AdminRoleRecord>(seed.map((role) => [role.code, role]));
  const upserts: UpsertAdminRoleInput[] = [];
  const notNeeded = (method: string) => (): never => {
    throw new Error(`the seeder must not call ${method}`);
  };
  return {
    upserts,
    findByCode: async (code) => rows.get(code) ?? null,
    upsertByCode: async (input) => {
      upserts.push(input);
      const existing = rows.get(input.code);
      const row: AdminRoleRecord = {
        id: existing?.id ?? `id-${input.code}`,
        code: input.code,
        name: input.name,
        permissions: input.permissions,
        requiresTwoFactor: input.requiresTwoFactor ?? existing?.requiresTwoFactor ?? false,
        createdAt: existing?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };
      rows.set(input.code, row);
      return row;
    },
    list: notNeeded('list'),
    getById: notNeeded('getById'),
    remove: notNeeded('remove'),
  };
}

function recordingSystemRoleCodes(): SystemRoleCodePort & { readonly registered: string[] } {
  const registered: string[] = [];
  return {
    registered,
    register: (code) => {
      registered.push(code);
    },
    list: () => [...registered],
  };
}

function roleRecord(overrides: Partial<AdminRoleRecord> & { code: string }): AdminRoleRecord {
  return {
    id: `id-${overrides.code}`,
    name: 'Seeded',
    permissions: [],
    requiresTwoFactor: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('seedBiddingRoles over adminRolePort', () => {
  it('creates the three Mobii roles with canonical names and permission sets', async () => {
    const roles = fakeAdminRolePort();
    const codes = recordingSystemRoleCodes();

    const results = await seedBiddingRoles(roles, codes);

    expect(results.map((r) => r.code).sort()).toEqual(
      [
        BIDDING_ROLE_CODES.AFTER_SALES,
        BIDDING_ROLE_CODES.OPS,
        BIDDING_ROLE_CODES.SALES,
      ].sort(),
    );
    expect(results.every((r) => r.created)).toBe(true);
    expect(roles.upserts).toEqual([
      {
        code: BIDDING_ROLE_CODES.OPS,
        name: 'Operations',
        permissions: [...BIDDING_OPS_PERMISSIONS],
        requiresTwoFactor: false,
      },
      {
        code: BIDDING_ROLE_CODES.SALES,
        name: 'Sales',
        permissions: [...BIDDING_SALES_PERMISSIONS],
        requiresTwoFactor: false,
      },
      {
        code: BIDDING_ROLE_CODES.AFTER_SALES,
        name: 'After-sales',
        permissions: [...BIDDING_AFTER_SALES_PERMISSIONS],
        requiresTwoFactor: false,
      },
    ]);
  });

  it('registers all three codes as deletion-protected even when rows exist', async () => {
    const codes = recordingSystemRoleCodes();
    await seedBiddingRoles(
      fakeAdminRolePort([
        roleRecord({
          code: BIDDING_ROLE_CODES.OPS,
          permissions: [...BIDDING_OPS_PERMISSIONS],
        }),
        roleRecord({
          code: BIDDING_ROLE_CODES.SALES,
          permissions: [...BIDDING_SALES_PERMISSIONS],
        }),
        roleRecord({
          code: BIDDING_ROLE_CODES.AFTER_SALES,
          permissions: [...BIDDING_AFTER_SALES_PERMISSIONS],
        }),
      ]),
      codes,
    );
    expect([...codes.registered].sort()).toEqual(
      [
        BIDDING_ROLE_CODES.AFTER_SALES,
        BIDDING_ROLE_CODES.OPS,
        BIDDING_ROLE_CODES.SALES,
      ].sort(),
    );
  });

  it('writes nothing on a rerun where nothing drifted', async () => {
    const roles = fakeAdminRolePort([
      roleRecord({
        code: BIDDING_ROLE_CODES.OPS,
        name: 'Ops desk',
        permissions: [...BIDDING_OPS_PERMISSIONS].reverse(),
      }),
      roleRecord({
        code: BIDDING_ROLE_CODES.SALES,
        permissions: [...BIDDING_SALES_PERMISSIONS].reverse(),
      }),
      roleRecord({
        code: BIDDING_ROLE_CODES.AFTER_SALES,
        permissions: [...BIDDING_AFTER_SALES_PERMISSIONS].reverse(),
      }),
    ]);

    const results = await seedBiddingRoles(roles, recordingSystemRoleCodes());

    expect(roles.upserts).toEqual([]);
    expect(results.every((r) => !r.created && !r.permissionsRefreshed)).toBe(true);
  });

  it('hands the admin-edited name back when refreshing drifted permissions', async () => {
    const roles = fakeAdminRolePort([
      roleRecord({
        code: BIDDING_ROLE_CODES.OPS,
        name: '运营',
        permissions: ['customers:read'],
        requiresTwoFactor: true,
      }),
      roleRecord({
        code: BIDDING_ROLE_CODES.SALES,
        permissions: [...BIDDING_SALES_PERMISSIONS],
      }),
      roleRecord({
        code: BIDDING_ROLE_CODES.AFTER_SALES,
        permissions: [...BIDDING_AFTER_SALES_PERMISSIONS],
      }),
    ]);

    const results = await seedBiddingRoles(roles, recordingSystemRoleCodes());

    expect(roles.upserts).toEqual([
      {
        code: BIDDING_ROLE_CODES.OPS,
        name: '运营',
        permissions: [...BIDDING_OPS_PERMISSIONS],
        requiresTwoFactor: true,
      },
    ]);
    const ops = results.find((r) => r.code === BIDDING_ROLE_CODES.OPS)!;
    expect(ops.created).toBe(false);
    expect(ops.permissionsRefreshed).toBe(true);
  });
});
