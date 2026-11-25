import { describe, expect, it } from 'vitest';
import { defaultHeaderTree } from './default-header.js';
import {
  DEFAULT_SYSTEM_EMAIL_LANGUAGES,
  defaultFooterContentEnvelope,
  defaultFooterTree,
} from './default-footer.js';

function footerLegalProps(tree: ReturnType<typeof defaultFooterTree>) {
  const node = tree.content.find((c) => c.type === 'transactional_emails.EmailFooterLegal');
  expect(node).toBeTruthy();
  return node!.props as { text: string };
}

function headerLogoProps(tree: ReturnType<typeof defaultHeaderTree>) {
  const node = tree.content.find((c) => c.type === 'transactional_emails.EmailLogo');
  expect(node).toBeTruthy();
  return node!.props as { alt: string };
}

describe('default email system blocks', () => {
  it('localizes footer legal copy and keeps unsubscribe var per locale', () => {
    for (const lang of DEFAULT_SYSTEM_EMAIL_LANGUAGES) {
      const { text } = footerLegalProps(defaultFooterTree(lang));
      expect(text).toContain('{{var unsubscribeUrl}}');
      expect(text).toMatch(/<a href="\{\{var unsubscribeUrl\}\}">/);
    }
    expect(footerLegalProps(defaultFooterTree('en-US')).text).toContain('Unsubscribe');
    expect(footerLegalProps(defaultFooterTree('zh-CN')).text).toContain('取消订阅');
    expect(footerLegalProps(defaultFooterTree('zh-TW')).text).toContain('取消訂閱');
    expect(footerLegalProps(defaultFooterTree('pl-PL')).text).toContain('Wypisz się');
  });

  it('localizes header logo alt per locale', () => {
    expect(headerLogoProps(defaultHeaderTree('zh-CN')).alt).toBe('标志');
    expect(headerLogoProps(defaultHeaderTree('zh-TW')).alt).toBe('標誌');
    expect(headerLogoProps(defaultHeaderTree('en-US')).alt).toBe('Logo');
  });

  it('builds a four-locale footer envelope', () => {
    const envelope = defaultFooterContentEnvelope();
    expect(envelope.schema_version).toBe(1);
    for (const lang of DEFAULT_SYSTEM_EMAIL_LANGUAGES) {
      expect(envelope.languages[lang]).toBeTruthy();
    }
  });
});