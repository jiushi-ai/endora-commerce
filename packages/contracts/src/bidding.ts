import { z } from 'zod';
import { uuidSchema, isoDateTimeSchema } from './common.js';
import { twoDecimalAmountString, fourDecimalUnitPriceString } from './money-input.js';
import { dataEnvelope, collectionEnvelope } from './envelopes.js';

/**
 * Bidding (`specs/165-mobii-bidding/`) — scarce-stock campaigns and sealed
 * bid receipts. Zod shapes for Admin + Storefront HTTP APIs (Batch D).
 */

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

export const BIDDING_CAMPAIGN_STATUSES = [
  'draft',
  'published',
  'closed_for_bids',
  'allocated',
  'closed',
  'cancelled',
] as const;
export const biddingCampaignStatusSchema = z.enum(BIDDING_CAMPAIGN_STATUSES);
export type BiddingCampaignStatus = z.infer<typeof biddingCampaignStatusSchema>;

export const BIDDING_RECEIPT_STATUSES = [
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
export const biddingReceiptStatusSchema = z.enum(BIDDING_RECEIPT_STATUSES);
export type BiddingReceiptStatus = z.infer<typeof biddingReceiptStatusSchema>;

export const BIDDING_APPROVAL_STEPS = ['ops', 'sales', 'legal', 'finance_deposit'] as const;
export const biddingApprovalStepSchema = z.enum(BIDDING_APPROVAL_STEPS);
export type BiddingApprovalStep = z.infer<typeof biddingApprovalStepSchema>;

export const BIDDING_APPROVAL_DECISIONS = ['approve', 'reject'] as const;
export const biddingApprovalDecisionSchema = z.enum(BIDDING_APPROVAL_DECISIONS);
export type BiddingApprovalDecision = z.infer<typeof biddingApprovalDecisionSchema>;

export const BIDDING_ALLOCATION_OUTCOMES = ['won', 'lost', 'waitlist'] as const;
export const biddingAllocationOutcomeSchema = z.enum(BIDDING_ALLOCATION_OUTCOMES);
export type BiddingAllocationOutcome = z.infer<typeof biddingAllocationOutcomeSchema>;

export const BIDDING_TITLE_MAX = 200;
export const BIDDING_CODE_MAX = 64;
export const BIDDING_NOTE_MAX = 2000;

const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, 'Currency must be an ISO 4217 code, e.g. PLN');

const amountSchema = twoDecimalAmountString(z.string().trim(), {
  pattern: /^\d{1,16}(\.\d+)?$/,
  message: 'Amount must be a non-negative decimal with at most two places',
});

const unitPriceSchema = fourDecimalUnitPriceString(z.string().trim(), {
  pattern: /^\d{1,16}(\.\d+)?$/,
  message: 'Unit price must be a non-negative decimal with at most four places',
});

const qtySchema = z.number().int().positive();

// ---------------------------------------------------------------------------
// Error codes (manifest + ERROR_CODES)
// ---------------------------------------------------------------------------

export const BIDDING_ERROR_CODES = [
  'BIDDING_CAMPAIGN_NOT_FOUND',
  'BIDDING_RECEIPT_NOT_FOUND',
  'BIDDING_NOT_ELIGIBLE',
  'BIDDING_CLOSED',
  'BIDDING_ATTACHMENT_REQUIRED',
  'BIDDING_STEP_REQUIRED',
  'BIDDING_DEPOSIT_REQUIRED',
  'BIDDING_SHIP_CHECKLIST_FAILED',
  'BIDDING_INVALID_TRANSITION',
  'BIDDING_ALREADY_SUBMITTED',
  'BIDDING_RULE_REQUIRED',
  'BIDDING_CODE_CONFLICT',
] as const;
export type BiddingErrorCode = (typeof BIDDING_ERROR_CODES)[number];

// ---------------------------------------------------------------------------
// Rule version / campaign shapes
// ---------------------------------------------------------------------------

export const biddingRuleSnapshotSchema = z.object({
  minUnitPrice: unitPriceSchema,
  currency: currencyCodeSchema,
  maxQtyPerOrg: qtySchema,
  minQty: z.number().int().positive().default(1),
  depositPercent: z.number().min(0).max(100).nullable().optional(),
  depositAmount: amountSchema.nullable().optional(),
  payloadJson: z.record(z.string(), z.unknown()).optional(),
});
export type BiddingRuleSnapshot = z.infer<typeof biddingRuleSnapshotSchema>;

export const biddingAudienceSchema = z.object({
  organizationIds: z.array(uuidSchema).default([]),
  customerGroupIds: z.array(uuidSchema).default([]),
});
export type BiddingAudience = z.infer<typeof biddingAudienceSchema>;

export const createBiddingCampaignRequestSchema = z.object({
  code: z.string().trim().min(1).max(BIDDING_CODE_MAX),
  title: z.string().trim().min(1).max(BIDDING_TITLE_MAX),
  productVariantId: uuidSchema,
  qty: qtySchema,
  salesChannelId: uuidSchema,
  audience: biddingAudienceSchema.default({ organizationIds: [], customerGroupIds: [] }),
  opensAt: isoDateTimeSchema,
  closesAt: isoDateTimeSchema,
  intentTemplateAssetId: uuidSchema.nullable().optional(),
  rules: biddingRuleSnapshotSchema,
});
export type CreateBiddingCampaignRequest = z.infer<typeof createBiddingCampaignRequestSchema>;

