/**
 * List Webhooks Tool
 * Retrieves all webhooks configured in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const ListWebhooksSchema = z.object({
  resource_type: z.enum(['application', 'database', 'service', 'all']).optional().describe('Filter by resource type'),
});

export class ListWebhooksTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_webhooks';
  }

  get description(): string {
    return 'List all webhooks configured in Coolify. Webhooks allow external systems to be notified of events.';
  }

  get inputSchema(): z.ZodSchema {
    return ListWebhooksSchema;
  }

  async execute(args: z.infer<typeof ListWebhooksSchema>): Promise<string> {
    this.logger.info('Fetching webhooks');

    try {
      const queryParams = args.resource_type ? `?resource_type=${args.resource_type}` : '';
      const webhooks = await this.apiGet(`/webhooks${queryParams}`);

      this.logger.info('Successfully fetched webhooks');

      return this.formatResponse(webhooks);
    } catch (error: any) {
      this.logger.error('Failed to fetch webhooks', error);
      throw new Error(`Failed to list webhooks: ${error.message}`);
    }
  }
}
