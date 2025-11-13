/**
 * List Servers Tool
 * Retrieves all servers registered in Coolify
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { ListServersSchema } from '../../schemas/server.schemas.js';

export class ListServersTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'list_servers';
  }

  get description(): string {
    return 'List all servers registered in your Coolify instance. Use this to get server UUIDs needed for other operations.';
  }

  get inputSchema(): z.ZodSchema {
    return ListServersSchema;
  }

  async execute(_args: z.infer<typeof ListServersSchema>): Promise<string> {
    this.logger.info('Fetching all servers');

    const servers = await this.apiGet('/servers');

    if (!Array.isArray(servers) || servers.length === 0) {
      return 'No servers found.';
    }

    this.logger.info(`Found ${servers.length} server(s)`);

    return this.formatResponse(servers);
  }
}
