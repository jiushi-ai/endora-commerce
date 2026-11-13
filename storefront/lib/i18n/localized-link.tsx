'use client';

import Link from 'next/link';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';

/**
 * Compatibility shims for Feature 168 NavigationBar imports.
 *
 * Upstream Feature 167 prefixes storefront paths with the URL language. This
 * Mobii fork has not wired `locale-path` / `LocalePathProvider` yet, so these
 * helpers pass `href` / `action` through unchanged — same as upstream's
 * "no provider → path as written" behaviour. Replace with the real 167 module
 * when locale-in-path lands.
 */

type LinkProps = ComponentProps<typeof Link>;

/** `next/link` passthrough (locale prefix deferred until Feature 167). */
export const LocalizedLink = forwardRef<HTMLAnchorElement, LinkProps>(function LocalizedLink(props, ref) {
  return <Link ref={ref} {...props} />;
});

/** Plain `<a>` passthrough (locale prefix deferred until Feature 167). */
export const LocalizedAnchor = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>(function LocalizedAnchor(
  props,
  ref,
) {
  return <a ref={ref} {...props} />;
});

/** `<form>` passthrough (locale prefix deferred until Feature 167). */
export const LocalizedForm = forwardRef<HTMLFormElement, ComponentProps<'form'>>(function LocalizedForm(
  props,
  ref,
) {
  return <form ref={ref} {...props} />;
});

/** No-op stand-in so callers that expect a provider still typecheck. */
export function LocalePathProvider({ children }: { value?: unknown; children: ReactNode }) {
  return children;
}

/** Empty URL-language state until Feature 167 is wired. */
export function useUrlLanguageState(): { languages: string[]; aliases: string[]; current: string } {
  return { languages: [], aliases: [], current: '' };
}

/** Identity path helper until Feature 167 is wired. */
export function useLocalizedPath(): (path: string, languageCode?: string) => string {
  return (path: string) => path;
}
