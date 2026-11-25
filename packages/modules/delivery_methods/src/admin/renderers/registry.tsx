import { useContext, type ReactNode } from 'react';
import {
  adminLanguageToLocale,
  pickCategoryDisplayName,
} from '@endora-commerce/admin-kit/components';
import { AppLanguageContext } from '@endora-commerce/admin-kit/i18n';
import type { AdminDeliveryMethod } from '../api/delivery-methods-client.js';

/**
 * Admin shipping-method renderer registry (feature 035, FR-016/FR-017).
 *
 * An adapter may register a custom renderer for how its method appears in the
 * admin list (keyed by the adapter's `renderers.admin`). When none is
 * registered, the platform default renderer is used — so every method always
 * renders in the admin surface.
 */
export type AdminDeliveryMethodRenderer = (method: AdminDeliveryMethod) => ReactNode;

function pickMethodDisplayNameWithoutAdminLanguage(
  name: Record<string, string>,
  code: string,
): string {
  const en = name['en-US']?.trim();
  if (en) return en;
  const zh = name['zh-CN']?.trim();
  if (zh) return zh;
  const first = Object.values(name).find((v) => v?.trim());
  if (first?.trim()) return first.trim();
  return code;
}

function DefaultAdminDeliveryMethodRendererInner({
  method,
}: {
  method: AdminDeliveryMethod;
}): ReactNode {
  const appLanguage = useContext(AppLanguageContext);
  const displayName = appLanguage
    ? pickCategoryDisplayName(
        method.name,
        method.code,
        adminLanguageToLocale(appLanguage.language),
      )
    : pickMethodDisplayNameWithoutAdminLanguage(method.name, method.code);

  return (
    <span>
      {displayName} <code className="font-mono text-xs">({method.adapter})</code>
    </span>
  );
}

export const DefaultAdminDeliveryMethodRenderer: AdminDeliveryMethodRenderer = (method) => (
  <DefaultAdminDeliveryMethodRendererInner method={method} />
);

const registry = new Map<string, AdminDeliveryMethodRenderer>();

export function registerAdminDeliveryMethodRenderer(
  key: string,
  renderer: AdminDeliveryMethodRenderer,
): void {
  registry.set(key, renderer);
}

export function resolveAdminDeliveryMethodRenderer(
  rendererKey: string | null,
): AdminDeliveryMethodRenderer {
  if (rendererKey) {
    const found = registry.get(rendererKey);
    if (found) return found;
  }
  return DefaultAdminDeliveryMethodRenderer;
}