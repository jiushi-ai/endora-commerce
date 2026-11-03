import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError, apiClient, usePageSizePreference, type PageSizeOption } from '@endora-commerce/admin-kit/lib';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@endora-commerce/admin-kit/ui';
import { PaginationFooter } from '@endora-commerce/admin-kit/components';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import type { BiddingCampaign } from '@endora-commerce/contracts';

const STATUS_OPTIONS = [
  '',
  'draft',
  'published',
  'closed_for_bids',
  'allocated',
  'closed',
  'cancelled',
] as const;

const PAGE_SIZES: readonly PageSizeOption[] = [10, 20, 50];

/**
 * Admin campaign list — filters, pagination, New → create page (Batch D UI polish).
 */
export function CampaignsPage(): ReactNode {
  const t = useTranslation('bidding');
  const [rows, setRows] = useState<BiddingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(0);
  const { pageSize: preferredPageSize, setPageSize } = usePageSizePreference('bidding-campaigns-list');
  const pageSize: PageSizeOption = PAGE_SIZES.includes(preferredPageSize)
    ? preferredPageSize
    : 20;

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (!q) return true;
      return row.code.toLowerCase().includes(q) || row.title.toLowerCase().includes(q);
    });
  }, [rows, search, status]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [search, status, pageSize]);

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

  const newCampaign = (
    <Button asChild>
      <Link to="/bidding/campaigns/new">
        <Plus className="size-4" />
        {t('campaigns.action.new')}
      </Link>
    </Button>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('campaigns.title')}
        description={t('campaigns.description')}
        actions={newCampaign}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="bid-search">{t('campaigns.filter.search')}</Label>
              <Input
                id="bid-search"
                type="search"
                value={search}
                placeholder={t('campaigns.filter.searchPlaceholder')}
                onChange={(ev) => setSearch(ev.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bid-status">{t('campaigns.filter.status')}</Label>
              <Select
                id="bid-status"
                value={status}
                onChange={(ev) => setStatus(ev.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s || 'all'} value={s}>
                    {s ? t(`campaigns.status.${s}`) : t('campaigns.filter.statusAll')}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">{t('campaigns.loading')}</p>
          ) : (
            <>
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
                  {pageRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">{row.code}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(row.opensAt).toLocaleString()} →{' '}
                        {new Date(row.closesAt).toLocaleString()}
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
                            variant="outline"
                            disabled={busyId === row.id}
                            onClick={() => void runAction(row.id, 'close-bids')}
                          >
                            {t('campaigns.action.closeBids')}
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pageRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-sm">
                        {t('campaigns.empty')}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              {total > 0 ? (
                <PaginationFooter
                  page={safePage}
                  pageSize={pageSize}
                  total={total}
                  pageSizes={PAGE_SIZES}
                  onPageSizeChange={(next) => {
                    setPageSize(next);
                    setPage(0);
                  }}
                  onPrev={() => setPage((p) => Math.max(0, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignsPage;
