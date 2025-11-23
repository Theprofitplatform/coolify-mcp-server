/**
 * Get Server Tool
 * Retrieves detailed information about a specific server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServerSchema = z.object({
  uuid: z.string().describe('UUID of the server to retrieve'),
});

export class GetServerTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_server';
  }

  get description(): string {
    return 'Get detailed information about a specific server including configuration, status, and settings.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerSchema;
  }

  async execute(args: z.infer<typeof GetServerSchema>): Promise<string> {
    this.logger.info(`Fetching server details for: ${args.uuid}`);

    try {
      const server = await this.apiGet(`/servers/${args.uuid}`);

      if (!server) {
        return `Server not found: ${args.uuid}`;
      }

      this.logger.info(`Successfully fetched server: ${server.name || args.uuid}`);

      return this.formatResponse(server);
    } catch (error: any) {
      this.logger.error(`Failed to fetch server ${args.uuid}`, error);
      throw new Error(`Failed to get server: ${error.message}`);
    }
  }
}
