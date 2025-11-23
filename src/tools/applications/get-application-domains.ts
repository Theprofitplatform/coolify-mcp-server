/**
 * Get Application Domains Tool
 * Retrieves all domains configured for an application
 */

import { z } from 'zod';
import { BaseTool } from '../base.js';

const GetApplicationDomainsSchema = z.object({
  uuid: z.string().describe('UUID of the application'),
});

export class GetApplicationDomainsTool extends BaseTool {
  constructor(apiClient: any, version?: any) {
    super(apiClient, version);
    this.initLogger();
  }

  get name(): string {
    return 'get_application_domains';
  }

  get description(): string {
    return 'Get all domains configured for an application including custom domains and SSL configuration.';
  }

  get inputSchema(): z.ZodSchema {
    return GetApplicationDomainsSchema;
  }

  async execute(args: z.infer<typeof GetApplicationDomainsSchema>): Promise<string> {
    this.logger.info(`Fetching domains for application: ${args.uuid}`);

    try {
      const domains = await this.apiGet(`/applications/${args.uuid}/domains`);

      this.logger.info(`Successfully fetched domains for application: ${args.uuid}`);

      return this.formatResponse(domains);
    } catch (error: any) {
      this.logger.error(`Failed to fetch domains for application ${args.uuid}`, error);
      throw new Error(`Failed to get application domains: ${error.message}`);
    }
  }
}
