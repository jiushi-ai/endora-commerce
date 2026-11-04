import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { AssetFieldPicker } from '@endora-commerce/admin-kit/components';
import { useTranslation } from '@endora-commerce/admin-kit/i18n';
import type { BiddingCampaignDetail } from '@endora-commerce/contracts';

type SalesChannelRow = { id: string; code: string };
type ProductOption = { id: string; sku: string; name: string; type: string };

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function productLabel(p: ProductOption): string {
  return `${p.sku} — ${p.name} (${p.type})`;
}

/**
 * Campaign detail — draft editable; published and later statuses are read-only.
 */
export function CampaignDetailPage(): ReactNode {
  const t = useTranslation('bidding');
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BiddingCampaignDetail | null>(null);
  const [channels, setChannels] = useState<SalesChannelRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [productVariantId, setProductVariantId] = useState('');
  const [salesChannelId, setSalesChannelId] = useState('');
  const [qty, setQty] = useState('1');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [minUnitPrice, setMinUnitPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [maxQtyPerOrg, setMaxQtyPerOrg] = useState('1');
  const [depositPercent, setDepositPercent] = useState('');
  const [intentTemplateAssetId, setIntentTemplateAssetId] = useState('');

  const editable = detail?.campaign.status === 'draft';

  const applyDetail = useCallback((payload: BiddingCampaignDetail): void => {
    setDetail(payload);
    const c = payload.campaign;
    const r = payload.rules;
    setCode(c.code);
    setTitle(c.title);
    setProductVariantId(c.productVariantId);
    setSalesChannelId(c.salesChannelId);
    setQty(String(c.qty));
    setOpensAt(toLocalInputValue(c.opensAt));
    setClosesAt(toLocalInputValue(c.closesAt));
    setIntentTemplateAssetId(c.intentTemplateAssetId ?? '');
    setMinUnitPrice(r?.minUnitPrice ?? '');
    setCurrency(r?.currency ?? 'USD');
    setMaxQtyPerOrg(String(r?.maxQtyPerOrg ?? 1));
    setDepositPercent(r?.depositPercent != null ? String(r.depositPercent) : '');
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: BiddingCampaignDetail }>(
        `/api/v1/admin/bidding/campaigns/${id}`,
      );
      applyDetail(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('campaigns.detail.errorLoad'));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id, applyDetail, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.get<{ items: SalesChannelRow[] }>(
          '/api/v1/admin/sales-channels?activeOnly=true&pageSize=50',
        );
        setChannels(res.items ?? []);
      } catch {
        setChannels([]);
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
        setProducts(
          (res.data ?? []).map((p) => {
            const name =
              typeof p.name === 'string'
                ? p.name
                : (p.name['en-US'] ?? p.name['zh-CN'] ?? Object.values(p.name)[0] ?? p.sku);
            return { id: p.id, sku: p.sku, name, type: p.type };
          }),
        );
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  const onSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editable || !id) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.patch(`/api/v1/admin/bidding/campaigns/${id}`, {
        code: code.trim(),
        title: title.trim(),
        productVariantId: productVariantId.trim(),
        qty: Number(qty),
        salesChannelId: salesChannelId.trim(),
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
        intentTemplateAssetId: intentTemplateAssetId.trim() || null,
        rules: {
          minUnitPrice: minUnitPrice.trim(),
          currency: currency.trim().toUpperCase(),
          maxQtyPerOrg: Number(maxQtyPerOrg),
          minQty: 1,
          depositPercent: depositPercent.trim() === '' ? null : Number(depositPercent),
          depositAmount: null,
        },
      });
      // Success → list (same as create). Failure stays here with the error alert.
      navigate('/bidding/campaigns');
    } catch (err) {
      setError(err instanceof ApiError ? err.envelope.error.message : t('campaigns.detail.errorSave'));
      setSaving(false);
    }
  };

  const channelLabel =
    channels.find((c) => c.id === salesChannelId)?.code ?? salesChannelId.slice(0, 8) + '…';
  const productOpt = products.find((p) => p.id === productVariantId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={detail ? detail.campaign.code : t('campaigns.detail.title')}
        description={
          detail
            ? t('campaigns.detail.description', {
                status: t(`campaigns.status.${detail.campaign.status}`),
              })
            : t('campaigns.detail.hint')
        }
        back={{ label: t('campaigns.detail.back'), to: '/bidding/campaigns' }}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {!editable && detail ? (
        <Alert>
          <AlertDescription>{t('campaigns.detail.readOnlyNotice')}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <p className="text-muted-foreground text-sm">{t('campaigns.loading')}</p>
      ) : detail ? (
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={(ev) => void onSave(ev)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bid-code">{t('campaigns.create.code')}</Label>
                  <Input
                    id="bid-code"
                    required
                    value={code}
                    disabled={!editable || saving}
                    onChange={(ev) => setCode(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-title">{t('campaigns.create.titleField')}</Label>
                  <Input
                    id="bid-title"
                    required
                    value={title}
                    disabled={!editable || saving}
                    onChange={(ev) => setTitle(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-status">{t('campaigns.col.status')}</Label>
                  <Input
                    id="bid-status"
                    value={t(`campaigns.status.${detail.campaign.status}`)}
                    disabled
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-product">{t('campaigns.create.productVariantId')}</Label>
                  {editable ? (
                    <Select
                      id="bid-product"
                      required
                      value={productVariantId}
                      disabled={saving || products.length === 0}
                      onChange={(ev) => setProductVariantId(ev.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {productLabel(p)}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id="bid-product"
                      value={
                        productOpt
                          ? productLabel(productOpt)
                          : `${productVariantId.slice(0, 8)}…`
                      }
                      disabled
                      readOnly
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-channel">{t('campaigns.create.salesChannelId')}</Label>
                  {editable ? (
                    <Select
                      id="bid-channel"
                      required
                      value={salesChannelId}
                      disabled={saving || channels.length === 0}
                      onChange={(ev) => setSalesChannelId(ev.target.value)}
                    >
                      {channels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input id="bid-channel" value={channelLabel} disabled readOnly />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-qty">{t('campaigns.create.qty')}</Label>
                  <Input
                    id="bid-qty"
                    type="number"
                    min={1}
                    required
                    value={qty}
                    disabled={!editable || saving}
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
                    disabled={!editable || saving}
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
                    disabled={!editable || saving}
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
                    disabled={!editable || saving}
                    onChange={(ev) => setClosesAt(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-min">{t('campaigns.create.minUnitPrice')}</Label>
                  <Input
                    id="bid-min"
                    required
                    value={minUnitPrice}
                    disabled={!editable || saving}
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
                    disabled={!editable || saving}
                    onChange={(ev) => setCurrency(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid-deposit">{t('campaigns.detail.depositPercent')}</Label>
                  <Input
                    id="bid-deposit"
                    type="number"
                    min={0}
                    max={100}
                    value={depositPercent}
                    disabled={!editable || saving}
                    onChange={(ev) => setDepositPercent(ev.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bid-template">{t('campaigns.create.intentTemplate')}</Label>
                  <AssetFieldPicker
                    id="bid-template"
                    value={intentTemplateAssetId}
                    onChange={setIntentTemplateAssetId}
                    allowUpload={editable}
                    disabled={!editable || saving}
                    placeholder={t('campaigns.create.intentTemplatePlaceholder')}
                    chooseLabel={t('campaigns.create.intentTemplateChoose')}
                    changeLabel={t('campaigns.create.intentTemplateChange')}
                    clearLabel={t('campaigns.create.intentTemplateClear')}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editable ? (
                  <Button type="submit" disabled={saving || !productVariantId || !salesChannelId}>
                    {saving ? t('campaigns.detail.saving') : t('campaigns.detail.save')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/bidding/campaigns')}
                >
                  {t('campaigns.detail.back')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default CampaignDetailPage;
