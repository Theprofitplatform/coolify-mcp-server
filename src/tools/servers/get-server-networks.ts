/**
 * Get Server Networks Tool
 * Retrieves Docker networks configured on a server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServerNetworksSchema = z.object({
  uuid: z.string().describe('UUID of the server'),
});

export class GetServerNetworksTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_server_networks';
  }

  get description(): string {
    return 'Get all Docker networks configured on a server. Useful for troubleshooting network connectivity and container communication.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerNetworksSchema;
  }

  async execute(args: z.infer<typeof GetServerNetworksSchema>): Promise<string> {
    this.logger.info(`Fetching networks for server: ${args.uuid}`);

    try {
      const networks = await this.apiGet(`/servers/${args.uuid}/networks`);

      this.logger.info(`Successfully fetched networks for server: ${args.uuid}`);

      return this.formatResponse(networks);
    } catch (error: any) {
      this.logger.error(`Failed to fetch networks for server ${args.uuid}`, error);
      throw new Error(`Failed to get server networks: ${error.message}`);
    }
  }
}
