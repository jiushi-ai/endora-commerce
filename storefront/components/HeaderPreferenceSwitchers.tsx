'use client';

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { CurrencyPicker } from '../lib/dictionary/pickers/CurrencyPicker';
import { storefrontLanguageOption } from '../lib/i18n/language-labels';
import { tForLocale } from '../lib/i18n/messages';

/**
 * Header language + currency switchers.
 *
 * Persist the choice in a site-wide cookie and refresh the server tree, so
 * `getServerContext` picks the preference up on the next render.
 *
 * Language UI matches Admin: flag + code (EN / ZH-CN / ZH-TW) + Chinese name.
 */

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function setPreferenceCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function LocaleSwitcher({
  locale,
  languageCodes,
}: {
  locale: string;
  /** Active codes from `/api/v1/i18n/config` (channel-aligned). */
  languageCodes: readonly string[];
}): ReactNode {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const t = tForLocale(locale);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const current = storefrontLanguageOption(locale);
  const options = languageCodes.map((code) => storefrontLanguageOption(code));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent): void => {
      const node = wrapRef.current;
      if (node && !node.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return (): void => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (code: string): void => {
    setOpen(false);
    if (code === locale) return;
    setPreferenceCookie('lang', code);
    startTransition(() => router.refresh());
  };

  return (
    <div className="industria-topbar__switcher" ref={wrapRef} style={{ position: 'relative' }}>
      <span className="sr-only" id="b2b-locale-label">
        {t('chrome.language')}
      </span>
      <button
        type="button"
        id="b2b-locale"
        aria-labelledby="b2b-locale-label"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(): void => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded border border-transparent bg-transparent px-2 py-1 text-[11px] font-semibold tracking-wide text-inherit hover:bg-white/10"
      >
        <span aria-hidden="true" className="text-[14px] leading-none">
          {current.flag}
        </span>
        <span>{current.displayCode}</span>
        <span aria-hidden="true" className="opacity-70">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t('chrome.language')}
          className="absolute right-0 top-[calc(100%+4px)] z-[60] min-w-[200px] overflow-hidden rounded-md border border-line bg-white p-1 shadow-lg"
        >
          {options.map((opt) => {
            const active = opt.code === locale || opt.displayCode === current.displayCode;
            return (
              <button
                key={opt.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={(): void => pick(opt.code)}
                className={
                  'flex w-full items-center justify-between gap-2 rounded border-0 px-2.5 py-1.5 text-left text-[13px] text-fg shadow-none outline-none ' +
                  (active ? 'bg-[#f4f4f5]' : 'bg-transparent hover:bg-[#f4f4f5]')
                }
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="text-[16px] leading-none">
                    {opt.flag}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide">{opt.displayCode}</span>
                  <span>{opt.label}</span>
                </span>
                {active ? (
                  <span aria-hidden="true" className="text-[12px]">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function CurrencySwitcher({
  currency,
  locale,
}: {
  currency?: string | undefined;
  locale: string;
}): ReactNode {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const t = tForLocale(locale);
  const onChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setPreferenceCookie('currency', event.target.value);
    startTransition(() => router.refresh());
  };
  return (
    <div className="industria-topbar__switcher">
      <label htmlFor="b2b-currency">{t('chrome.currency')}:</label>
      {currency ? (
        <CurrencyPicker id="b2b-currency" name="currency" value={currency} onChange={onChange} />
      ) : (
        <CurrencyPicker id="b2b-currency" name="currency" onChange={onChange} />
      )}
    </div>
  );
}
