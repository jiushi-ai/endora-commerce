import type { EntityManager } from '@mikro-orm/postgresql';
import {
  ERROR_CODES,
  type AssetsLibraryPort,
} from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import { BiddingCampaign } from '../entities/bidding-campaign.entity.js';

const PDF_MIME = 'application/pdf';
/** Upper bound on a sealed intent PDF (20 MiB). */
export const BIDDING_INTENT_ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;

export interface UploadedIntentFile {
  filename: string;
  declaredMime: string;
  bytes: Uint8Array;
}

export interface IntentAttachmentUploadResult {
  id: string;
  filename: string;
}

/**
 * Storefront upload of a signed intent PDF for a campaign (G-C3).
 * Uses `assetsLibraryPort` so size/type/storage stay with the library.
 */
export class BiddingIntentAttachmentUploadService {
  constructor(
    private readonly emFactory: () => EntityManager,
    private readonly assetsLibrary: AssetsLibraryPort,
  ) {}

  async assertCampaignOpen(campaignId: string, organizationId: string): Promise<BiddingCampaign> {
    const em = this.emFactory();
    const campaign = await em.findOne(BiddingCampaign, { id: campaignId });
    if (!campaign) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    if (campaign.status !== 'published') {
      throw new HttpError(409, ERROR_CODES.BIDDING_CLOSED, 'Campaign is not open for bids.');
    }
    const orgIds = campaign.audience?.organizationIds ?? [];
    if (orgIds.length > 0 && !orgIds.includes(organizationId)) {
      throw new HttpError(403, ERROR_CODES.BIDDING_NOT_ELIGIBLE, 'Organization is not eligible.');
    }
    const now = Date.now();
    if (now < new Date(campaign.opensAt).getTime() || now > new Date(campaign.closesAt).getTime()) {
      throw new HttpError(409, ERROR_CODES.BIDDING_CLOSED, 'Campaign bid window is closed.');
    }
    return campaign;
  }

  async upload(
    campaignId: string,
    organizationId: string,
    file: UploadedIntentFile,
  ): Promise<IntentAttachmentUploadResult> {
    await this.assertCampaignOpen(campaignId, organizationId);

    const name = file.filename.toLowerCase();
    const mime = (file.declaredMime || '').toLowerCase();
    if (!name.endsWith('.pdf') && mime !== PDF_MIME) {
      throw new HttpError(
        400,
        ERROR_CODES.VALIDATION_FAILED,
        'Intent attachment must be a PDF file.',
      );
    }
    if (file.bytes.byteLength > BIDDING_INTENT_ATTACHMENT_MAX_BYTES) {
      throw new HttpError(
        413,
        ERROR_CODES.VALIDATION_FAILED,
        'Intent attachment is too large (max 20 MB).',
      );
    }

    const { bytes } = file;
    const asset = await this.assetsLibrary.upload({
      filename: file.filename || 'intent.pdf',
      declaredMime: mime || PDF_MIME,
      stream: (async function* () {
        yield bytes;
      })(),
      declaredSize: bytes.byteLength,
      folderId: null,
      label: `Bidding intent · ${campaignId.slice(0, 8)}`,
      visibility: 'private',
    });

    return { id: asset.id, filename: asset.filename ?? file.filename };
  }

  async resolveTemplateDownload(
    campaignId: string,
    organizationId: string,
  ): Promise<{ url: string; filename: string } | null> {
    const campaign = await this.assertCampaignReachable(campaignId, organizationId);
    const assetId = campaign.intentTemplateAssetId;
    if (!assetId) return null;
    const asset = await this.assetsLibrary.getAsset(assetId);
    return { url: asset.url, filename: asset.filename ?? 'intent-template.pdf' };
  }

  private async assertCampaignReachable(
    campaignId: string,
    organizationId: string,
  ): Promise<BiddingCampaign> {
    const em = this.emFactory();
    const campaign = await em.findOne(BiddingCampaign, { id: campaignId });
    if (!campaign) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    const orgIds = campaign.audience?.organizationIds ?? [];
    if (orgIds.length > 0 && !orgIds.includes(organizationId)) {
      throw new HttpError(403, ERROR_CODES.BIDDING_NOT_ELIGIBLE, 'Organization is not eligible.');
    }
    if (!['published', 'closed_for_bids', 'allocated', 'closed'].includes(campaign.status)) {
      throw new HttpError(404, ERROR_CODES.BIDDING_CAMPAIGN_NOT_FOUND, 'Campaign not found.');
    }
    return campaign;
  }
}
