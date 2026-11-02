import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ApiError, apiClient } from '@endora-commerce/admin-kit/lib';
import {
  Alert,
  AlertDescription,
  Button,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@endora-commerce/admin-kit/ui';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import type { BiddingReceiptAdmin } from '@endora-commerce/contracts';

/**
 * Admin receipt review desk — approve ops/sales, confirm deposit (Batch D / T14).
 */
export function ReceiptsPage(): ReactNode {
  const t = useTranslation('bidding');
  const [rows, setRows] = useState<BiddingReceiptAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: BiddingReceiptAdmin[] }>(
        '/api/v1/admin/bidding/receipts',
      );
      setRows(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('receipts.error.load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const approve = async (id: string, step: 'ops' | 'sales'): Promise<void> => {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/receipts/${id}/approve`, { step });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('receipts.error.action'));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeposit = async (id: string): Promise<void> => {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/receipts/${id}/confirm-deposit`, {});
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('receipts.error.action'));
    } finally {
      setBusyId(null);
    }
  };

  const convert = async (id: string): Promise<void> => {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/receipts/${id}/convert-to-order`, {});
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('receipts.error.action'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title={t('receipts.title')} description={t('receipts.description')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <p className="text-muted-foreground text-sm">{t('receipts.loading')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('receipts.col.id')}</TableHead>
              <TableHead>{t('receipts.col.campaign')}</TableHead>
              <TableHead>{t('receipts.col.org')}</TableHead>
              <TableHead>{t('receipts.col.status')}</TableHead>
              <TableHead>{t('receipts.col.bid')}</TableHead>
              <TableHead>{t('receipts.col.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs">{row.id.slice(0, 8)}…</TableCell>
                <TableCell className="font-mono text-xs">{row.campaignId.slice(0, 8)}…</TableCell>
                <TableCell className="font-mono text-xs">{row.organizationId.slice(0, 8)}…</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-sm">
                  {row.bidUnitPrice ?? '—'} × {row.bidQty ?? '—'}
                </TableCell>
                <TableCell className="space-x-2">
                  {row.status === 'submitted' || row.status === 'ops_review' ? (
                    <Button
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void approve(row.id, 'ops')}
                    >
                      {t('receipts.action.ops')}
                    </Button>
                  ) : null}
                  {row.status === 'sales_review' ? (
                    <Button
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void approve(row.id, 'sales')}
                    >
                      {t('receipts.action.sales')}
                    </Button>
                  ) : null}
                  {row.status === 'await_deposit' ? (
                    <Button
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void confirmDeposit(row.id)}
                    >
                      {t('receipts.action.deposit')}
                    </Button>
                  ) : null}
                  {row.status === 'deposit_confirmed' ||
                  row.status === 'won_pending_fulfilment' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === row.id}
                      onClick={() => void convert(row.id)}
                    >
                      {t('receipts.action.convert')}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-sm">
                  {t('receipts.empty')}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default ReceiptsPage;
