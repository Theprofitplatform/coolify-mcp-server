/**
 * Delete Server Tool
 * Deletes a specific server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const DeleteServerSchema = z.object({
  uuid: z.string().describe('UUID of the server to delete'),
});

export class DeleteServerTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'delete_server';
  }

  get description(): string {
    return 'Delete a specific server. CAUTION: This action is irreversible and will remove the server from Coolify management.';
  }

  get inputSchema(): z.ZodSchema {
    return DeleteServerSchema;
  }

  async execute(args: z.infer<typeof DeleteServerSchema>): Promise<string> {
    this.logger.info(`Deleting server: ${args.uuid}`);
    this.logger.warn(`DELETE operation requested for server: ${args.uuid}`);

    try {
      const result = await this.apiDelete(`/servers/${args.uuid}`);

      this.logger.info(`Successfully deleted server: ${args.uuid}`);

      return this.formatResponse({
        message: 'Server deleted successfully',
        uuid: args.uuid,
        ...result
      });
    } catch (error: any) {
      this.logger.error(`Failed to delete server ${args.uuid}`, error);
      throw new Error(`Failed to delete server: ${error.message}`);
    }
  }
}
