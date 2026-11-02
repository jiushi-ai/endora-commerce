'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { publicApiBaseUrl } from '../../lib/env.mjs';

/**
 * Minimal client form that posts a sealed bid to the public API base
 * (cookie session). Attachment ids are pasted as UUIDs for Batch D.
 */
export function SubmitBidForm({ campaignId }: { campaignId: string }): ReactNode {
  const apiBase = publicApiBaseUrl().replace(/\/+$/, '');
  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [attachmentId, setAttachmentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch(
        `${apiBase}/api/v1/bidding/campaigns/${encodeURIComponent(campaignId)}/receipts`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            bidUnitPrice: unitPrice.trim(),
            bidQty: Number(qty),
            attachmentAssetIds: [attachmentId.trim()],
          }),
        },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? `Submit failed (${res.status})`);
      }
      setOk(true);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 max-w-md">
      <h3>Submit sealed bid</h3>
      {error ? (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      ) : null}
      {ok ? <p className="muted">Submitted.</p> : null}
      <label className="block">
        Unit price
        <input
          className="block w-full border px-2 py-1"
          required
          value={unitPrice}
          onChange={(ev) => setUnitPrice(ev.target.value)}
          placeholder="100.00"
        />
      </label>
      <label className="block">
        Quantity
        <input
          className="block w-full border px-2 py-1"
          required
          type="number"
          min={1}
          value={qty}
          onChange={(ev) => setQty(ev.target.value)}
        />
      </label>
      <label className="block">
        Intent attachment asset id (UUID)
        <input
          className="block w-full border px-2 py-1 font-mono text-sm"
          required
          value={attachmentId}
          onChange={(ev) => setAttachmentId(ev.target.value)}
        />
      </label>
      <button type="submit" disabled={busy} className="border px-3 py-1">
        {busy ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
