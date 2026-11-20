import type { ReactElement } from 'react';
import { tForLocale } from '../../lib/i18n/messages';

/**
 * The account page's "E-mail language" row (issue #652 / batch 44).
 *
 * Offered: the channel's own languages. Preselected: preferred when offered,
 * else the channel default. Saved by a server action that redirects with
 * `?languageSaved=1` / `?languageError=1`.
 */
export interface EmailLanguageRowProps {
  locale: string;
  /** The channel's languages, in its own spelling and order. */
  languages: readonly string[];
  defaultLanguage: string;
  /** The account's stored language, or `null` while unknown. */
  preferredLanguage: string | null;
  /** A language's name in that language (or the code as fallback). */
  labelOf: (code: string) => string;
  /** Whether the choice can be saved here — `customers` is present. */
  editable: boolean;
  saveAction: (formData: FormData) => Promise<void>;
  saved: boolean;
  failed: boolean;
}

const SELECT_ID = 'b2b-email-language';
const HINT_ID = 'b2b-email-language-hint';

function resolveOffered(
  languages: readonly string[],
  defaultLanguage: string,
  preferredLanguage: string | null,
): string {
  if (preferredLanguage) {
    const exact = languages.find((l) => l.toLowerCase() === preferredLanguage.toLowerCase());
    if (exact) return exact;
    const base = preferredLanguage.split('-')[0]?.toLowerCase() ?? '';
    const sameBase = languages.find((l) => (l.split('-')[0]?.toLowerCase() ?? '') === base);
    if (sameBase) return sameBase;
  }
  if (languages.includes(defaultLanguage)) return defaultLanguage;
  return languages[0] ?? defaultLanguage;
}

export function EmailLanguageRow(props: EmailLanguageRowProps): ReactElement {
  const t = tForLocale(props.locale);
  const resolved = resolveOffered(props.languages, props.defaultLanguage, props.preferredLanguage);
  const stored = props.preferredLanguage;
  const notOffered =
    stored !== null &&
    !props.languages.some((language) => language.toLowerCase() === stored.toLowerCase());
  const offered = props.languages.includes(resolved)
    ? props.languages
    : [resolved, ...props.languages];
  const choosable = props.editable && offered.length > 1;
  const note = notOffered ? (
    <p className="b2b-auth__hint">
      {t('account.profile.emailLanguageNotOffered')
        .replace('{language}', props.labelOf(stored))
        .replace('{fallback}', props.labelOf(resolved))}
    </p>
  ) : null;

  if (!choosable) {
    return (
      <tr>
        <th scope="row">{t('account.profile.emailLanguage')}</th>
        <td>
          {props.labelOf(resolved)}
          {note}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <th scope="row">
        <label htmlFor={SELECT_ID}>{t('account.profile.emailLanguage')}</label>
      </th>
      <td>
        <form action={props.saveAction} className="flex flex-wrap items-center gap-2">
          <select
            id={SELECT_ID}
            name="preferredLanguage"
            className="industria-select"
            defaultValue={resolved}
            aria-describedby={HINT_ID}
          >
            {offered.map((code) => (
              <option key={code} value={code} lang={code}>
                {props.labelOf(code)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn">
            {t('account.profile.emailLanguageSave')}
          </button>
        </form>
        <p id={HINT_ID} className="b2b-auth__hint">
          {t('account.profile.emailLanguageHint')}
        </p>
        {note}
        <div aria-live="polite">
          {props.saved ? (
            <p className="b2b-auth__success" role="status">
              {t('account.profile.emailLanguageSaved')}
            </p>
          ) : null}
        </div>
        {props.failed ? (
          <p className="b2b-auth__error" role="alert">
            {t('account.profile.emailLanguageError')}
          </p>
        ) : null}
      </td>
    </tr>
  );
}

/** The language the row's form submitted, or `null` when it carried none. */
export function emailLanguageFromForm(formData: FormData): string | null {
  const value = formData.get('preferredLanguage');
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
