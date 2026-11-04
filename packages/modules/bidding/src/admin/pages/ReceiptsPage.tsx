import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
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
import type { BiddingReceiptAdmin } from '@endora-commerce/contracts';

const STATUS_OPTIONS = [
  '',
  'submitted',
  'ops_review',
  'sales_review',
  'legal_review',
  'await_deposit',
  'deposit_confirmed',
  'won_pending_fulfilment',
  'converted',
  'rejected',
  'withdrawn',
  'lost',
  'expired',
] as const;

const PAGE_SIZES: readonly PageSizeOption[] = [10, 20, 50];

/**
 * Admin receipt review desk — readable campaign/org labels + attachment links.
 */
export function ReceiptsPage(): ReactNode {
  const t = useTranslation('bidding');
  const [rows, setRows] = useState<BiddingReceiptAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const { pageSize: preferredPageSize, setPageSize } = usePageSizePreference('bidding-receipts-list');
  const pageSize: PageSizeOption = PAGE_SIZES.includes(preferredPageSize) ? preferredPageSize : 20;

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status && row.status !== status) return false;
      if (!q) return true;
      return (
        row.id.toLowerCase().includes(q) ||
        row.campaignId.toLowerCase().includes(q) ||
        (row.campaignCode?.toLowerCase().includes(q) ?? false) ||
        (row.campaignTitle?.toLowerCase().includes(q) ?? false) ||
        row.organizationId.toLowerCase().includes(q) ||
        (row.organizationName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, search, status]);

  const total = filtered.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const pageRows = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [search, status, pageSize]);

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

  const confirmDeposit = async (row: BiddingReceiptAdmin): Promise<void> => {
    const expected = row.expectedDepositAmount ?? '0.00';
    const currency = row.expectedDepositCurrency ?? '';
    const entered = window.prompt(
      t('receipts.action.depositPrompt', { expected, currency }),
      expected,
    );
    if (entered == null) return;
    const amountReceived = entered.trim();
    if (!amountReceived) {
      setError(t('receipts.action.depositMissingAmount'));
      return;
    }
    setBusyId(row.id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/receipts/${row.id}/confirm-deposit`, {
        amountReceived,
      });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('receipts.error.action'));
    } finally {
      setBusyId(null);
    }
  };

  const allocateOne = async (
    row: BiddingReceiptAdmin,
    outcome: 'won' | 'lost',
  ): Promise<void> => {
    setBusyId(row.id);
    setError(null);
    try {
      await apiClient.post(`/api/v1/admin/bidding/campaigns/${row.campaignId}/allocate`, {
        results: [
          {
            receiptId: row.id,
            outcome,
            allocatedQty: outcome === 'won' ? (row.bidQty ?? 0) : 0,
          },
        ],
      });
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

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="receipt-search">{t('receipts.filter.search')}</Label>
              <Input
                id="receipt-search"
                type="search"
                value={search}
                placeholder={t('receipts.filter.searchPlaceholder')}
                onChange={(ev) => setSearch(ev.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="receipt-status">{t('receipts.filter.status')}</Label>
              <Select
                id="receipt-status"
                value={status}
                onChange={(ev) => setStatus(ev.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s || 'all'} value={s}>
                    {s ? t(`receipts.status.${s}`) : t('receipts.filter.statusAll')}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">{t('receipts.loading')}</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('receipts.col.id')}</TableHead>
                    <TableHead>{t('receipts.col.campaign')}</TableHead>
                    <TableHead>{t('receipts.col.org')}</TableHead>
                    <TableHead>{t('receipts.col.status')}</TableHead>
                    <TableHead>{t('receipts.col.bid')}</TableHead>
                    <TableHead>{t('receipts.col.tradeId')}</TableHead>
                    <TableHead>{t('receipts.col.attachment')}</TableHead>
                    <TableHead>{t('receipts.col.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((row) => {
                    const primary = row.attachments?.[0];
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.id.slice(0, 8)}…</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {row.campaignTitle ?? row.campaignId.slice(0, 8) + '…'}
                          </div>
                          {row.campaignCode ? (
                            <div className="text-muted-foreground font-mono text-xs">
                              {row.campaignCode}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-sm">
                          {row.organizationName ?? `${row.organizationId.slice(0, 8)}…`}
                        </TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell className="text-sm">
                          {row.bidUnitPrice ?? '—'} × {row.bidQty ?? '—'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {row.tradeId ?? '—'}
                          {row.orderId ? (
                            <div className="text-muted-foreground" title={row.orderId}>
                              ord {row.orderId.slice(0, 8)}…
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="space-x-2 whitespace-nowrap">
                          {primary?.url ? (
                            <>
                              <a
                                href={primary.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-sm underline-offset-4 hover:underline"
                              >
                                {t('receipts.action.preview')}
                              </a>
                              <a
                                href={
                                  primary.url.includes('download=')
                                    ? primary.url
                                    : `${primary.url}${primary.url.includes('?') ? '&' : '?'}download=1`
                                }
                                download={primary.filename}
                                className="text-primary text-sm underline-offset-4 hover:underline"
                              >
                                {t('receipts.action.download')}
                              </a>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="space-x-2">
                          {row.status === 'submitted' || row.status === 'ops_review' ? (
                            <Button
                              size="sm"
                              disabled={busyId === row.id}
                              onClick={() => void approve(row.id, 'ops')}
                              title={t('receipts.action.opsHint')}
                            >
                              {t('receipts.action.ops')}
                            </Button>
                          ) : null}
                          {row.status === 'sales_review' ? (
                            <Button
                              size="sm"
                              disabled={busyId === row.id}
                              onClick={() => void approve(row.id, 'sales')}
                              title={t('receipts.action.salesHint')}
                            >
                              {t('receipts.action.sales')}
                            </Button>
                          ) : null}
                          {row.status === 'await_deposit' || row.status === 'deposit_confirmed' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === row.id}
                                onClick={() => void allocateOne(row, 'won')}
                                title={t('receipts.action.wonHint')}
                              >
                                {t('receipts.action.won')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === row.id}
                                onClick={() => void allocateOne(row, 'lost')}
                                title={t('receipts.action.lostHint')}
                              >
                                {t('receipts.action.lost')}
                              </Button>
                            </>
                          ) : null}
                          {row.status === 'await_deposit' ? (
                            <Button
                              size="sm"
                              disabled={busyId === row.id}
                              onClick={() => void confirmDeposit(row)}
                              title={t('receipts.action.depositHint')}
                            >
                              {t('receipts.action.deposit')}
                            </Button>
                          ) : null}
                          {row.status === 'deposit_confirmed' ||
                          row.status === 'won_pending_fulfilment' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === row.id}
                              onClick={() => void convert(row.id)}
                              title={t('receipts.action.convertHint')}
                            >
                              {t('receipts.action.convert')}
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pageRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground text-sm">
                        {t('receipts.empty')}
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

export default ReceiptsPage;
