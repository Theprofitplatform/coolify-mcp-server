/**
 * Create API Token Tool
 * Creates a new API token for programmatic access
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const CreateApiTokenSchema = z.object({
  name: z.string().describe('Name/description for the API token'),
  expires_at: z.string().optional().describe('Expiration date (ISO 8601 format, optional)'),
  permissions: z.array(z.string()).optional().describe('Permissions for the token (optional)'),
});

export class CreateApiTokenTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'create_api_token';
  }

  get description(): string {
    return 'Create a new API token for programmatic access to Coolify. IMPORTANT: Save the token value immediately as it will not be shown again.';
  }

  get inputSchema(): z.ZodSchema {
    return CreateApiTokenSchema;
  }

  async execute(args: z.infer<typeof CreateApiTokenSchema>): Promise<string> {
    this.logger.info(`Creating API token: ${args.name}`);

    try {
      const result = await this.apiPost('/api-tokens', args);

      this.logger.info(`Successfully created API token: ${args.name}`);
      this.logger.warn('IMPORTANT: Save the token value now - it will not be shown again!');

      return this.formatResponse(result);
    } catch (error: any) {
      this.logger.error(`Failed to create API token ${args.name}`, error);
      throw new Error(`Failed to create API token: ${error.message}`);
    }
  }
}
