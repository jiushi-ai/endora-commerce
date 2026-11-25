import { useEffect, useState, useCallback } from 'react';
import { slugify, type CustomFieldType, type NewsletterCustomField, type NewsletterTag } from '@endora-commerce/contracts';
import { useAuth } from '@endora-commerce/admin-kit/lib';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input, PageHeader, Select } from '@endora-commerce/admin-kit/ui';
import { newsletterClient } from '../api/newsletter-client.js';
import { customFieldTypeLabel } from '../lib/labels.js';

/** Backend requires tag codes / field keys to match this pattern. */
const CODE_RE = /^[a-z][a-z0-9_]*$/;
const CUSTOM_FIELD_TYPES: CustomFieldType[] = ['text', 'number', 'boolean', 'date'];

/**
 * Normalise free-text into a backend-valid code: lowercase, diacritics folded,
 * non-alphanumerics collapsed to underscores, trimmed. A leading digit still
 * fails `CODE_RE`, so callers validate the result before sending.
 *
 * The generator is `slugify` from `@endora-commerce/contracts`, **imported, never
 * re-implemented** (issues #239, #245). The private NFD one-liner it started as
 * did not fold `ł` — U+0142 has no canonical decomposition, so the strip had
 * nothing to remove — it *deleted* it: `Metody płatności` produced
 * `metody_p_atnosci`, a code with a hole in it that the operator could not
 * connect to anything typed.
 *
 * `_` is this caller's separator, passed explicitly, because the stored tag
 * code grammar is `^[a-z][a-z0-9_]*$` and every other caller kebab-cases. There
 * is no length option: the backend caps the column, not this prefill.
 *
 * Codes already stored are **not** migrated (owner's ruling, 2026-08-19): only
 * two developer environments exist, so renaming live tags buys nobody
 * anything. New codes are correct from here on.
 */
function slugifyCode(input: string): string {
  return slugify(input, { separator: '_' });
}

