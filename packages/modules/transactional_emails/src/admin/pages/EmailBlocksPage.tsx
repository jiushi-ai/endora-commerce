import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { EmailBlockSummary } from '@endora-commerce/contracts';
import { ADMIN_UI_CONTENT_LOCALES } from '@endora-commerce/admin-kit/components';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import { useAuth } from '@endora-commerce/admin-kit/lib';
import { Alert, AlertDescription, Button, Card, CardContent, Input, PageHeader } from '@endora-commerce/admin-kit/ui';
import { transactionalEmailsClient } from '../api/transactional-emails-client.js';

export function EmailBlocksPage(): React.ReactElement {
  const { hasPermission } = useAuth();
  const t = useTranslation('transactional_emails');
  const canWrite = hasPermission('transactional_emails:write');
  const [items, setItems] = useState<EmailBlockSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const reload = (): void => {
    transactionalEmailsClient
      .listBlocks()
      .then((res) => setItems(res.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  };
  useEffect(reload, []);

  const create = async (): Promise<void> => {
    setError(null);
    try {
      // Batch 68 — seed content languages aligned with Admin UI picker (not legacy en/pl only).
      await transactionalEmailsClient.createBlock({
        code,
        name,
        languages: [...ADMIN_UI_CONTENT_LOCALES],
      });
      setCode('');
      setName('');
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const remove = async (id: string): Promise<void> => {
    if (!window.confirm(t('blocks.deleteConfirm'))) return;
    try {
      await transactionalEmailsClient.deleteBlock(id);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!hasPermission('transactional_emails:read')) {
    return (
      <Alert>
        <AlertDescription>{t('blocks.noPermission')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t('blocks.page.title')} description={t('blocks.page.description')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {canWrite ? (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-6">
            <Input
              placeholder={t('blocks.placeholder.code')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="max-w-[200px]"
            />
            <Input
              placeholder={t('blocks.placeholder.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-[240px]"
            />
            <Button onClick={() => void create()} disabled={!code || !name}>
              {t('blocks.create')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">{t('blocks.column.name')}</th>
                <th className="p-3 font-medium">{t('blocks.column.code')}</th>
                <th className="p-3 font-medium">{t('blocks.column.scope')}</th>
                <th className="p-3 font-medium">{t('blocks.column.system')}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Link className="font-medium text-primary hover:underline" to={`/transactional-emails/blocks/${b.id}`}>
                      {b.name}
                    </Link>
                  </td>
                  <td className="p-3 font-mono text-xs">{b.code}</td>
                  <td className="p-3">{b.scope}</td>
                  <td className="p-3">{b.isSystem ? t('list.yes') : '—'}</td>
                  <td className="p-3 text-right">
                    {canWrite && !b.isSystem ? (
                      <Button variant="outline" size="sm" onClick={() => void remove(b.id)}>
                        {t('blocks.action.delete')}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * The registry loads a route component through a dynamic-import factory and
 * reads its default export (feature 091, FR-013). The named export stays: it is
 * the spelling this module's own code and its tests use.
 */
export default EmailBlocksPage;
