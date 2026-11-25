import type {
  AutomationStatus,
  AutomationTriggerType,
  CampaignStatus,
  CampaignTargetType,
  CustomFieldType,
  SubscriberStatus,
} from '@endora-commerce/contracts';

/** What a cell shows when there is nothing to show. */
export const EMPTY_CELL = '—';

type Translator = (key: string, params?: Record<string, string | number>) => string;

const SUBSCRIBER_SOURCES = ['api', 'storefront', 'account', 'cms-block', 'footer'] as const;

/** Subscriber lifecycle status label. */
export function subscriberStatusLabel(t: Translator, status: SubscriberStatus): string {
  return t(`enum.subscriberStatus.${status}`);
}

/** How the subscriber was acquired — known `source` codes map to i18n; others pass through. */
export function subscriberSourceLabel(t: Translator, source: string | null | undefined): string {
  if (!source) return EMPTY_CELL;
  const known = SUBSCRIBER_SOURCES.find((s) => s === source);
  return known ? t(`enum.subscriberSource.${known}`) : source;
}

export function campaignStatusLabel(t: Translator, status: CampaignStatus): string {
  return t(`enum.campaignStatus.${status}`);
}

export function campaignTargetLabel(t: Translator, target: CampaignTargetType): string {
  return t(`enum.campaignTarget.${target}`);
}

export function automationStatusLabel(t: Translator, status: AutomationStatus): string {
  return t(`enum.automationStatus.${status}`);
}

export function automationTriggerLabel(t: Translator, trigger: AutomationTriggerType): string {
  return t(`enum.automationTrigger.${trigger}`);
}

export function customFieldTypeLabel(t: Translator, type: CustomFieldType): string {
  return t(`enum.customFieldType.${type}`);
}