/**
 * Get Service Domains Tool
 * Retrieves all domains configured for a service
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetServiceDomainsSchema = z.object({
  uuid: z.string().describe('UUID of the service'),
});

export class GetServiceDomainsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_service_domains';
  }

  get description(): string {
    return 'Get all domains configured for a service including custom domains and SSL configuration.';
  }

  get inputSchema(): z.ZodSchema {
    return GetServiceDomainsSchema;
  }

  async execute(args: z.infer<typeof GetServiceDomainsSchema>): Promise<string> {
    this.logger.info(`Fetching domains for service: ${args.uuid}`);

    try {
      const domains = await this.apiGet(`/services/${args.uuid}/domains`);

      this.logger.info(`Successfully fetched domains for service: ${args.uuid}`);

      return this.formatResponse(domains);
    } catch (error: any) {
      this.logger.error(`Failed to fetch domains for service ${args.uuid}`, error);
      throw new Error(`Failed to get service domains: ${error.message}`);
    }
  }
}
