'use client';

import { useState, type FormEvent, type ReactNode } from 'react';

/**
 * Sealed bid form: download intent template, upload signed PDF, submit.
 *
 * Browser calls stay same-origin (`/api/bidding/…`). Those Route Handlers
 * forward `b2b_session` to the backend — required when the API host differs
 * from the storefront (production `b2b.*` vs `api.*`).
 */
export function SubmitBidForm(props: {
  campaignId: string;
  hasIntentTemplate: boolean;
}): ReactNode {
  const { campaignId, hasIntentTemplate } = props;
  const biddingBase = `/api/bidding/campaigns/${encodeURIComponent(campaignId)}`;
  const [unitPrice, setUnitPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function downloadTemplate(): Promise<void> {
    setError(null);
    try {
      const res = await fetch(`${biddingBase}/intent-template`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? `Download failed (${res.status})`);
      }
      const json = (await res.json()) as { data: { url: string; filename: string } };
      const a = document.createElement('a');
      a.href = json.data.url;
      a.download = json.data.filename || 'intent-template.pdf';
      a.rel = 'noopener';
      a.target = '_blank';
      a.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download template');
    }
  }

  async function onFileChange(file: File | null): Promise<void> {
    if (!file) {
      setAttachmentId(null);
      setAttachmentName(null);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch(`${biddingBase}/intent-attachments`, {
        method: 'POST',
        credentials: 'same-origin',
        body: fd,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
      }
      const json = (await res.json()) as { data: { id: string; filename: string } };
      setAttachmentId(json.data.id);
      setAttachmentName(json.data.filename);
    } catch (err) {
      setAttachmentId(null);
      setAttachmentName(null);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!attachmentId) {
      setError('Upload your signed intent PDF before submitting.');
      return;
    }
    setBusy(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch(`${biddingBase}/receipts`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          bidUnitPrice: unitPrice.trim(),
          bidQty: Number(qty),
          attachmentAssetIds: [attachmentId],
        }),
      });
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

      <div className="space-y-2 rounded border border-dashed border-neutral-300 p-3">
        <p className="text-sm font-medium">Intent agreement (PDF)</p>
        <p className="muted text-xs">
          Download the template, fill and stamp it offline, then upload the scanned PDF.
        </p>
        <div className="flex flex-wrap gap-2">
          {hasIntentTemplate ? (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => void downloadTemplate()}
            >
              Download template
            </button>
          ) : (
            <span className="muted text-xs">No template published for this campaign.</span>
          )}
          <label className="btn btn--dark btn--sm cursor-pointer">
            {uploading ? 'Uploading…' : 'Upload signed PDF'}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={uploading || busy}
              onChange={(ev) => void onFileChange(ev.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        {attachmentName ? (
          <p className="text-xs">
            Attached: <strong>{attachmentName}</strong>
          </p>
        ) : (
          <p className="muted text-xs">No signed PDF uploaded yet.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={busy || uploading || !attachmentId}
        className="btn btn--dark"
      >
        {busy ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
