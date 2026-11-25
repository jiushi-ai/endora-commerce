import { useEffect, useState, useCallback } from 'react';
import type { Data } from '@puckeditor/core';
import type { NewsletterCustomField, NewsletterEmailBlockSummary } from '@endora-commerce/contracts';
import { useAuth } from '@endora-commerce/admin-kit/lib';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader } from '@endora-commerce/admin-kit/ui';
import { EMPTY_CELL } from '../lib/labels.js';
import {
  EmailEditorPane,
  EmailVariablesProvider,
  listEmailTemplatesForApply,
  loadEmailTemplateCanvas,
  saveCanvasAsEmailTemplate,
} from '@endora-commerce/page-builder-admin/email';
import { newsletterVariables } from '../email-variables.js';
import { newsletterClient } from '../api/newsletter-client.js';

const emptyData: Data = { root: { props: {} }, content: [] };

function asData(content: unknown): Data {
  if (!content || typeof content !== 'object') return emptyData;
  return content as Data;
}

export function BlocksPage(): React.ReactElement {
  const t = useTranslation('newsletter');
  const { hasPermission } = useAuth();
  const canWrite = hasPermission('newsletter:write');
  const [items, setItems] = useState<NewsletterEmailBlockSummary[]>([]);
  const [customFields, setCustomFields] = useState<NewsletterCustomField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [createContent, setCreateContent] = useState<Data>(emptyData);
  const [edit, setEdit] = useState<{
    id: string;
    code: string;
    name: string;
    content: Data;
    active: boolean;
    version: number;
  } | null>(null);

  const load = useCallback(() => {
    newsletterClient
      .listBlocks()
      .then((r) => setItems(r.items))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);
  useEffect(() => load(), [load]);
  useEffect(() => {
    newsletterClient
      .listCustomFields()
      .then((r) => setCustomFields(r.items))
      .catch(() => undefined);
  }, []);

  const startEdit = useCallback((id: string): void => {
    setError(null);
    newsletterClient
      .getBlock(id)
      .then((b) => {
        setEdit({
          id: b.id,
          code: b.code,
          name: b.name,
          content: asData(b.content),
          active: b.active,
          version: b.version,
        });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  async function run(fn: () => Promise<unknown>): Promise<void> {
    setError(null);
    try {
      await fn();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (!hasPermission('newsletter:read')) {
    return (
      <Alert>
        <AlertDescription>{t('permission.viewDenied')}</AlertDescription>
      </Alert>
    );
  }

  const variables = newsletterVariables(customFields.map((f) => ({ key: f.key, label: f.label })));

  return (
    <div className="space-y-4">
      <PageHeader title={t('blocks.page.title')} description={t('blocks.page.description')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <EmailVariablesProvider variables={variables}>
        {canWrite && edit ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('blocks.edit.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input value={edit.code} readOnly disabled className="max-w-sm font-mono" />
              <Input
                placeholder={t('blocks.namePlaceholder')}
                value={edit.name}
                onChange={(e) => setEdit((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                className="max-w-sm"
              />
              <EmailEditorPane
                editorKey={`nl-block:${edit.id}`}
                data={edit.content}
                onChange={(data) => setEdit((prev) => (prev ? { ...prev, content: data } : prev))}
                builderContext="newsletter"
                {...(canWrite
                  ? {
                      onSaveAsTemplate: async (
                        meta: { name: string; code: string },
                        canvasData: Data,
                      ) => {
                        await saveCanvasAsEmailTemplate({
                          ...meta,
                          data: canvasData,
                          languages: ['en-US'],
                          activeLanguage: 'en-US',
                        });
                      },
                    }
                  : {})}
                onListTemplatesForApply={() => listEmailTemplatesForApply(null)}
                onResolveTemplateLayout={(templateId) => loadEmailTemplateCanvas(templateId, 'en-US')}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={edit.active}
                  onChange={(e) => setEdit((prev) => (prev ? { ...prev, active: e.target.checked } : prev))}
                />
                {t('blocks.active')}
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    void run(async () => {
                      await newsletterClient.updateBlock(edit.id, {
                        name: edit.name,
                        content: edit.content as Record<string, unknown>,
                        active: edit.active,
                        expectedVersion: edit.version,
                      });
                      setEdit(null);
                    })
                  }
                >
                  {t('blocks.saveChanges')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEdit(null)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        {canWrite && !edit ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('blocks.new.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder={t('blocks.codePlaceholder')} value={code} onChange={(e) => setCode(e.target.value)} className="max-w-sm" />
              <Input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
              <EmailEditorPane
                editorKey={`nl-block:new:${code || 'draft'}`}
                data={createContent}
                onChange={setCreateContent}
                builderContext="newsletter"
                onSaveAsTemplate={async (meta, canvasData) => {
                  await saveCanvasAsEmailTemplate({
                    ...meta,
                    data: canvasData,
                    languages: ['en-US'],
                    activeLanguage: 'en-US',
                  });
                }}
                onListTemplatesForApply={() => listEmailTemplatesForApply(null)}
                onResolveTemplateLayout={(templateId) => loadEmailTemplateCanvas(templateId, 'en-US')}
              />
              <Button
                size="sm"
                onClick={() =>
                  void run(async () => {
                    await newsletterClient.createBlock({
                      code,
                      name,
                      content: createContent as Record<string, unknown>,
                    });
                    setCode('');
                    setName('');
                    setCreateContent(emptyData);
                  })
                }
              >
                {t('blocks.create')}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </EmailVariablesProvider>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">{t('common.code')}</th>
                <th className="p-3 font-medium">{t('common.name')}</th>
                <th className="p-3 font-medium">{t('blocks.table.active')}</th>
                <th className="p-3 font-medium">{t('blocks.table.system')}</th>
                {canWrite ? <th className="p-3 font-medium">{t('common.actions')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="p-3 font-mono text-xs">{b.code}</td>
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">{b.active ? t('common.yes') : EMPTY_CELL}</td>
                  <td className="p-3">{b.isSystem ? t('common.yes') : EMPTY_CELL}</td>
                  {canWrite ? (
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(b.id)}>
                          {t('common.edit')}
                        </Button>
                        {!b.isSystem ? (
                          <Button variant="ghost" size="sm" onClick={() => void run(() => newsletterClient.deleteBlock(b.id))}>
                            {t('common.delete')}
                          </Button>
                        ) : (
                          <span className="self-center text-xs text-muted-foreground">{t('common.protected')}</span>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={canWrite ? 5 : 4}>
                    {t('blocks.empty')}
                  </td>
                </tr>
              ) : null}
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
export default BlocksPage;