export const updateBiddingCampaignRequestSchema = createBiddingCampaignRequestSchema.partial();
export type UpdateBiddingCampaignRequest = z.infer<typeof updateBiddingCampaignRequestSchema>;

export const biddingCampaignSchema = z.object({
  id: uuidSchema,
  code: z.string(),
  title: z.string(),
  status: biddingCampaignStatusSchema,
  productVariantId: uuidSchema,
  qty: z.number().int().positive(),
  salesChannelId: uuidSchema,
  audience: biddingAudienceSchema,
  opensAt: isoDateTimeSchema,
  closesAt: isoDateTimeSchema,
  currentRuleVersionId: uuidSchema.nullable(),
  intentTemplateAssetId: uuidSchema.nullable(),
  createdByAdminUserId: uuidSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type BiddingCampaign = z.infer<typeof biddingCampaignSchema>;

export const biddingRuleVersionSchema = z.object({
  id: uuidSchema,
  campaignId: uuidSchema,
  version: z.number().int().positive(),
  minUnitPrice: z.string(),
  currency: currencyCodeSchema,
  maxQtyPerOrg: z.number().int().positive(),
  minQty: z.number().int().positive(),
  depositPercent: z.number().nullable(),
  depositAmount: z.string().nullable(),
  payloadJson: z.record(z.string(), z.unknown()),
  createdAt: isoDateTimeSchema,
});
export type BiddingRuleVersion = z.infer<typeof biddingRuleVersionSchema>;

// ---------------------------------------------------------------------------
// Receipts
// ---------------------------------------------------------------------------

export const submitBidReceiptRequestSchema = z.object({
  bidUnitPrice: unitPriceSchema,
  bidQty: qtySchema,
  attachmentAssetIds: z.array(uuidSchema).min(1),
});
export type SubmitBidReceiptRequest = z.infer<typeof submitBidReceiptRequestSchema>;

export const biddingReceiptSchema = z.object({
  id: uuidSchema,
  campaignId: uuidSchema,
  organizationId: uuidSchema,
  ruleVersionId: uuidSchema,
  status: biddingReceiptStatusSchema,
  bidUnitPrice: z.string().nullable(),
  bidQty: z.number().int().nullable(),
  attachmentAssetIds: z.array(uuidSchema),
  tradeId: z.string().nullable(),
  orderId: uuidSchema.nullable(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type BiddingReceipt = z.infer<typeof biddingReceiptSchema>;

/** One intent PDF (or other asset) on an admin receipt row. */
export const biddingReceiptAttachmentSchema = z.object({
  id: uuidSchema,
  filename: z.string(),
  url: z.string().nullable(),
});
export type BiddingReceiptAttachment = z.infer<typeof biddingReceiptAttachmentSchema>;

/** Admin desk view — peer prices visible after close_for_bids / allocate. */
export const biddingReceiptAdminSchema = biddingReceiptSchema.extend({
  campaignCode: z.string().optional(),
  campaignTitle: z.string().optional(),
  organizationName: z.string().nullable().optional(),
  attachments: z.array(biddingReceiptAttachmentSchema).optional(),
});
export type BiddingReceiptAdmin = z.infer<typeof biddingReceiptAdminSchema>;

export const approveBidReceiptRequestSchema = z.object({
  step: biddingApprovalStepSchema,
  note: z.string().max(BIDDING_NOTE_MAX).optional(),
});
export type ApproveBidReceiptRequest = z.infer<typeof approveBidReceiptRequestSchema>;

export const rejectBidReceiptRequestSchema = z.object({
  step: biddingApprovalStepSchema,
  note: z.string().max(BIDDING_NOTE_MAX).optional(),
});
export type RejectBidReceiptRequest = z.infer<typeof rejectBidReceiptRequestSchema>;

export const allocateCampaignRequestSchema = z.object({
  results: z
    .array(
      z.object({
        receiptId: uuidSchema,
        outcome: biddingAllocationOutcomeSchema,
        allocatedQty: z.number().int().nonnegative().default(0),
      }),
    )
    .min(1),
});
export type AllocateCampaignRequest = z.infer<typeof allocateCampaignRequestSchema>;

export const biddingAllocationResultSchema = z.object({
  id: uuidSchema,
  campaignId: uuidSchema,
  receiptId: uuidSchema,
  outcome: biddingAllocationOutcomeSchema,
  allocatedQty: z.number().int().nonnegative(),
  decidedByAdminUserId: uuidSchema,
  decidedAt: isoDateTimeSchema,
});
export type BiddingAllocationResult = z.infer<typeof biddingAllocationResultSchema>;

// ---------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------

export const biddingCampaignEnvelopeSchema = dataEnvelope(biddingCampaignSchema);
export const biddingCampaignListEnvelopeSchema = collectionEnvelope(biddingCampaignSchema);
export const biddingReceiptEnvelopeSchema = dataEnvelope(biddingReceiptSchema);
export const biddingReceiptListEnvelopeSchema = collectionEnvelope(biddingReceiptAdminSchema);

// ---------------------------------------------------------------------------
// Fulfilment gate port (Batch E wires shipment; declared for composition)
// ---------------------------------------------------------------------------

/**
 * Container name: `biddingFulfilmentGatePort`. Owner: `bidding`.
 * Shipment create asks this when an order carries a bidding trade id.
 */
export interface BiddingFulfilmentGatePort {
  assertShipAllowed(orderId: string): Promise<void>;
}