export function TagsPage(): React.ReactElement {
  const t = useTranslation('newsletter');
  const { hasPermission } = useAuth();
  const canWrite = hasPermission('newsletter:write');
  const [tags, setTags] = useState<NewsletterTag[]>([]);
  const [fields, setFields] = useState<NewsletterCustomField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tagCode, setTagCode] = useState('');
  const [tagName, setTagName] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [editTag, setEditTag] = useState<{ id: string; name: string; description: string } | null>(null);
  const [editField, setEditField] = useState<{ id: string; label: string } | null>(null);

  const load = useCallback(() => {
    newsletterClient.listTags().then((r) => setTags(r.items)).catch((e: unknown) => setError(String(e)));
    newsletterClient.listCustomFields().then((r) => setFields(r.items)).catch(() => undefined);
  }, []);
  useEffect(() => load(), [load]);

  async function run(fn: () => Promise<unknown>): Promise<void> {
    setError(null);
    try {
      await fn();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const addTag = (): void =>
    void run(async () => {
      if (tagName.trim() === '') throw new Error(t('tags.error.nameRequired'));
      const code = slugifyCode(tagCode.trim() || tagName);
      if (!CODE_RE.test(code)) {
        throw new Error(t('tags.error.codeInvalid'));
      }
      await newsletterClient.createTag({ code, name: tagName.trim() });
      setTagCode('');
      setTagName('');
    });

  const addField = (): void =>
    void run(async () => {
      if (fieldLabel.trim() === '') throw new Error(t('tags.fields.error.labelRequired'));
      const key = slugifyCode(fieldKey.trim() || fieldLabel);
      if (!CODE_RE.test(key)) {
        throw new Error(t('tags.fields.error.keyInvalid'));
      }
      await newsletterClient.createCustomField({ key, label: fieldLabel.trim(), type: fieldType });
      setFieldKey('');
      setFieldLabel('');
      setFieldType('text');
    });

  if (!hasPermission('newsletter:read')) {
    return (
      <Alert>
        <AlertDescription>{t('permission.viewDenied')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t('tags.page.title')} description={t('tags.page.description')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{t('tags.card.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canWrite ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Input placeholder={t('tags.codeOptional')} value={tagCode} onChange={(e) => setTagCode(e.target.value)} className="max-w-[160px]" />
                <Input placeholder={t('tags.namePlaceholder')} value={tagName} onChange={(e) => setTagName(e.target.value)} className="max-w-[200px]" />
                <Button size="sm" onClick={addTag}>
                  {t('tags.addTag')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('tags.codeHint')}</p>
            </div>
          ) : null}
          <ul className="divide-y text-sm">
            {tags.map((tagRow) => {
              const et = editTag && editTag.id === tagRow.id ? editTag : null;
              return (
                <li key={tagRow.id} className="flex items-center justify-between gap-2 py-2">
                  {et ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{tagRow.code}</span>
                      <Input
                        value={et.name}
                        placeholder={t('tags.namePlaceholder')}
                        onChange={(e) => setEditTag({ ...et, name: e.target.value })}
                        className="max-w-[200px]"
                      />
                      <Input
                        value={et.description}
                        placeholder={t('tags.descriptionPlaceholder')}
                        onChange={(e) => setEditTag({ ...et, description: e.target.value })}
                        className="max-w-[240px]"
                      />
                    </div>
                  ) : (
                    <span>
                      <span className="font-mono text-xs">{tagRow.code}</span> — {tagRow.name}
                      {tagRow.description ? <span className="text-muted-foreground"> · {tagRow.description}</span> : null}
                    </span>
                  )}
                  {canWrite ? (
                    <div className="flex items-center gap-1">
                      {et ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              void run(async () => {
                                if (et.name.trim() === '') throw new Error(t('tags.error.nameRequired'));
                                await newsletterClient.updateTag(tagRow.id, {
                                  name: et.name.trim(),
                                  description: et.description.trim() === '' ? null : et.description.trim(),
                                });
                                setEditTag(null);
                              })
                            }
                          >
                            {t('common.save')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditTag(null)}>
                            {t('common.cancel')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditTag({ id: tagRow.id, name: tagRow.name, description: tagRow.description ?? '' })}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => void run(() => newsletterClient.deleteTag(tagRow.id))}>
                            {t('common.delete')}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('tags.fields.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canWrite ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Input placeholder={t('tags.fields.keyOptional')} value={fieldKey} onChange={(e) => setFieldKey(e.target.value)} className="max-w-[160px]" />
                <Input placeholder={t('tags.fields.labelPlaceholder')} value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} className="max-w-[200px]" />
                <Select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                  className="max-w-[130px]"
                >
                  {CUSTOM_FIELD_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {customFieldTypeLabel(t, ty)}
                    </option>
                  ))}
                </Select>
                <Button size="sm" onClick={addField}>
                  {t('tags.fields.addField')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('tags.fields.keyHint')}</p>
            </div>
          ) : null}
          <ul className="divide-y text-sm">
            {fields.map((f) => {
              const ef = editField && editField.id === f.id ? editField : null;
              return (
                <li key={f.id} className="flex items-center justify-between gap-2 py-2">
                  {ef ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{f.key}</span>
                      <Input
                        value={ef.label}
                        placeholder={t('tags.fields.labelPlaceholder')}
                        onChange={(e) => setEditField({ ...ef, label: e.target.value })}
                        className="max-w-[240px]"
                      />
                      <span className="text-xs text-muted-foreground">({f.type})</span>
                    </div>
                  ) : (
                    <span>
                      <span className="font-mono text-xs">{f.key}</span> — {f.label} ({customFieldTypeLabel(t, f.type)})
                    </span>
                  )}
                  {canWrite ? (
                    <div className="flex items-center gap-1">
                      {ef ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              void run(async () => {
                                if (ef.label.trim() === '') throw new Error(t('tags.fields.error.labelRequired'));
                                await newsletterClient.updateCustomField(f.id, { label: ef.label.trim() });
                                setEditField(null);
                              })
                            }
                          >
                            {t('common.save')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditField(null)}>
                            {t('common.cancel')}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditField({ id: f.id, label: f.label })}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void run(() => newsletterClient.deleteCustomField(f.id))}
                          >
                            {t('common.delete')}
                          </Button>
                        </>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
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
export default TagsPage;
