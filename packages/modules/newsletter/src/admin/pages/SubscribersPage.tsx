import { useEffect, useState, useCallback } from 'react';
import type { NewsletterTag, ScopeNoticeCode, SubscriberSummary } from '@endora-commerce/contracts';
import { ModalDialog, ScopeNotice } from '@endora-commerce/admin-kit/components';
import { useAuth } from '@endora-commerce/admin-kit/lib';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import { Alert, AlertDescription, Button, Card, CardContent, Input, PageHeader } from '@endora-commerce/admin-kit/ui';
import { newsletterClient } from '../api/newsletter-client.js';
import { EMPTY_CELL, subscriberSourceLabel, subscriberStatusLabel } from '../lib/labels.js';

export function SubscribersPage(): React.ReactElement {
  const t = useTranslation('newsletter');
  const { hasPermission } = useAuth();
  const canWrite = hasPermission('newsletter:write');
  const [items, setItems] = useState<SubscriberSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [scopeNotice, setScopeNotice] = useState<ScopeNoticeCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [allTags, setAllTags] = useState<NewsletterTag[]>([]);
  const [tagEdit, setTagEdit] = useState<{ subscriberId: string; selected: Set<string> } | null>(null);
  const [tagBusy, setTagBusy] = useState(false);

  const load = useCallback(() => {
    newsletterClient
      .listSubscribers({ page: 1, pageSize: 50, ...(q ? { q } : {}), ...(tag ? { tag } : {}) })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
        setScopeNotice(res.scopeNotice);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, [q, tag]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    newsletterClient
      .listTags()
      .then((r) => setAllTags(r.items))
      .catch(() => undefined);
  }, []);

  if (!hasPermission('newsletter:read')) {
    return (
      <Alert>
        <AlertDescription>{t('permission.viewDenied')}</AlertDescription>
      </Alert>
    );
  }

  const exportHref = newsletterClient.subscribersExportUrl({ ...(q ? { q } : {}), ...(tag ? { tag } : {}) });

  async function action(fn: () => Promise<unknown>): Promise<void> {
    try {
      await fn();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function openTagEditor(subscriber: SubscriberSummary): void {
    setTagEdit({ subscriberId: subscriber.id, selected: new Set(subscriber.tags) });
  }

  async function saveTags(): Promise<void> {
    if (!tagEdit) return;
    setTagBusy(true);
    setError(null);
    try {
      await newsletterClient.setSubscriberTags(tagEdit.subscriberId, [...tagEdit.selected]);
      setTagEdit(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setTagBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('subscribers.page.title')}
        description={t('subscribers.page.description', { count: total })}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t('subscribers.searchEmail')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder={t('subscribers.filterTag')}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="max-w-xs"
        />
        <a href={exportHref} className="ml-auto">
          <Button variant="outline">{t('common.exportCsv')}</Button>
        </a>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">{t('subscribers.table.email')}</th>
                <th className="p-3 font-medium">{t('common.status')}</th>
                <th className="p-3 font-medium">{t('subscribers.table.tags')}</th>
                <th className="p-3 font-medium">{t('subscribers.table.source')}</th>
                {canWrite ? <th className="p-3 font-medium">{t('common.actions')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="p-3 font-medium">{s.email}</td>
                  <td className="p-3">{subscriberStatusLabel(t, s.status)}</td>
                  <td className="p-3 text-xs">{s.tags.join(', ') || EMPTY_CELL}</td>
                  <td className="p-3 text-xs">{subscriberSourceLabel(t, s.source)}</td>
                  {canWrite ? (
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openTagEditor(s)}>
                          {t('subscribers.action.editTags')}
                        </Button>
                        {s.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              void action(async () => {
                                const detail = await newsletterClient.getSubscriber(s.id);
                                await newsletterClient.unsubscribe(s.id, detail.version);
                              })
                            }
                          >
                            {t('subscribers.action.unsubscribe')}
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void action(() => newsletterClient.deleteSubscriber(s.id))}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={canWrite ? 5 : 4}>
                    {scopeNotice ? <ScopeNotice notice={scopeNotice} /> : t('subscribers.empty')}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {tagEdit ? (
        <ModalDialog
          title={t('subscribers.tagsDialog.title')}
          onClose={() => {
            if (!tagBusy) setTagEdit(null);
          }}
          busy={tagBusy}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTagEdit(null)} disabled={tagBusy}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => void saveTags()} disabled={tagBusy}>
                {t('common.save')}
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-sm text-muted-foreground">{t('subscribers.tagsDialog.hint')}</p>
          {allTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('subscribers.tagsDialog.noneAvailable')}</p>
          ) : (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {allTags.map((tg) => (
                <label key={tg.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={tagEdit.selected.has(tg.code)}
                    onChange={(e) =>
                      setTagEdit((prev) => {
                        if (!prev) return prev;
                        const selected = new Set(prev.selected);
                        if (e.target.checked) selected.add(tg.code);
                        else selected.delete(tg.code);
                        return { ...prev, selected };
                      })
                    }
                  />
                  <span className="font-mono text-xs text-muted-foreground">{tg.code}</span>
                  <span>{tg.name}</span>
                </label>
              ))}
            </div>
          )}
        </ModalDialog>
      ) : null}
    </div>
  );
}

/**
 * The registry loads a route component through a dynamic-import factory and
 * reads its default export (feature 091, FR-013). The named export stays: it is
 * the spelling this module's own code and its tests use.
 */
export default SubscribersPage;