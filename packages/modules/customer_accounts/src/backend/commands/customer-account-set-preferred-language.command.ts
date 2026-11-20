import {
  ERROR_CODES,
  uuidSchema,
  type CustomerPreferredLanguageSource,
} from '@endora-commerce/contracts';
import type { Command } from '@endora-commerce/platform/commands';
import { HttpError } from '@endora-commerce/platform/http';
import { CustomerAccount } from '../entities/customer-account.entity.js';

export interface SetCustomerAccountPreferredLanguageInput {
  readonly customerAccountId: string;
  /** A tag in the capturing channel's spelling; the caller resolved it. */
  readonly preferredLanguage: string;
  readonly source: CustomerPreferredLanguageSource;
}

/**
 * `customer_account.set_preferred_language` (issue #652, D-292).
 *
 * - `self_service` — the owner's explicit choice; overwrites. Missing id → 404.
 * - `sign_in` — fills only while unknown; no-op otherwise.
 *
 * Audit names the field and the source, never the language tag.
 */
export function makeSetCustomerAccountPreferredLanguageCommand(
  input: SetCustomerAccountPreferredLanguageInput,
): Command<CustomerAccount | null> {
  return {
    action: 'customer_account.set_preferred_language',
    objectType: 'customer_account',
    objectId: input.customerAccountId,
    run: async ({ em }) => {
      const account = uuidSchema.safeParse(input.customerAccountId).success
        ? await em.findOne(CustomerAccount, { id: input.customerAccountId, deletedAt: null })
        : null;
      if (account === null) {
        if (input.source === 'sign_in') return { result: null, skipAudit: true };
        throw new HttpError(404, ERROR_CODES.NOT_FOUND, 'Customer account not found.');
      }
      const current = account.preferredLanguage ?? null;
      const unchanged =
        input.source === 'sign_in' ? current !== null : current === input.preferredLanguage;
      if (unchanged) return { result: account, skipAudit: true };
      account.preferredLanguage = input.preferredLanguage;
      await em.flush();
      return {
        result: account,
        before: null,
        after: { changedFields: ['preferredLanguage'], source: input.source },
      };
    },
  };
}
