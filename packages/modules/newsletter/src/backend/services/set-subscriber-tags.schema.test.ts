import { describe, expect, it } from 'vitest';
import { setSubscriberTagsRequestSchema } from '@endora-commerce/contracts';

describe('setSubscriberTagsRequestSchema', () => {
  it('accepts a list of tag codes', () => {
    expect(setSubscriberTagsRequestSchema.parse({ tags: ['vip', 'promo'] })).toEqual({
      tags: ['vip', 'promo'],
    });
  });

  it('rejects an empty tag code', () => {
    expect(() => setSubscriberTagsRequestSchema.parse({ tags: [''] })).toThrow();
  });
});