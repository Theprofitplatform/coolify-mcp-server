/**
 * Create Webhook Tool
 * Creates a new webhook for resource events
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CreateWebhookSchema = z.object({
  name: z.string().describe('Name of the webhook'),
  url: z.string().url().describe('Webhook URL to call'),
  resource_type: z.enum(['application', 'database', 'service']).describe('Type of resource to monitor'),
  resource_uuid: z.string().describe('UUID of the resource to monitor'),
  events: z.array(z.string()).describe('Events to trigger webhook (e.g., ["deployment_started", "deployment_finished"])'),
  secret: z.string().optional().describe('Secret for webhook signature verification'),
});

export class CreateWebhookTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_webhook';
  }

  get description(): string {
    return 'Create a new webhook to receive notifications about resource events (deployments, status changes, etc).';
  }

  get inputSchema(): z.ZodSchema {
    return CreateWebhookSchema;
  }

  async execute(args: z.infer<typeof CreateWebhookSchema>): Promise<string> {
    this.logger.info(`Creating webhook: ${args.name}`);

    try {
      const result = await this.apiPost('/webhooks', args);

      this.logger.info(`Successfully created webhook: ${args.name}`);

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to create webhook ${args.name}`, error);
      throw new Error(`Failed to create webhook: ${error.message}`);
    }
  }
}
