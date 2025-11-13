/**
 * Get Server Resources Tool
 * Retrieves CPU, memory, and disk usage for a server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetServerResourcesSchema } from '../../schemas/server.schemas.js';

export class GetServerResourcesTool extends BaseTool {
  get name(): string {
    return 'get_server_resources';
  }

  get description(): string {
    return 'Get resource usage (CPU, memory, disk) for a specific server. Useful for monitoring server health and capacity planning.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerResourcesSchema;
  }

  async execute(args: z.infer<typeof GetServerResourcesSchema>): Promise<string> {
    this.logger.info(`Fetching resources for server: ${args.server_uuid}`);

    const resources = await this.apiGet(`/servers/${args.server_uuid}/resources`);

    return this.formatResponse(resources);
  }
}
