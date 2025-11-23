/**
 * Update Webhook Tool
 * Updates an existing webhook configuration
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const UpdateWebhookSchema = z.object({
  uuid: z.string().describe('UUID of the webhook'),
  name: z.string().optional().describe('Name of the webhook'),
  url: z.string().url().optional().describe('Webhook URL'),
  events: z.array(z.string()).optional().describe('Events to trigger webhook'),
  enabled: z.boolean().optional().describe('Enable or disable the webhook'),
  secret: z.string().optional().describe('Secret for signature verification'),
});

export class UpdateWebhookTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'update_webhook';
  }

  get description(): string {
    return 'Update webhook configuration including URL, events, and enabled status.';
  }

  get inputSchema(): z.ZodSchema {
    return UpdateWebhookSchema;
  }

  async execute(args: z.infer<typeof UpdateWebhookSchema>): Promise<string> {
    const { uuid, ...updateData } = args;
    
    this.logger.info(`Updating webhook: ${uuid}`);

    try {
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      if (Object.keys(cleanData).length === 0) {
        return 'No update data provided. Please specify at least one field to update.';
      }

      const result = await this.apiPatch(`/webhooks/${uuid}`, cleanData);

      this.logger.info(`Successfully updated webhook: ${uuid}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to update webhook ${uuid}`, error);
      throw new Error(`Failed to update webhook: ${error.message}`);
    }
  }
}
