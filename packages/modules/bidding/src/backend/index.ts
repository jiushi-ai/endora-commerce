import type { AdminRolePort, SystemRoleCodePort } from '@endora-commerce/contracts';
import type { ModuleContext } from '@endora-commerce/platform/kernel';
import { effectiveState, lazyPort } from '@endora-commerce/platform/kernel';

import { seedBiddingRoles } from './services/seed-roles.js';

/**
 * `bidding` — feature 165 (Mobii). Batch C wires the role seeder only;
 * campaign / receipt composition arrives in Batch D.
 */
export function registerModule(ctx: ModuleContext): void {
  ctx.onBoot(async () => {
    // Presence first — a switched-off module must not seed roles at every boot
    // (Constitution XVII; same probe shape as `blog`).
    if (!effectiveState.isPresent('bidding')) return;
    await seedBiddingRoles(
      lazyPort<AdminRolePort>(ctx, 'adminRolePort'),
      lazyPort<SystemRoleCodePort>(ctx, 'systemRoleCodePort'),
    );
  });
}

/**
 * No persisted entities in Batch C — campaign / receipt tables land in Batch D.
 */
export const entities: readonly never[] = [];
