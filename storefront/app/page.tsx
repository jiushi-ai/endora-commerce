import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { listProducts, getCategoryTree } from '../lib/api/catalog';
import { getCmsPageBySlug } from '../lib/api/cms';
import { getHomepageConfig } from '../lib/api/homepage';
import {
  listBiddingCampaigns,
  type StorefrontBiddingCampaign,
} from '../lib/api/bidding';
import { getServerContext } from '../lib/server-context';
import { getSessionCookie } from '../lib/session';
import { ProductCard } from '../components/ProductCard';
import { CmsPageRenderer } from '../components/CmsPageRenderer';
import { HomeMobileStrip } from '../components/mobile/HomeMobileStrip';
import { Hook } from '../components/Hook';
import { OrganizationJsonLd } from '../components/seo/OrganizationJsonLd';
import { cmsSocialMetadata } from '../lib/seo/cms-share-metadata';
import { cmsRenderLocation, type PageSearchParams } from '../lib/page-builder/render-location';
import { tForLocale, type MessageKey } from '../lib/i18n/messages';
import { seo } from './seo';

/**
 * Indexable (`specs/098-storefront-ssr-seo-a11y-suite/`, FR-010/FR-012). The
 * canonical is the route pattern itself; `metadataBase` in the root layout
 * turns it into an absolute URL.
 *
 * Feature 163 (FR-033, FR-034): a CMS-backed home page carries the same title,
 * description and sharing card as that page has at its own route, at `/`. The
 * page read is the one the component below makes, deduplicated by Next's
 * fetch cache.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { ctx } = await getServerContext();
  const { cmsPageSlug } = await getHomepageConfig(ctx);
  const cmsPage = cmsPageSlug ? await getCmsPageBySlug(cmsPageSlug, ctx).catch(() => null) : null;
  if (!cmsPage) return { alternates: { canonical: seo.route } };
  const social = cmsSocialMetadata(cmsPage, seo.route);
  return {
    title: social.title,
    description: cmsPage.meta.description ?? undefined,
    keywords: cmsPage.meta.keywords ?? undefined,
    alternates: { canonical: seo.route },
    openGraph: social.openGraph,
    twitter: social.twitter,
  };
}

interface CatTile {
  href: string;
  name: string;
  count: number;
}

const BIDDING_DESK = '/account/bidding';
const BIDDING_LOGIN = `/login?next=${encodeURIComponent(BIDDING_DESK)}`;

/**
 * Storefront home page.
 *
 * When an operator has chosen a CMS page as the home page (Settings → General
 * → "Home page CMS page"), that page is rendered here. Otherwise we fall back
 * to the built-in Mobii dual-path landing (scarce-lot bidding primary, routine
 * procurement secondary).
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}): Promise<ReactNode> {
  const { ctx, locale, modules } = await getServerContext();

  // Operator-selected CMS home page takes precedence when it resolves to a
  // published page; any miss (unset, unpublished, deleted) falls through to
  // the built-in landing page so the home page always renders.
  const { cmsPageSlug } = await getHomepageConfig(ctx);
  if (cmsPageSlug) {
    const cmsPage = await getCmsPageBySlug(cmsPageSlug, ctx).catch(() => null);
    if (cmsPage) {
      // The `Organization` block rides on both render paths: a crawler that
      // fetched `/` while an operator had a CMS home page selected would
      // otherwise receive no structured data at all.
      return (
        <>
          <OrganizationJsonLd ctx={ctx} />
          <CmsPageRenderer
            page={cmsPage}
            ctx={ctx}
            modules={modules}
            location={cmsRenderLocation('/', (await searchParams) ?? {})}
          />
        </>
      );
    }
  }

  const session = await getSessionCookie();
  const biddingPresent = modules.isPresent('bidding');
  const biddingHref = session ? BIDDING_DESK : BIDDING_LOGIN;

  const [tree, products, campaigns] = await Promise.all([
    getCategoryTree(ctx).catch(() => [] as Awaited<ReturnType<typeof getCategoryTree>>),
    listProducts({ limit: 4 }, ctx).catch(() => ({
      data: [],
      pagination: { limit: 4, cursor: null, hasMore: false },
    })),
    biddingPresent && session
      ? listBiddingCampaigns(session).catch(() => [] as StorefrontBiddingCampaign[])
      : Promise.resolve([] as StorefrontBiddingCampaign[]),
  ]);

  const openCampaigns = campaigns
    .filter((c) => c.status === 'published')
    .slice(0, 4);

  const t = tForLocale(locale);
  const fallbackCategories = FALLBACK_CATEGORY_DEFS.map((c) => ({
    slug: c.slug,
    name: t(c.nameKey),
    count: c.count,
  }));

  const categoryTiles: CatTile[] = tree.length > 0
    ? tree.slice(0, 6).map((c) => ({
        href: `/c/${c.slug}`,
        name: c.name,
        count: c.productCount,
      }))
    : fallbackCategories.map((c) => ({
        href: `/c/${c.slug}`,
        name: c.name,
        count: c.count,
      }));

  const mobileChips = [
    { label: t('home.mobile.all'), href: '/catalog', active: true },
    ...(biddingPresent
      ? [{ label: t('home.mobile.shipToday'), href: biddingHref }]
      : []),
    ...categoryTiles.slice(0, 3).map((c) => ({ label: c.name, href: c.href })),
  ];

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      <OrganizationJsonLd ctx={ctx} />
      <Hook code="homepage.top" />
      <HomeMobileStrip
        benefits={[
          { icon: 'truck', label: t('home.mobile.shipToday') },
          { icon: 'wallet', label: t('home.mobile.creditLimit') },
          { icon: 'doc', label: t('home.mobile.vatInvoice') },
        ]}
        chips={mobileChips}
      />

      {/* Hero — bidding primary CTA, procurement secondary */}
      <section className="border-b border-line bg-surface bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.04),transparent_60%)] pt-[56px] pb-[72px] max-md:pt-[28px] max-md:pb-[40px]">
        <div className="mx-auto grid max-w-[1360px] grid-cols-[minmax(0,5fr)_minmax(0,4fr)] items-center gap-[56px] px-[24px] max-[920px]:grid-cols-1">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-alt px-[10px] py-[6px] font-mono text-[11px] tracking-[0.04em] text-muted">
              <span className="inline-block h-[6px] w-[6px] rounded-full bg-ok" />{' '}
              {t('home.hero.badge')}
            </span>
            <h1 className="text-[56px] leading-[1.04] tracking-[-0.03em] max-[720px]:text-[38px] [&_em]:not-italic [&_em]:text-accent">
              {t('home.hero.titleLine1')}
              <br />
              {t('home.hero.titleLine2Before')}
              <em>{t('home.hero.titleEm')}</em>
              {t('home.hero.titleLine2After')}
            </h1>
            <p className="mt-6 mb-8 max-w-[540px] text-[16px] leading-[1.6] text-muted">
              {t('home.hero.body')}
            </p>
            <div className="mb-10 flex flex-wrap gap-3">
              {biddingPresent ? (
                <Link href={biddingHref} className="btn btn--dark btn--lg">
                  {t('home.hero.ctaBidding')} <ArrowRightIcon />
                </Link>
              ) : null}
              <Link
                href="/catalog"
                className={
                  biddingPresent ? 'btn btn--outline btn--lg' : 'btn btn--dark btn--lg'
                }
              >
                {t('home.hero.ctaProcure')}
                {biddingPresent ? null : (
                  <>
                    {' '}
                    <ArrowRightIcon />
                  </>
                )}
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-[24px] max-[720px]:grid-cols-2">
              {[
                ['—', t('home.stat.stock')],
                ['—', t('home.stat.makers')],
                ['48h', t('home.stat.cutoff')],
                ['—', t('home.stat.availability')],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="font-mono text-[22px] font-semibold tracking-[-0.02em] text-fg">
                    {num}
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.06em] text-muted">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Illustrative scarce-lot card — chrome via messages; not live DB */}
          <div className="relative overflow-hidden rounded-xl bg-[var(--ink-900)] p-[24px] text-[#f4f4f5]">
            <div className="mb-[18px] flex items-baseline justify-between font-mono text-[12px] text-[#a1a1aa]">
              <span className="font-medium text-white">LOT-A100-200</span>
              <span>{t('home.demo.lotMeta')}</span>
            </div>
            <div className="mt-[12px] mb-[16px] font-mono text-[40px] font-semibold leading-none tracking-[-0.03em]">
              <small className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#a1a1aa]">
                {t('home.demo.dynamicLoad')}
              </small>
              {t('home.demo.refPrice')}
            </div>
            <div className="mb-[24px] flex flex-wrap gap-2">
              {[
                t('home.demo.tagGpu'),
                t('home.demo.tagQty'),
                t('home.demo.tagSealed'),
                t('home.demo.tagWindow'),
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/12 bg-white/8 px-[10px] py-[4px] font-mono text-[11px] text-[#e5e7eb]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                [<DocIcon key="d" />, t('home.demo.intent'), t('home.demo.datasheet')],
                [<ShieldIcon key="s" />, t('home.demo.verify'), t('home.demo.certificate')],
                [<LayersIcon key="l" />, t('home.demo.fulfill'), t('home.demo.model3d')],
              ].map(([icon, title, sub]) => (
                <div
                  key={title as string}
                  className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/6 p-[10px]"
                >
                  <div className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] bg-white/8">
                    {icon}
                  </div>
                  <div>
                    <strong className="block text-[11px] font-medium text-white">{title}</strong>
                    <span className="block font-mono text-[10px] text-[#a1a1aa]">{sub}</span>
                  </div>
                </div>
              ))}
            </div>
            {biddingPresent ? (
              <div className="mt-5">
                <Link href={biddingHref} className="btn btn--lg w-full justify-center bg-white text-[var(--ink-900)] hover:bg-white/90">
                  {t('home.hero.ctaBidding')} <ArrowRightIcon />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Dual paths */}
      <section className="mx-auto max-w-[1360px] px-[24px] section">
        <div className="section__head">
          <div>
            <span className="section__eyebrow">{t('home.path.eyebrow')}</span>
            <h2 className="sr-only">{t('home.path.eyebrow')}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[16px] max-[800px]:grid-cols-1">
          {biddingPresent ? (
            <div className="rounded-lg border border-[var(--ink-700)] bg-surface p-[28px]">
              <h3 className="m-0 mb-2 text-[20px] font-semibold tracking-[-0.02em] text-fg">
                {t('home.path.biddingTitle')}
              </h3>
              <p className="m-0 mb-5 max-w-[42ch] text-[14px] leading-[1.55] text-muted">
                {t('home.path.biddingBody')}
              </p>
              <ol className="m-0 mb-6 list-decimal space-y-2 pl-5 text-[13px] text-fg">
                <li>{t('home.path.biddingStep1')}</li>
                <li>{t('home.path.biddingStep2')}</li>
                <li>{t('home.path.biddingStep3')}</li>
              </ol>
              <Link href={biddingHref} className="btn btn--dark">
                {t('home.path.biddingCta')} <ArrowRightIcon />
              </Link>
            </div>
          ) : null}
          <div
            className={`rounded-lg border border-line bg-surface p-[28px] ${
              biddingPresent ? '' : 'col-span-full max-w-[640px]'
            }`}
          >
            <h3 className="m-0 mb-2 text-[20px] font-semibold tracking-[-0.02em] text-fg">
              {t('home.path.procureTitle')}
            </h3>
            <p className="m-0 mb-5 max-w-[42ch] text-[14px] leading-[1.55] text-muted">
              {t('home.path.procureBody')}
            </p>
            <ol className="m-0 mb-6 list-decimal space-y-2 pl-5 text-[13px] text-fg">
              <li>{t('home.path.procureStep1')}</li>
              <li>{t('home.path.procureStep2')}</li>
              <li>{t('home.path.procureStep3')}</li>
            </ol>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalog" className="btn btn--outline">
                {t('home.path.procureCta')}
              </Link>
              <Link href="/quick-order" className="btn btn--ghost">
                <LightningIcon /> {t('home.hero.quickOrderCsv')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Open campaigns — live titles/qty/dates from API; chrome from messages */}
      {biddingPresent ? (
        <section className="mx-auto max-w-[1360px] px-[24px] section pt-0">
          <div className="section__head">
            <div>
              <span className="section__eyebrow">{t('home.campaigns.eyebrow')}</span>
              <h2>{t('home.campaigns.title')}</h2>
              <p>{t('home.campaigns.body')}</p>
            </div>
            <Link href={biddingHref} className="btn btn--ghost">
              {t('home.campaigns.viewAll')} <ArrowRightIcon />
            </Link>
          </div>
          {!session ? (
            <div className="rounded-lg border border-dashed border-line bg-surface-alt px-6 py-10 text-center">
              <p className="m-0 mb-4 text-[14px] text-muted">{t('home.campaigns.signIn')}</p>
              <Link href={BIDDING_LOGIN} className="btn btn--dark">
                {t('home.hero.ctaBidding')} <ArrowRightIcon />
              </Link>
            </div>
          ) : openCampaigns.length === 0 ? (
            <p className="m-0 rounded-lg border border-line bg-surface-alt px-6 py-8 text-[14px] text-muted">
              {t('home.campaigns.empty')}
            </p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-[16px] p-0 max-[800px]:grid-cols-1">
              {openCampaigns.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/account/bidding/${encodeURIComponent(c.id)}`}
                    className="block rounded-lg border border-line bg-surface p-[22px] transition hover:-translate-y-[2px] hover:border-[var(--ink-700)]"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
                      {c.code}
                    </span>
                    <h3 className="m-0 mt-1 mb-3 text-[16px] font-semibold text-fg">{c.title}</h3>
                    <div className="flex flex-wrap gap-4 font-mono text-[12px] text-muted">
                      <span>
                        {t('home.campaigns.qty').replace(
                          '{count}',
                          c.qty.toLocaleString(locale),
                        )}
                      </span>
                      <span>
                        {t('home.campaigns.closes')}{' '}
                        {dateFmt.format(new Date(c.closesAt))}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <section className="mx-auto max-w-[1360px] px-[24px] section">
        <div className="section__head">
          <div>
            <span className="section__eyebrow">{t('home.assortment.eyebrow')}</span>
            <h2>{t('home.assortment.title')}</h2>
            <p>{t('home.assortment.body')}</p>
          </div>
          <Link href="/catalog" className="btn btn--ghost">
            {t('home.assortment.seeAll')} <ArrowRightIcon />
          </Link>
        </div>
        <div className="grid grid-cols-6 gap-[16px] max-[1100px]:grid-cols-3 max-[600px]:grid-cols-2">
          {categoryTiles.map((c, i) => {
            const glyph = GLYPH_KEYS[i % GLYPH_KEYS.length] as keyof typeof GLYPHS;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="relative block rounded-lg border border-line bg-surface p-[22px] transition hover:-translate-y-[2px] hover:border-[var(--ink-700)]"
              >
                <div className="mb-[14px] inline-flex h-[56px] w-[56px] items-center justify-center rounded-md border border-line bg-surface-alt [&_svg]:h-[36px] [&_svg]:w-[36px]">
                  {GLYPHS[glyph]}
                </div>
                <h3 className="m-0 mb-1 block text-[14px] font-semibold text-fg">{c.name}</h3>
                <span className="font-mono text-[12px] text-muted">
                  {t('home.assortment.products').replace(
                    '{count}',
                    c.count.toLocaleString(locale),
                  )}
                </span>
                <span className="absolute right-[22px] top-[22px] text-line-strong">
                  <ArrowUpRightIcon />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-[24px] section pt-0">
        <div className="grid grid-cols-4 gap-[16px] max-[920px]:grid-cols-2 max-[600px]:grid-cols-1">
          <div className="flex gap-[14px] rounded-lg border border-line bg-surface-alt p-[20px]">
            <div className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <TruckIcon size={20} />
            </div>
            <div>
              <h4>{t('home.benefit.shipTitle')}</h4>
              <p>{t('home.benefit.shipBody')}</p>
            </div>
          </div>
          <div className="flex gap-[14px] rounded-lg border border-line bg-surface-alt p-[20px]">
            <div className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <WalletIcon size={20} />
            </div>
            <div>
              <h4>{t('home.benefit.creditTitle')}</h4>
              <p>{t('home.benefit.creditBody')}</p>
            </div>
          </div>
          <div className="flex gap-[14px] rounded-lg border border-line bg-surface-alt p-[20px]">
            <div className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <DocIcon size={20} />
            </div>
            <div>
              <h4>{t('home.benefit.docsTitle')}</h4>
              <p>{t('home.benefit.docsBody')}</p>
            </div>
          </div>
          <div className="flex gap-[14px] rounded-lg border border-line bg-surface-alt p-[20px]">
            <div className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h4>{t('home.benefit.erpTitle')}</h4>
              <p>{t('home.benefit.erpBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {products.data.length > 0 ? (
        <section className="mx-auto max-w-[1360px] px-[24px] section">
          <div className="section__head">
            <div>
              <span className="section__eyebrow">{t('home.bestsellers.eyebrow')}</span>
              <h2>{t('home.bestsellers.title')}</h2>
              <p>{t('home.bestsellers.body')}</p>
            </div>
            <Link href="/catalog" className="btn btn--ghost">
              {t('home.bestsellers.seeAll')} <ArrowRightIcon />
            </Link>
          </div>
          <ul className="m-0 grid list-none grid-cols-4 gap-[16px] p-0 max-[1100px]:grid-cols-2">
            {products.data.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  locale={locale}
                  resolved={p.resolvedPrice ?? null}
                  salesChannelCode={ctx.salesChannelCode}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <Hook code="homepage.bottom" />
    </>
  );
}

const FALLBACK_CATEGORY_DEFS: ReadonlyArray<{
  slug: string;
  nameKey: MessageKey;
  count: number;
}> = [
  { slug: 'memory', nameKey: 'home.fallback.memory', count: 1860 },
  { slug: 'mini-devices', nameKey: 'home.fallback.miniDevices', count: 942 },
  { slug: 'electronic-components', nameKey: 'home.fallback.components', count: 6240 },
  { slug: 'green-compute', nameKey: 'home.fallback.greenCompute', count: 1180 },
  { slug: 'server-parts', nameKey: 'home.fallback.serverParts', count: 2540 },
  { slug: 'cooling-power', nameKey: 'home.fallback.coolingPower', count: 1675 },
];

const GLYPH_KEYS = [
  'memory',
  'mini',
  'components',
  'green',
  'server',
  'cooling',
] as const;

/* Inline SVG glyphs for compute-supply fallback categories on the home page. */
const STROKE = '#a8aeb8';

const GLYPHS: Record<string, ReactNode> = {
  memory: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="18" y="30" width="64" height="40" rx="3" />
      {[28, 40, 52, 64, 76].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="22" />
      ))}
      <rect x="28" y="42" width="14" height="16" rx="1" />
      <rect x="48" y="42" width="14" height="16" rx="1" />
      <rect x="68" y="42" width="8" height="16" rx="1" />
    </svg>
  ),
  mini: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="28" y="34" width="44" height="32" rx="4" />
      <circle cx="50" cy="50" r="6" />
      <line x1="36" y1="70" x2="36" y2="78" />
      <line x1="64" y1="70" x2="64" y2="78" />
      <line x1="32" y1="78" x2="68" y2="78" />
    </svg>
  ),
  components: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="30" y="30" width="40" height="40" rx="3" />
      <rect x="40" y="40" width="20" height="20" rx="1" />
      {[38, 50, 62].map((y) => (
        <line key={`l-${y}`} x1="18" y1={y} x2="30" y2={y} />
      ))}
      {[38, 50, 62].map((y) => (
        <line key={`r-${y}`} x1="70" y1={y} x2="82" y2={y} />
      ))}
    </svg>
  ),
  green: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 78 V42" />
      <path d="M50 58 C50 42 66 34 78 30 C74 48 62 56 50 58 Z" />
      <path d="M50 52 C50 40 36 34 22 32 C26 48 38 54 50 52 Z" />
      <rect x="42" y="70" width="16" height="10" rx="1" />
    </svg>
  ),
  server: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="22" y="20" width="56" height="18" rx="2" />
      <rect x="22" y="42" width="56" height="18" rx="2" />
      <rect x="22" y="64" width="56" height="18" rx="2" />
      {[29, 51, 73].map((y) => (
        <circle key={y} cx="32" cy={y} r="2.5" />
      ))}
      {[29, 51, 73].map((y) => (
        <line key={`bar-${y}`} x1="42" y1={y} x2="68" y2={y} />
      ))}
    </svg>
  ),
  cooling: (
    <svg viewBox="0 0 100 100" fill="none" stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="50" r="28" />
      <circle cx="50" cy="50" r="6" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={50 + 8 * Math.cos(rad)}
            y1={50 + 8 * Math.sin(rad)}
            x2={50 + 24 * Math.cos(rad)}
            y2={50 + 24 * Math.sin(rad)}
          />
        );
      })}
    </svg>
  ),
};

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
    >
      {children}
    </svg>
  );
}

function ArrowRightIcon(): ReactNode {
  return svg(
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>,
    14,
  );
}
function ArrowUpRightIcon(): ReactNode {
  return svg(
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>,
    16,
  );
}
function LightningIcon(): ReactNode {
  return svg(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, 14);
}
function DocIcon({ size = 16 }: { size?: number } = {}): ReactNode {
  return svg(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>,
    size,
  );
}
function ShieldIcon({ size = 16 }: { size?: number } = {}): ReactNode {
  return svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, size);
}
function LayersIcon({ size = 16 }: { size?: number } = {}): ReactNode {
  return svg(
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>,
    size,
  );
}
function TruckIcon({ size = 18 }: { size?: number } = {}): ReactNode {
  return svg(
    <>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>,
    size,
  );
}
function WalletIcon({ size = 18 }: { size?: number } = {}): ReactNode {
  return svg(
    <>
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
      <path d="M16 12h6" />
    </>,
    size,
  );
}
function SettingsIcon({ size = 18 }: { size?: number } = {}): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>,
    size,
  );
}
