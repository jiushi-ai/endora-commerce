'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ResolvedMegamenu, ResolvedMenuItem } from '@endora-commerce/contracts';
import { tForLocale } from '../../lib/i18n/messages';

interface CategoriesMegaProps {
  megamenu: ResolvedMegamenu | null;
  locale: string;
}

/**
 * "All categories" trigger + full-width dropdown panel, matching the
 * Industria storefront-ui design (`specs/b2b-platform-storefront-ui`).
 */
export function CategoriesMega({ megamenu, locale }: CategoriesMegaProps): ReactNode {
  const t = tForLocale(locale);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingSwitch = (): void => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
  };
  const scheduleActive = (i: number): void => {
    cancelPendingSwitch();
    if (i === active) return;
    switchTimer.current = setTimeout(() => setActive(i), 140);
  };
  const setActiveNow = (i: number): void => {
    cancelPendingSwitch();
    setActive(i);
  };
  useEffect(() => cancelPendingSwitch, []);

  const items = megamenu?.items ?? [];
  const allCategories = t('chrome.allCategories');

  if (items.length === 0) {
    return (
      <a href="/catalog" className="industria-nav__btn">
        <MenuIcon /> {allCategories} <ChevDownIcon />
      </a>
    );
  }

  const activeItem = items[Math.min(active, items.length - 1)] ?? items[0]!;
  const subItems = activeItem.children ?? [];
  const columns: ResolvedMenuItem[][] = [[], [], []];
  subItems.forEach((sub, i) => columns[i % 3]!.push(sub));

  return (
    <div
      className="industria-mega-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        cancelPendingSwitch();
      }}
    >
      <button
        type="button"
        className={'industria-nav__btn' + (open ? ' is-active' : '')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <MenuIcon /> {allCategories} <ChevDownIcon />
      </button>

      <div className={'industria-mega' + (open ? ' is-open' : '')}>
        <div className="mx-auto max-w-[1360px] px-[24px]">
          <div className="industria-mega__grid">
            <div className="industria-mega__col">
              <div className="industria-mega__heading">{t('chrome.departments')}</div>
              <ul className="industria-mega__list">
                {items.map((item, i) => (
                  <li key={item.id}>
                    <a
                      href={item.url ?? '/catalog'}
                      onMouseEnter={() => scheduleActive(i)}
                      onFocus={() => setActiveNow(i)}
                      aria-current={i === active ? 'true' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/catalog">
                    <span style={{ color: 'var(--brand-700)', fontFamily: 'var(--font-sans)' }}>
                      {t('chrome.allCategoriesArrow')}
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="industria-mega__col" onMouseEnter={cancelPendingSwitch}>
              <div className="industria-mega__heading">{activeItem.label}</div>
              {subItems.length > 0 ? (
                <div className="industria-mega__cols">
                  {columns.map((col, ci) => (
                    <ul className="industria-mega__list" key={ci}>
                      {col.map((sub) => (
                        <li key={sub.id}>
                          <a href={sub.url ?? '/catalog'}>{sub.label}</a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <ul className="industria-mega__list">
                  <li>
                    <a href={activeItem.url ?? '/catalog'}>
                      {t('chrome.browseDepartment').replace('{label}', activeItem.label)}
                    </a>
                  </li>
                </ul>
              )}
            </div>

            <div className="industria-mega__col" onMouseEnter={cancelPendingSwitch}>
              <div className="industria-mega__promo">
                <LightningIcon />
                <h4>{t('chrome.megaQuickOrderTitle')}</h4>
                <p>{t('chrome.megaQuickOrderBody')}</p>
                <a href="/quick-order" className="industria-mega__promo__cta">
                  {t('chrome.megaQuickOrderCta')} <ArrowRightIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function svg(children: ReactNode, size = 16): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}
function MenuIcon(): ReactNode {
  return svg(
    <>
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </>,
    15,
  );
}
function ChevDownIcon(): ReactNode {
  return svg(<polyline points="6 9 12 15 18 9" />, 14);
}
function LightningIcon(): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--brand-700)"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ArrowRightIcon(): ReactNode {
  return svg(
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>,
    13,
  );
}
