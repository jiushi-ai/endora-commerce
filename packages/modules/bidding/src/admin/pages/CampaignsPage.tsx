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
import type { BiddingCampaign } from '@endora-commerce/contracts';

/**
 * Admin campaign desk — list + publish / close-bids actions (Batch D / T14).
 */
export function CampaignsPage(): ReactNode {
  const t = useTranslation('bidding');
  const [rows, setRows] = useState<BiddingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: BiddingCampaign[] }>('/api/v1/admin/bidding/campaigns');
      setRows(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('campaigns.error.load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (id: string, action: 'publish' | 'close-bids'): Promise<void> => {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/campaigns/${id}/${action}`, {});
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('campaigns.error.action'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title={t('campaigns.title')} description={t('campaigns.description')} />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <p className="text-muted-foreground text-sm">{t('campaigns.loading')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('campaigns.col.code')}</TableHead>
              <TableHead>{t('campaigns.col.title')}</TableHead>
              <TableHead>{t('campaigns.col.status')}</TableHead>
              <TableHead>{t('campaigns.col.window')}</TableHead>
              <TableHead>{t('campaigns.col.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm">{row.code}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(row.opensAt).toLocaleString()} → {new Date(row.closesAt).toLocaleString()}
                </TableCell>
                <TableCell className="space-x-2">
                  {row.status === 'draft' ? (
                    <Button
                      size="sm"
                      disabled={busyId === row.id}
                      onClick={() => void runAction(row.id, 'publish')}
                    >
                      {t('campaigns.action.publish')}
                    </Button>
                  ) : null}
                  {row.status === 'published' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busyId === row.id}
                      onClick={() => void runAction(row.id, 'close-bids')}
                    >
                      {t('campaigns.action.closeBids')}
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-sm">
                  {t('campaigns.empty')}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default CampaignsPage;
