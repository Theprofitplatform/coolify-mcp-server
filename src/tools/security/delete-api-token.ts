/**
 * Delete API Token Tool
 * Revokes an API token
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteApiTokenSchema = z.object({
  uuid: z.string().describe('UUID of the API token to delete'),
});

export class DeleteApiTokenTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_api_token';
  }

  get description(): string {
    return 'Delete (revoke) an API token. This action is irreversible and will immediately invalidate the token.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteApiTokenSchema;
  }

  async execute(args: z.infer<typeof DeleteApiTokenSchema>): Promise<string> {
    this.logger.info(`Deleting API token: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for API token: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/api-tokens/${args.uuid}`);

      this.logger.info(`Successfully deleted API token: ${args.uuid}`);

      return this.formatResponse({
        message: 'API token revoked successfully',
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete API token ${args.uuid}`, error);
      throw new Error(`Failed to delete API token: ${error.message}`);
    }
  }
}
