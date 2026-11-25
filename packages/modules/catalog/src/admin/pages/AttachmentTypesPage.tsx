import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  adminLanguageToLocale,
  buildLocalizedNamePayload,
  pickCategoryDisplayName,
  useActiveContentLanguageCodes,
} from '@endora-commerce/admin-kit/components';
import { ApiError, apiClient } from '@endora-commerce/admin-kit/lib';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageHeader, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@endora-commerce/admin-kit/ui';
import { useTranslation, useTranslationContext } from '@endora-commerce/admin-kit/i18n';

interface AttachmentType {
  id: string;
  code: string;
  name: Record<string, string>;
  position: number;
  usageCount?: number;
}

/**
 * Attachment Types dictionary CRUD (T087, feature 002 US3).
 *
 * Foundation pattern: single-file module, inline `useState` + `useEffect`,
 * direct `apiClient` calls. Mirrors AttributeSetsPage but lighter — type
 * is just `code + name (multilingual) + position`. The system seeds 4
 * standard rows (certificate / tech_spec / product_card / pdf) which the
 * server reports with `usageCount > 0` once any product attaches one.
 */
export function AttachmentTypesPage(): ReactNode {
  const t = useTranslation('catalog');
  const { language } = useTranslationContext();
  const listLocale = adminLanguageToLocale(language);
  const [types, setTypes] = useState<AttachmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: AttachmentType[] }>(
        '/api/v1/admin/catalog/attachment-types',
      );
      setTypes(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('attachmentTypes.error.load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(
    async (input: { code: string; names: Record<string, string> }): Promise<void> => {
      const name = buildLocalizedNamePayload(input.names);
      if (!name) {
        setError(t('attachmentTypes.error.create'));
        return;
      }
      try {
        await apiClient.post('/api/v1/admin/catalog/attachment-types', {
          code: input.code,
          name,
        });
        setInfo(t('attachmentTypes.success.create', { code: input.code }));
        await refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.envelope.error.message : t('attachmentTypes.error.create'));
      }
    },
    [refresh, t],
  );

  const handleDelete = useCallback(
    async (id: string, code: string, usage: number): Promise<void> => {
      if (usage > 0) {
        alert(t('attachmentTypes.deleteInUse', { code, count: usage }));
        return;
      }
      if (!confirm(t('attachmentTypes.deleteConfirm', { code }))) return;
      try {
        await apiClient.delete(`/api/v1/admin/catalog/attachment-types/${id}`);
        setInfo(t('attachmentTypes.success.delete', { code }));
        await refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.envelope.error.message : t('attachmentTypes.error.delete'));
      }
    },
    [refresh, t],
  );

  return (
    <div>
      <PageHeader
        title={t('attachmentTypes.page.title')}
        description={t('attachmentTypes.page.description')}
      />

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {info ? (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('attachmentTypes.list.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('attachmentTypes.loading')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('attachmentTypes.column.code')}</TableHead>
                  <TableHead>{t('attachmentTypes.column.name')}</TableHead>
                  <TableHead>{t('attachmentTypes.column.position')}</TableHead>
                  <TableHead>{t('attachmentTypes.column.inUse')}</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap">{t('attachmentTypes.column.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.code}</TableCell>
                    <TableCell>
                      {pickCategoryDisplayName(row.name, row.code, listLocale)}
                    </TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.usageCount ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void handleDelete(row.id, row.code, row.usageCount ?? 0)}
                      >
                        {t('attachmentTypes.action.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <CreateAttachmentTypeInline onCreate={handleCreate} />
        </CardContent>
      </Card>
    </div>
  );
}

function CreateAttachmentTypeInline({
  onCreate,
}: {
  onCreate: (input: { code: string; names: Record<string, string> }) => Promise<void>;
}): ReactNode {
  const t = useTranslation('catalog');
  const tCore = useTranslation('core');
  const localeCodes = useActiveContentLanguageCodes();
  const [code, setCode] = useState('');
  const [names, setNames] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const locale of localeCodes) {
      seed[locale] = '';
    }
    return seed;
  });
  useEffect(() => {
    setNames((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const locale of localeCodes) {
        if (!(locale in next)) {
          next[locale] = '';
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [localeCodes]);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!code || !buildLocalizedNamePayload(names)) return;
    void onCreate({ code, names }).then(() => {
      setCode('');
      setNames((prev) => Object.fromEntries(Object.keys(prev).map((locale) => [locale, ''])));
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 md:grid-cols-4 border-t pt-4"
      aria-label={t('attachmentTypes.create.title')}
    >
      <div className="space-y-1">
        <Label htmlFor="atcode">{t('attachmentTypes.field.code')}</Label>
        <Input
          id="atcode"
          value={code}
          onChange={(e): void => setCode(e.target.value)}
          placeholder="warranty"
          pattern="[a-z0-9_]+"
          required
        />
      </div>
      {localeCodes.map((locale) => (
        <div key={locale} className="space-y-1">
          <Label htmlFor={`atname-${locale}`}>
            {tCore('legacyMethods.fields.nameForLocale', { locale })}
          </Label>
          <Input
            id={`atname-${locale}`}
            value={names[locale] ?? ''}
            onChange={(e): void =>
              setNames((prev) => ({ ...prev, [locale]: e.target.value }))
            }
          />
        </div>
      ))}
      <div className="md:col-span-4">
        <Button type="submit">{t('attachmentTypes.action.add')}</Button>
      </div>
    </form>
  );
}

/**
 * The default export a route declaration's dynamic-import factory resolves
 * (feature 091, R6). The named export stays: it is the spelling this module's
 * own siblings and tests use.
 */
export default AttachmentTypesPage;
