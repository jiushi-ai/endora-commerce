import multipart from '@fastify/multipart';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODES } from '@endora-commerce/contracts';
import { HttpError } from '@endora-commerce/platform/http';
import {
  BiddingIntentAttachmentUploadService,
  BIDDING_INTENT_ATTACHMENT_MAX_BYTES,
} from './services/intent-attachment-upload-service.js';

export interface IntentUploadRoutesDeps {
  uploadService: BiddingIntentAttachmentUploadService;
  requireCustomer: (req: FastifyRequest, reply: FastifyReply) => Promise<void> | void;
  resolveCustomerContext: (req: FastifyRequest) => { organizationId: string };
}

function noFile(): HttpError {
  return new HttpError(
    400,
    ERROR_CODES.VALIDATION_FAILED,
    'Send the PDF as the `file` part of a multipart/form-data request.',
  );
}

/**
 * Storefront intent template download + sealed PDF upload (Batch D G-C3 UI).
 */
export async function registerBiddingIntentUploadRoutes(
  app: FastifyInstance,
  deps: IntentUploadRoutesDeps,
): Promise<void> {
  const { requireCustomer, resolveCustomerContext, uploadService } = deps;

  app.get<{ Params: { id: string } }>(
    '/api/v1/bidding/campaigns/:id/intent-template',
    { preHandler: requireCustomer },
    async (request) => {
      const { organizationId } = resolveCustomerContext(request);
      const data = await uploadService.resolveTemplateDownload(request.params.id, organizationId);
      if (!data) {
        throw new HttpError(
          404,
          ERROR_CODES.BIDDING_ATTACHMENT_REQUIRED,
          'No intent template is attached to this campaign.',
        );
      }
      return { data };
    },
  );

  await app.register(async (upload) => {
    await upload.register(multipart, {
      limits: { files: 1, fields: 4, fileSize: BIDDING_INTENT_ATTACHMENT_MAX_BYTES },
    });

    upload.post<{ Params: { id: string } }>(
      '/api/v1/bidding/campaigns/:id/intent-attachments',
      { preHandler: requireCustomer },
      async (request, reply) => {
        if (!request.isMultipart()) throw noFile();
        const { organizationId } = resolveCustomerContext(request);
        await uploadService.assertCampaignOpen(request.params.id, organizationId);

        const file = await request.file();
        if (!file) throw noFile();
        let bytes: Buffer;
        try {
          bytes = await file.toBuffer();
        } catch (error) {
          if ((error as { code?: string }).code !== 'FST_REQ_FILE_TOO_LARGE') throw error;
          throw new HttpError(
            413,
            ERROR_CODES.VALIDATION_FAILED,
            'Intent attachment is too large (max 20 MB).',
          );
        }

        const data = await uploadService.upload(request.params.id, organizationId, {
          filename: file.filename || 'intent.pdf',
          declaredMime: file.mimetype || 'application/pdf',
          bytes,
        });
        reply.code(201);
        return { data };
      },
    );
  });
}
