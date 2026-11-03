import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, apiClient } from '@endora-commerce/admin-kit/lib';
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
} from '@endora-commerce/admin-kit/ui';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';

type SalesChannelRow = { id: string; code: string; systemDefault?: boolean };
type ProductOption = { id: string; sku: string; name: string; type: string };

function toLocalInputValue(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultWindow(): { opensAt: string; closesAt: string } {
  const opens = new Date();
  const closes = new Date(opens.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { opensAt: toLocalInputValue(opens), closesAt: toLocalInputValue(closes) };
}

function productLabel(p: ProductOption): string {
  return `${p.sku} — ${p.name} (${p.type})`;
}

/**
 * Dedicated create-draft campaign page (list → New → back), Batch D UI polish.
 */
export function CampaignCreatePage(): ReactNode {
  const t = useTranslation('bidding');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [channels, setChannels] = useState<SalesChannelRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const windowDefaults = defaultWindow();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [productVariantId, setProductVariantId] = useState('');
  const [salesChannelId, setSalesChannelId] = useState('');
  const [qty, setQty] = useState('1');
  const [opensAt, setOpensAt] = useState(windowDefaults.opensAt);
  const [closesAt, setClosesAt] = useState(windowDefaults.closesAt);
  const [minUnitPrice, setMinUnitPrice] = useState('100.00');
  const [currency, setCurrency] = useState('USD');
  const [maxQtyPerOrg, setMaxQtyPerOrg] = useState('1');

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<{ items: SalesChannelRow[] }>(
          '/api/v1/admin/sales-channels?activeOnly=true&pageSize=50',
        );
        const items = res.items ?? [];
        setChannels(items);
        const preferred =
          items.find((c) => c.code === 'default') ??
          items.find((c) => c.systemDefault) ??
          items[0];
        if (preferred) setSalesChannelId(preferred.id);
      } catch {
        // Operator can still fail create if channel missing.
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<{
          data: Array<{
            id: string;
            sku: string;
            type: string;
            name: Record<string, string> | string;
          }>;
        }>('/api/v1/admin/catalog/products?status=active&type=simple&pageSize=200');
        const opts: ProductOption[] = (res.data ?? []).map((p) => {
          const name =
            typeof p.name === 'string'
              ? p.name
              : (p.name['en-US'] ?? p.name['zh-CN'] ?? Object.values(p.name)[0] ?? p.sku);
          return { id: p.id, sku: p.sku, name, type: p.type };
        });
        setProducts(opts);
        if (opts[0] && !productVariantId) setProductVariantId(opts[0].id);
      } catch {
        setProducts([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const onCreate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiClient.post('/api/v1/admin/bidding/campaigns', {
        code: code.trim(),
        title: title.trim(),
        productVariantId: productVariantId.trim(),
        qty: Number(qty),
        salesChannelId: salesChannelId.trim(),
        audience: { organizationIds: [], customerGroupIds: [] },
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
        rules: {
          minUnitPrice: minUnitPrice.trim(),
          currency: currency.trim().toUpperCase(),
          maxQtyPerOrg: Number(maxQtyPerOrg),
          minQty: 1,
          depositPercent: 30,
          depositAmount: null,
        },
      });
      navigate('/bidding/campaigns');
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('campaigns.error.create'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('campaigns.create.title')}
        description={t('campaigns.create.hint')}
        back={{ label: t('campaigns.create.back'), to: '/bidding/campaigns' }}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={(ev) => void onCreate(ev)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bid-code">{t('campaigns.create.code')}</Label>
                <Input
                  id="bid-code"
                  required
                  value={code}
                  onChange={(ev) => setCode(ev.target.value)}
                  placeholder="H200-DEMO-003"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-title">{t('campaigns.create.titleField')}</Label>
                <Input
                  id="bid-title"
                  required
                  value={title}
                  onChange={(ev) => setTitle(ev.target.value)}
                  placeholder="H200 campaign"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-product">{t('campaigns.create.productVariantId')}</Label>
                <Select
                  id="bid-product"
                  required
                  value={productVariantId}
                  onChange={(ev) => setProductVariantId(ev.target.value)}
                  disabled={products.length === 0}
                >
                  {products.length === 0 ? (
                    <option value="">{t('campaigns.create.noProducts')}</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {productLabel(p)}
                      </option>
                    ))
                  )}
                </Select>
                <p className="text-muted-foreground text-xs">{t('campaigns.create.productHint')}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-channel">{t('campaigns.create.salesChannelId')}</Label>
                <Select
                  id="bid-channel"
                  required
                  value={salesChannelId}
                  onChange={(ev) => setSalesChannelId(ev.target.value)}
                  disabled={channels.length === 0}
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-qty">{t('campaigns.create.qty')}</Label>
                <Input
                  id="bid-qty"
                  type="number"
                  min={1}
                  required
                  value={qty}
                  onChange={(ev) => setQty(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-max">{t('campaigns.create.maxQtyPerOrg')}</Label>
                <Input
                  id="bid-max"
                  type="number"
                  min={1}
                  required
                  value={maxQtyPerOrg}
                  onChange={(ev) => setMaxQtyPerOrg(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-opens">{t('campaigns.create.opensAt')}</Label>
                <Input
                  id="bid-opens"
                  type="datetime-local"
                  required
                  value={opensAt}
                  onChange={(ev) => setOpensAt(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-closes">{t('campaigns.create.closesAt')}</Label>
                <Input
                  id="bid-closes"
                  type="datetime-local"
                  required
                  value={closesAt}
                  onChange={(ev) => setClosesAt(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-min">{t('campaigns.create.minUnitPrice')}</Label>
                <Input
                  id="bid-min"
                  required
                  value={minUnitPrice}
                  onChange={(ev) => setMinUnitPrice(ev.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bid-ccy">{t('campaigns.create.currency')}</Label>
                <Input
                  id="bid-ccy"
                  required
                  maxLength={3}
                  value={currency}
                  onChange={(ev) => setCurrency(ev.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={creating || !productVariantId || !salesChannelId}>
                {creating ? t('campaigns.create.submitting') : t('campaigns.create.submit')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/bidding/campaigns')}>
                {t('campaigns.create.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CampaignCreatePage;
