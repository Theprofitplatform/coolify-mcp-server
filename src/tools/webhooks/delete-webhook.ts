/**
 * Delete Webhook Tool
 * Deletes a webhook
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteWebhookSchema = z.object({
  uuid: z.string().describe('UUID of the webhook to delete'),
});

export class DeleteWebhookTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_webhook';
  }

  get description(): string {
    return 'Delete a webhook. This action is irreversible.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteWebhookSchema;
  }

  async execute(args: z.infer<typeof DeleteWebhookSchema>): Promise<string> {
    this.logger.info(`Deleting webhook: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for webhook: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/webhooks/${args.uuid}`);

      this.logger.info(`Successfully deleted webhook: ${args.uuid}`);

      return this.formatResponse({
        message: 'Webhook deleted successfully',
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete webhook ${args.uuid}`, error);
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }
}
