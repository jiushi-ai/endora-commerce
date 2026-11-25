import type { TransactionalEmailSender } from '@endora-commerce/contracts';
import type { OrgTemplateEmail } from './org-template-email.js';

/**
 * Template send path for new-organization mail — uses
 * `_i18n.admin.notification_email_language` instead of the sales channel
 * default wired into the global `templateEmailPort`.
 */
export function makeOrgRegistrationTemplateEmail(deps: {
  getSender: () => TransactionalEmailSender | undefined;
  resolveSalesChannelId: () => Promise<string | null>;
  resolveLanguage: () => Promise<string>;
}): OrgTemplateEmail {
  return {
    async trySend(input): Promise<boolean> {
      const sender = deps.getSender();
      if (!sender) return false;
      const salesChannelId = await deps.resolveSalesChannelId();
      if (!salesChannelId) return false;
      const language = await deps.resolveLanguage();
      const outcome = await sender.send({
        code: input.code,
        salesChannelId,
        language,
        to: input.to,
        messageId: input.messageId,
        variables: input.variables,
        ...(input.meta ? { meta: input.meta } : {}),
      });
      return outcome.status !== 'no_definition';
    },
  };
}