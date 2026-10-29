import type { EntityManager } from '@mikro-orm/postgresql';
import type {
  CmsPageReadPort,
  CmsPageRecord,
  CmsPageStorefrontLink,
  CmsPageStorefrontLinkScope,
} from '@endora-commerce/contracts';
import { CmsPage } from '../entities/cms-page.entity.js';

/**
 * The page read model `cms` publishes (feature 075, Phase P).
 *
 * `seo` is the only consumer of the record readers; megamenu (feature 168)
 * reads `findStorefrontLinks` for CMS page-link labels and URLs.
 *
 * The `body` and `content` columns do not survive the mapping. A sitemap and a
 * meta-tag resolver have no use for a page's rendered tree, and shipping it
 * would make every sitemap build carry the whole CMS through memory.
 *
 * Note: upstream 168 pairs this with `page-paths.ts` + contracts helpers from
 * a fuller feature-163 tree (`cmsLocalizedPage`, per-language path nodes).
 * This fork's CMS page model keeps a single `path`/`slug`/`name`, so links are
 * resolved from those columns without the missing contracts helpers.
 */
export class CmsPageReadService implements CmsPageReadPort {
  constructor(private readonly emFactory: () => EntityManager) {}

  async findById(id: string): Promise<CmsPageRecord | null> {
    const page = await this.emFactory().findOne(CmsPage, { id });
    return page ? toCmsPageRecord(page) : null;
  }

  async findByPath(path: string): Promise<CmsPageRecord | null> {
    const page = await this.emFactory().findOne(CmsPage, { path });
    return page ? toCmsPageRecord(page) : null;
  }

  async findByIds(ids: readonly string[]): Promise<CmsPageRecord[]> {
    if (ids.length === 0) return [];
    const pages = await this.emFactory().find(CmsPage, { id: { $in: [...ids] } });
    return pages.map(toCmsPageRecord);
  }

  async listPublished(): Promise<CmsPageRecord[]> {
    const pages = await this.emFactory().find(
      CmsPage,
      { status: 'published' },
      { orderBy: { path: 'asc' } },
    );
    return pages.map(toCmsPageRecord);
  }

  /**
   * Feature 168 — storefront link for each requested page id (name + path).
   * Pages missing from the catalogue are omitted; order follows `ids`.
   */
  async findStorefrontLinks(
    ids: readonly string[],
    _scope: CmsPageStorefrontLinkScope,
  ): Promise<CmsPageStorefrontLink[]> {
    if (ids.length === 0) return [];
    const pages = await this.emFactory().find(CmsPage, { id: { $in: [...ids] } });
    const byId = new Map(pages.map((page) => [page.id, page]));
    const links: CmsPageStorefrontLink[] = [];
    for (const id of ids) {
      const page = byId.get(id);
      if (page === undefined) continue;
      // Scope language is accepted for port compatibility; this fork has no
      // per-language slug tree, so every requested page resolves the same way.
      void _scope.language;
      const path = page.path?.trim() || page.slug?.trim() || '';
      const url = path.replace(/^\/+/, '');
      links.push({
        id: page.id,
        name: page.name?.trim() || page.slug || page.id,
        url,
      });
    }
    return links;
  }
}

export function toCmsPageRecord(page: CmsPage): CmsPageRecord {
  return {
    id: page.id,
    path: page.path,
    slug: page.slug,
    status: page.status,
    name: page.name,
    active: page.active,
    title: page.title,
    metaTitle: page.metaTitle ?? null,
    metaDescription: page.metaDescription ?? null,
    metaKeywords: page.metaKeywords ?? null,
    publishedAt: page.publishedAt ?? null,
    archivedAt: page.archivedAt ?? null,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    parentPageId: page.parentPageId ?? null,
    // Feature 167 — the sitemap lists a page under each of its languages' prefixes.
    languages: [...(page.languages ?? [])],
  };
}
