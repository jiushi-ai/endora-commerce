import type { CustomerAccountPreferencePort, CustomerAccountRecord } from '@endora-commerce/contracts';
import type { CommandBus } from '@endora-commerce/platform/commands';
import { withSystemScope } from '@endora-commerce/platform/tenancy';
import { makeSetCustomerAccountPreferredLanguageCommand } from '../commands/customer-account-set-preferred-language.command.js';
import { toOneCustomerAccountRecord } from './customer-account-ports.js';
import type { TwoFactorEnrolmentReader } from './two-factor-enrolments.js';

/**
 * `customerAccountPreferencePort` (issue #652, D-292) — preferred language
 * writes through `customer_account.set_preferred_language`.
 */
export class CustomerAccountPreferenceService implements CustomerAccountPreferencePort {
  constructor(
    private readonly twoFactorEnrolments: TwoFactorEnrolmentReader,
    private readonly commandBus: CommandBus,
  ) {}

  async setPreferredLanguage(
    customerAccountId: string,
    preferredLanguage: string,
  ): Promise<CustomerAccountRecord> {
    const account = await this.commandBus.run(
      makeSetCustomerAccountPreferredLanguageCommand({
        customerAccountId,
        preferredLanguage,
        source: 'self_service',
      }),
    );
    return toOneCustomerAccountRecord(this.twoFactorEnrolments, account!);
  }

  async captureIfUnset(customerAccountId: string, preferredLanguage: string): Promise<void> {
    await withSystemScope('customer_accounts: capture the preferred language at sign-in', () =>
      this.commandBus.run(
        makeSetCustomerAccountPreferredLanguageCommand({
          customerAccountId,
          preferredLanguage,
          source: 'sign_in',
        }),
      ),
    );
  }
}
