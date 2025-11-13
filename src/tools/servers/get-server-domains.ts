/**
 * Get Server Domains Tool
 * Retrieves domains configured for a server
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';
import { GetServerDomainsSchema } from '../../schemas/server.schemas.js';

export class GetServerDomainsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_server_domains';
  }

  get description(): string {
    return 'Get a list of domains configured for a server. These domains are used for routing traffic to applications and services.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServerDomainsSchema;
  }

  async execute(args: z.infer<typeof GetServerDomainsSchema>): Promise<string> {
    this.logger.info('Fetching server domains', { uuid: args.server_uuid });

    const domains = await this.apiGet(`/servers/${args.server_uuid}/domains`);

    if (!Array.isArray(domains) || domains.length === 0) {
      return 'No domains found for this server.';
    }

    this.logger.info(`Found ${domains.length} domain(s)`);

    return this.formatResponse(domains);
  }
}
